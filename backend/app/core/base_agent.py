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

from app.core.utils import calculate_confidence,fallback_response

logger = logging.getLogger(__name__)


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
        Automatically retries LLM invocation.

        Attempts:
            1
            2 (after 2 sec)
            3 (after 4 sec)
        """

        return self.llm.invoke(prompt)

    def run(self, state):

        prompt = self.build_prompt(state)

        try:

            response = self.invoke_llm(prompt)

            content = response.content.strip()

            if not self.returns_json:
                return content

            print(f"\n===== {self.__class__.__name__} RAW OUTPUT =====")
            print(content)
            print("==============================================\n")

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

            if not isinstance(result, dict):
                raise json.JSONDecodeError(
                    "Parsed JSON is not a dictionary.",
                    json_text,
                    0,
                )

            # Calculate confidence
            result["confidence_score"] = calculate_confidence(result)

            return result

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