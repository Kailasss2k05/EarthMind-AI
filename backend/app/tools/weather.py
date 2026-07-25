from dataclasses import dataclass
import requests


@dataclass
class WeatherInput:
    latitude: float
    longitude: float


class WeatherTool:

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def get_weather(data: WeatherInput) -> dict:

        params = {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "wind_speed_10m"
            ]
        }

        try:
            response = requests.get(
                WeatherTool.BASE_URL,
                params=params,
                timeout=10,
            )

            response.raise_for_status()

            weather = response.json()["current"]

            return {
                "success": True,
                "temperature": weather["temperature_2m"],
                "humidity": weather["relative_humidity_2m"],
                "precipitation": weather["precipitation"],
                "wind_speed": weather["wind_speed_10m"],
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }