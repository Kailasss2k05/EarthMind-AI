from dataclasses import dataclass
import requests


@dataclass
class SearchInput:
    query: str
    max_results: int = 5


class SearchTool:

    BASE_URL = "https://api.duckduckgo.com/"

    @staticmethod
    def search(data: SearchInput):

        params = {
            "q": data.query,
            "format": "json"
        }

        try:
            response = requests.get(
                SearchTool.BASE_URL,
                params=params,
                timeout=10,
            )

            response.raise_for_status()

            result = response.json()

            return {
                "success": True,
                "heading": result.get("Heading"),
                "abstract": result.get("Abstract"),
                "related_topics": result.get("RelatedTopics", [])
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }