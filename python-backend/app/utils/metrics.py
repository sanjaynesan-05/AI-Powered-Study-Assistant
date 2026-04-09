"""
Metrics Store — lightweight in-process performance tracking.

Tracks:
  • Per-request timing (start → end, status)
  • Per-agent timing & success rate
  • Per-model call count and avg latency
  • Slow-request registry (>5 s threshold)
  • Global error counter

Thread-safe for use in async FastAPI handlers.
All storage is in-memory: fast, zero-dependency.
Optional Redis persistence hook left as commented stub.
"""
import time
import threading
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any, Deque, Dict, List, Optional


# ── Configuration ────────────────────────────────────────────────────────────

SLOW_REQUEST_THRESHOLD_S = 5.0   # flag requests taking longer than this
MAX_RECENT_REQUESTS = 200         # rolling window kept in memory


# ── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class RequestRecord:
    request_id: str
    method: str
    path: str
    intent: Optional[str]
    agents_used: List[str]
    status_code: int
    duration_ms: float
    timestamp: float = field(default_factory=time.time)
    error: Optional[str] = None

    @property
    def is_slow(self) -> bool:
        return self.duration_ms > SLOW_REQUEST_THRESHOLD_S * 1000


@dataclass
class AgentStat:
    name: str
    total_calls: int = 0
    total_duration_ms: float = 0.0
    success_count: int = 0
    failure_count: int = 0

    @property
    def avg_duration_ms(self) -> float:
        return self.total_duration_ms / self.total_calls if self.total_calls else 0.0

    @property
    def success_rate(self) -> float:
        return self.success_count / self.total_calls if self.total_calls else 0.0


@dataclass
class ModelStat:
    model: str
    total_calls: int = 0
    total_duration_ms: float = 0.0

    @property
    def avg_duration_ms(self) -> float:
        return self.total_duration_ms / self.total_calls if self.total_calls else 0.0


# ── Metrics Store ────────────────────────────────────────────────────────────

class MetricsStore:
    """
    Central collector for all observability data.
    All public methods are thread-safe via a reentrant lock.
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()

        # Counters
        self.total_requests: int = 0
        self.error_count: int = 0
        self.total_duration_ms: float = 0.0

        # Per-intent counter
        self.intent_counts: Dict[str, int] = defaultdict(int)

        # Agent stats: name → AgentStat
        self.agent_stats: Dict[str, AgentStat] = {}

        # Model stats: model_tag → ModelStat
        self.model_stats: Dict[str, ModelStat] = {}

        # Rolling window of recent requests
        self.recent_requests: Deque[RequestRecord] = deque(maxlen=MAX_RECENT_REQUESTS)

        # Slow requests (separate list for fast querying)
        self.slow_requests: Deque[RequestRecord] = deque(maxlen=50)

    # ── Request-level recording ──────────────────────────────────────────────

    def record_request(
        self,
        request_id: str,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        intent: Optional[str] = None,
        agents_used: Optional[List[str]] = None,
        error: Optional[str] = None,
    ) -> None:
        record = RequestRecord(
            request_id=request_id,
            method=method,
            path=path,
            intent=intent,
            agents_used=agents_used or [],
            status_code=status_code,
            duration_ms=duration_ms,
            error=error,
        )
        with self._lock:
            self.total_requests += 1
            self.total_duration_ms += duration_ms
            if error or status_code >= 500:
                self.error_count += 1
            if intent:
                self.intent_counts[intent] += 1
            self.recent_requests.append(record)
            if record.is_slow:
                self.slow_requests.append(record)

    # ── Agent-level recording ────────────────────────────────────────────────

    def record_agent(
        self,
        agent_name: str,
        duration_ms: float,
        success: bool,
    ) -> None:
        with self._lock:
            if agent_name not in self.agent_stats:
                self.agent_stats[agent_name] = AgentStat(name=agent_name)
            stat = self.agent_stats[agent_name]
            stat.total_calls += 1
            stat.total_duration_ms += duration_ms
            if success:
                stat.success_count += 1
            else:
                stat.failure_count += 1

    # ── Model-level recording ────────────────────────────────────────────────

    def record_model_call(self, model: str, duration_ms: float) -> None:
        with self._lock:
            if model not in self.model_stats:
                self.model_stats[model] = ModelStat(model=model)
            stat = self.model_stats[model]
            stat.total_calls += 1
            stat.total_duration_ms += duration_ms

    # ── Snapshot (read) ──────────────────────────────────────────────────────

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            avg_ms = (
                self.total_duration_ms / self.total_requests
                if self.total_requests else 0.0
            )
            slow_list = [
                {
                    "request_id": r.request_id,
                    "path": r.path,
                    "duration_ms": round(r.duration_ms, 1),
                    "intent": r.intent,
                    "agents": r.agents_used,
                    "ts": r.timestamp,
                }
                for r in list(self.slow_requests)[-10:]   # last 10
            ]
            agent_data = {
                name: {
                    "total_calls": s.total_calls,
                    "avg_duration_ms": round(s.avg_duration_ms, 1),
                    "success_rate": round(s.success_rate, 3),
                    "failures": s.failure_count,
                }
                for name, s in self.agent_stats.items()
            }
            model_data = {
                tag: {
                    "total_calls": s.total_calls,
                    "avg_duration_ms": round(s.avg_duration_ms, 1),
                }
                for tag, s in self.model_stats.items()
            }
            return {
                "total_requests": self.total_requests,
                "error_count": self.error_count,
                "avg_response_ms": round(avg_ms, 1),
                "slow_request_count": len(self.slow_requests),
                "slow_request_threshold_s": SLOW_REQUEST_THRESHOLD_S,
                "intent_distribution": dict(self.intent_counts),
                "agents": agent_data,
                "models": model_data,
                "slow_requests": slow_list,
            }

    def reset(self) -> None:
        """Wipe all metrics (useful in tests)."""
        with self._lock:
            self.__init__()


# Singleton
metrics = MetricsStore()
