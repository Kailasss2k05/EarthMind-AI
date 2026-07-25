from sqlalchemy.orm import Session
from app.models.query_history import QueryHistory
from app.models.report_history import ReportHistory
from app.core.logger import logger


class AgentService:
    def get_agent_status(self, db: Session) -> dict:
        """
        Returns the operational status and execution metrics for all agents.

        Note (C-5): These statistics are estimated from QueryHistory records.
        The database does not store individual per-agent execution logs, so
        domain agents (Environmental, Finance, Risk, etc.) always appear with
        0 executions. The 'estimated' flag signals UI clients to show a
        disclaimer. A proper implementation requires an agent_runs table.
        """
        queries = db.query(QueryHistory).all()

        agent_names = ["planner", "research", "policy", "environmental", "finance", "risk", "timeline", "report", "sdg"]
        stats = {
            name: {"executions": 0, "total_time": 0.0, "last_run": None}
            for name in agent_names
        }

        for q in queries:
            # Heuristic: classify as 'planner' if planner_output present, else 'research'.
            agent = "planner" if q.planner_output else "research"

            stats[agent]["executions"] += 1
            stats[agent]["total_time"] += (q.execution_time or 0)

            q_date = q.created_at.isoformat() if hasattr(q.created_at, "isoformat") else str(q.created_at)
            if not stats[agent]["last_run"] or q_date > stats[agent]["last_run"]:
                stats[agent]["last_run"] = q_date

        # Report agent: count from ReportHistory (accurate)
        reports = db.query(ReportHistory).all()
        for r in reports:
            stats["report"]["executions"] += 1
            r_date = r.created_at.isoformat() if hasattr(r.created_at, "isoformat") else str(r.created_at)
            if not stats["report"]["last_run"] or r_date > stats["report"]["last_run"]:
                stats["report"]["last_run"] = r_date

        # Assemble response
        response = {}
        for agent in agent_names:
            execs = stats[agent]["executions"]
            avg_time = stats[agent]["total_time"] / execs if execs else 0.0
            response[agent] = {
                "status": "ready",
                "executions": execs,
                "last_run": stats[agent]["last_run"],
                "average_execution_time": avg_time,
                "estimated": agent not in ("report",),  # report count is accurate; others are estimated
            }

        return response


agent_service = AgentService()
