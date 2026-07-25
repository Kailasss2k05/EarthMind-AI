import json

from app.core.base_agent import BaseAgent
from app.core.utils import build_references_from_chunks
from app.prompts.environmental_prompt import ENVIRONMENTAL_PROMPT

from app.tools.carbon import CarbonInput, CarbonTool
from app.tools.maps import MapsTool, LocationInput
from app.tools.weather import WeatherTool, WeatherInput
from app.tools.executor import execute_tool_with_metadata


class EnvironmentalAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        # ----------------------------------------------------
        # Carbon Tool
        # ----------------------------------------------------
        carbon_data = state.get("carbon_input", {})

        carbon = CarbonInput(
            electricity_kwh=carbon_data.get("electricity_kwh", 0),
            diesel_liters=carbon_data.get("diesel_liters", 0),
            petrol_liters=carbon_data.get("petrol_liters", 0),
            distance_km=carbon_data.get("distance_km", 0),
            waste_kg=carbon_data.get("waste_kg", 0),
        )

        carbon_analysis = execute_tool_with_metadata(
            state,
            "CarbonTool",
            "Environmental",
            CarbonTool.calculate,
            carbon,
        )

        # ----------------------------------------------------
        # Maps Tool
        # ----------------------------------------------------
        location = state.get("location", "")

        if location:
            location_analysis = execute_tool_with_metadata(
                state,
                "MapsTool",
                "Environmental",
                MapsTool.geocode,
                LocationInput(location=location),
            )
        else:
            location_analysis = {
                "success": False,
                "message": "No location provided."
            }

        # ----------------------------------------------------
        # Weather Tool
        # ----------------------------------------------------
        if (
            location_analysis.get("success")
            and location_analysis.get("latitude") is not None
            and location_analysis.get("longitude") is not None
        ):

            weather_analysis = execute_tool_with_metadata(
                state,
                "WeatherTool",
                "Environmental",
                WeatherTool.get_weather,
                WeatherInput(
                    latitude=location_analysis["latitude"],
                    longitude=location_analysis["longitude"],
                ),
            )

        else:
            weather_analysis = {
                "success": False,
                "message": "Weather could not be retrieved because location is unavailable."
            }

        # ----------------------------------------------------
        # Prompt
        # ----------------------------------------------------
        return ENVIRONMENTAL_PROMPT.format(
            query=state.get("query", ""),

            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),

            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2,
            ),

            policy_output=json.dumps(
                outputs.get("policy", {}),
                indent=2,
            ),

            carbon_analysis=json.dumps(
                carbon_analysis,
                indent=2,
            ),

            location_analysis=json.dumps(
                location_analysis,
                indent=2,
            ),

            weather_analysis=json.dumps(
                weather_analysis,
                indent=2,
            ),

            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )

    def run(self, state: dict) -> dict:
        """
        Run Environmental Agent.

        If the model returns no references,
        populate them from retrieved_context.
        """

        result = super().run(state)

        if isinstance(result, dict) and not result.get("references"):
            chunks = state.get("retrieved_context", [])
            result["references"] = build_references_from_chunks(chunks)

        return result