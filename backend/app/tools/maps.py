from dataclasses import dataclass
import requests


@dataclass
class LocationInput:
    location: str


class MapsTool:

    BASE_URL = "https://nominatim.openstreetmap.org/search"

    @staticmethod
    def geocode(data: LocationInput) -> dict:
        """
        Convert a location name into coordinates
        using OpenStreetMap Nominatim.
        """

        headers = {
            "User-Agent": "EarthMind-AI/1.0"
        }

        params = {
            "q": data.location,
            "format": "json",
            "limit": 1
        }

        try:
            response = requests.get(
                MapsTool.BASE_URL,
                headers=headers,
                params=params,
                timeout=10
            )

            response.raise_for_status()

            results = response.json()

            if not results:
                return {
                    "success": False,
                    "message": "Location not found"
                }

            place = results[0]

            return {
                "success": True,
                "location": place["display_name"],
                "latitude": float(place["lat"]),
                "longitude": float(place["lon"])
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }