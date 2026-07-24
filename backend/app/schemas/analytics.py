from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import date

class TimeSeriesDataPoint(BaseModel):
    date: str = Field(description="Date or period identifier (e.g. YYYY-MM-DD for daily)")
    value: int

class AgentStats(BaseModel):
    executions: int
    last_run: Optional[str] = None
    average_execution_time: float = 0.0

class AnalyticsTimeBucket(BaseModel):
    queries_per_period: List[TimeSeriesDataPoint]
    reports_generated_per_period: List[TimeSeriesDataPoint]
    documents_uploaded_per_period: List[TimeSeriesDataPoint]
    knowledge_growth_per_period: List[TimeSeriesDataPoint]

class AnalyticsResponse(BaseModel):
    daily: AnalyticsTimeBucket
    weekly: AnalyticsTimeBucket
    monthly: AnalyticsTimeBucket
    documents_per_domain: Dict[str, int]
    chunks_per_domain: Dict[str, int]
    agent_statistics: Dict[str, AgentStats]
