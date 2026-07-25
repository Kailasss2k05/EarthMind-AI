from dataclasses import dataclass


@dataclass
class CarbonInput:
    electricity_kwh: float = 0
    diesel_liters: float = 0
    petrol_liters: float = 0
    distance_km: float = 0
    waste_kg: float = 0

EMISSION_FACTORS = {
    "electricity": 0.82,      # kg CO₂ per kWh
    "diesel": 2.68,           # kg CO₂ per litre
    "petrol": 2.31,           # kg CO₂ per litre
    "transport": 0.12,        # kg CO₂ per km
    "waste": 0.45             # kg CO₂ per kg
}

class CarbonTool:

    @staticmethod
    def calculate(data: CarbonInput):

        electricity = (
            data.electricity_kwh
            * EMISSION_FACTORS["electricity"]
        )

        diesel = (
            data.diesel_liters
            * EMISSION_FACTORS["diesel"]
        )

        petrol = (
            data.petrol_liters
            * EMISSION_FACTORS["petrol"]
        )

        transport = (
            data.distance_km
            * EMISSION_FACTORS["transport"]
        )

        waste = (
            data.waste_kg
            * EMISSION_FACTORS["waste"]
        )

        total = (
            electricity
            + diesel
            + petrol
            + transport
            + waste
        )

        return {
            "electricity_emission": round(electricity, 2),
            "diesel_emission": round(diesel, 2),
            "petrol_emission": round(petrol, 2),
            "transport_emission": round(transport, 2),
            "waste_emission": round(waste, 2),
            "total_emission": round(total, 2),
        }

