import json
import logging
import re
from abc import ABC, abstractmethod

from json_repair import repair_json

# Import confidence calculator
from app.core.utils import calculate_confidence

logger = logging.getLogger(__name__)


class BaseAgent(ABC):

    # ReportAgent overrides this to False
    returns_json = True

    def __init__(self, llm):
        self.llm = llm

    @abstractmethod
    def build_prompt(self, state):
        pass

    def run(self, state):

        prompt = self.build_prompt(state)

        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()

            # ReportAgent returns Markdown
            if not self.returns_json:
                return content

            # Debug (remove later)
            print(f"\n===== {self.__class__.__name__} RAW OUTPUT =====")
            print(content)
            print("==============================================\n")

            # Remove markdown fences
            content = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
            content = re.sub(r"^```\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            # Extract first JSON object
            match = re.search(r"\{.*\}", content, re.DOTALL)

            if not match:
                raise json.JSONDecodeError(
                    "No JSON object found",
                    content,
                    0,
                )

            json_text = match.group(0)

            json_text = repair_json(json_text)

            result = json.loads(json_text)

            # ----------------------------
            # Calculate confidence in Python
            # ----------------------------
            result["confidence_score"] = calculate_confidence(result)

            return result

        except json.JSONDecodeError as e:

            logger.error(
                "%s returned invalid JSON.\n\nJSON:\n%s\n",
                self.__class__.__name__,
                content,
            )

            return {
                "agent": self.__class__.__name__.replace("Agent", "").lower(),
                "status": "failed",
                "confidence_score": 0.0,
                "summary": "Agent returned invalid JSON.",
                "findings": [],
                "recommendations": [],
                "missing_information": [],
                "references": [],
                "error": str(e),
            }

        except Exception as e:

            logger.exception("%s failed.", self.__class__.__name__)

            return {
                "agent": self.__class__.__name__.replace("Agent", "").lower(),
                "status": "failed",
                "confidence_score": 0.0,
                "summary": "Agent execution failed.",
                "findings": [],
                "recommendations": [],
                "missing_information": [],
                "references": [],
                "error": str(e),
            }