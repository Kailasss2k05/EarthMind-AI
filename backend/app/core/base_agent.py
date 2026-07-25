import json
import logging
import re
from abc import ABC, abstractmethod

from json_repair import repair_json
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.utils import calculate_confidence, fallback_response

logger = logging.getLogger(__name__)

# Exceptions that should NEVER be retried — re-raise immediately (M-7)
_NON_RETRYABLE = (
    MemoryError,
    KeyboardInterrupt,
    SystemExit,
    GeneratorExit,
)


class BaseAgent(ABC):

    returns_json = True

    def __init__(self, llm):
        self.llm = llm

    @abstractmethod
    def build_prompt(self, state):
        pass

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    def invoke_llm(self, prompt):
        """
        Automatically retries LLM invocation on transient failures.

        Non-retryable exceptions (MemoryError, KeyboardInterrupt, etc.)
        are re-raised immediately without consuming retry budget (M-7).

        Attempts:
            1
            2 (after 2 sec)
            3 (after 4 sec)
        """
        try:
            return self.llm.invoke(prompt)
        except _NON_RETRYABLE:
            raise
        except Exception:
            raise  # tenacity will retry

    def run(self, state):

        prompt = self.build_prompt(state)

        try:

            response = self.invoke_llm(prompt)

            content = response.content.strip()

            if not self.returns_json:
                return content

            logger.debug(
                "%s RAW OUTPUT:\n%s",
                self.__class__.__name__,
                content,
            )

            # Remove markdown fences
            content = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
            content = re.sub(r"^```\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            # Extract JSON
            match = re.search(r"\{.*\}", content, re.DOTALL)

            if not match:
                raise json.JSONDecodeError(
                    "No JSON object found",
                    content,
                    0,
                )

            json_text = repair_json(match.group(0))

            result = json.loads(json_text)

            # Ensure the result is a JSON object
            if not isinstance(result, dict):
                raise ValueError(
                    f"{self.__class__.__name__} must return a JSON object, got {type(result).__name__}"
                )

            # Calculate confidence
            result["confidence_score"] = calculate_confidence(result)

            return result

        except _NON_RETRYABLE:
            # Never swallow critical system exceptions
            raise

        except json.JSONDecodeError as e:

            logger.error(
                "%s returned invalid JSON.\n%s",
                self.__class__.__name__,
                content,
            )

            return fallback_response(
                self.__class__.__name__.replace("Agent", "").lower(),
                str(e),
            )

        except Exception as e:

            logger.exception(
                "%s failed after all retry attempts.",
                self.__class__.__name__,
            )

            return fallback_response(
                self.__class__.__name__.replace("Agent", "").lower(),
                str(e),
            )