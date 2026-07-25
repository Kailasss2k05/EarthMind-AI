from dataclasses import dataclass


@dataclass
class BudgetInput:
    equipment_cost: float
    labor_cost: float
    land_cost: float = 0.0
    other_cost: float = 0.0
    subsidy: float = 0.0
    annual_maintenance: float = 0.0
    annual_savings: float = 0.0
    project_lifetime: int = 20


class BudgetTool:

    @staticmethod
    def total_cost(data: BudgetInput) -> float:
        return (
            data.equipment_cost
            + data.labor_cost
            + data.land_cost
            + data.other_cost
        )

    @staticmethod
    def net_investment(data: BudgetInput) -> float:
        return BudgetTool.total_cost(data) - data.subsidy

    @staticmethod
    def payback_period(data: BudgetInput) -> float | None:
        annual_profit = (
            data.annual_savings - data.annual_maintenance
        )

        if annual_profit <= 0:
            return None

        return round(
            BudgetTool.net_investment(data) / annual_profit,
            2,
        )

    @staticmethod
    def roi(data: BudgetInput) -> float | None:
        investment = BudgetTool.net_investment(data)

        if investment <= 0:
            return None

        total_profit = (
            (data.annual_savings - data.annual_maintenance)
            * data.project_lifetime
        )

        roi = (total_profit / investment) * 100

        return round(roi, 2)

    @staticmethod
    def lifetime_savings(data: BudgetInput) -> float:
        return (
            (data.annual_savings - data.annual_maintenance)
            * data.project_lifetime
        )

    @staticmethod
    def analyze(data: BudgetInput) -> dict:

        total_cost = BudgetTool.total_cost(data)
        net_investment = BudgetTool.net_investment(data)
        payback = BudgetTool.payback_period(data)
        roi = BudgetTool.roi(data)
        lifetime = BudgetTool.lifetime_savings(data)

        return {
            "total_cost": round(total_cost, 2),
            "subsidy": round(data.subsidy, 2),
            "net_investment": round(net_investment, 2),
            "annual_savings": round(data.annual_savings, 2),
            "annual_maintenance": round(data.annual_maintenance, 2),
            "project_lifetime": data.project_lifetime,
            "payback_period_years": payback,
            "roi_percent": roi,
            "lifetime_savings": round(lifetime, 2),
        }