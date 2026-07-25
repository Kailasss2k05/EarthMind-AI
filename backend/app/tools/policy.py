from dataclasses import dataclass


@dataclass
class PolicyInput:
    project_type: str
    location: str
    capacity_kw: float = 0
    land_area_sq_m: float = 0
    protected_area: bool = False


class PolicyTool:

    @staticmethod
    def analyze(data: PolicyInput) -> dict:
        compliance = []
        warnings = []
        subsidies = []

        # Example Rule 1
        if data.protected_area:
            warnings.append(
                "Project is located in a protected area. Additional environmental clearance may be required."
            )

        # Example Rule 2
        if data.project_type.lower() == "solar":
            subsidies.append(
                "Project may be eligible for government rooftop solar subsidy schemes."
            )

        # Example Rule 3
        if data.capacity_kw > 500:
            compliance.append(
                "Large-scale project may require state regulatory approval."
            )
        else:
            compliance.append(
                "Capacity is within the small-scale project threshold."
            )

        return {
            "project_type": data.project_type,
            "location": data.location,
            "capacity_kw": data.capacity_kw,
            "compliance": compliance,
            "warnings": warnings,
            "subsidies": subsidies,
        }