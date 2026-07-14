from abc import ABC, abstractmethod

from app.services.llm import get_llm


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

        prompt = self.build_prompt(state)

        for attempt in range(3):

            try:

                response = self.llm.invoke(prompt)

                return response.content

            except Exception as e:

                print(

                    f"Retry {attempt+1}",

                    e

                )

        raise Exception(

            "Agent failed after 3 retries"

        )

