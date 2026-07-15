from abc import ABC, abstractmethod

from app.services.llm import get_llm
import time
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """
    Parent class for all agents.
    """

    def __init__(self):

        self.llm = get_llm()

    @abstractmethod
    def build_prompt(self, state):

        """
        Every agent must implement
        its own prompt.
        """
        pass

    def run(self, state):

        agent_name = self.__class__.__name__

        start = time.time()

        try:

            prompt = self.build_prompt(state)

            MAX_RETRIES = 3

            for attempt in range(MAX_RETRIES):

                try:

                    response = self.llm.invoke(prompt)

                    return response.content

                except Exception:

                    if attempt == MAX_RETRIES - 1:

                        raise
            state["agent_status"][agent_name] = "SUCCESS"

            logger.info(f"{agent_name} completed")

            return response.content

        except Exception as e:

            state["agent_status"][agent_name] = "FAILED"

            state["errors"][agent_name] = str(e)

            logger.exception(e)

            raise

        finally:

            logger.info(

                f"{agent_name} took {time.time()-start:.2f}s"

            )

