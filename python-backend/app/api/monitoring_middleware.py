"""
Monitoring Middleware — FastAPI ASGI middleware for request observability.

Responsibilities:
  1. Inject a unique request-ID into every request context
  2. Log every incoming request and outgoing response
  3. Measure total request duration
  4. Record all metrics into MetricsStore
  5. Alert on slow requests (>5 s)
  6. Propagate request-ID in response headers for client tracing
"""
import time
import uuid
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.utils.logger import set_request_id, get_request_id
from app.utils.metrics import metrics

logger = logging.getLogger("app.monitoring")

# Paths we skip (no noise from health/metrics endpoints)
SKIP_PATHS = {"/health", "/metrics", "/favicon.ico", "/docs", "/openapi.json", "/redoc"}


class MonitoringMiddleware(BaseHTTPMiddleware):
    """
    Drop-in ASGI middleware — add to app before other middlewares.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # ── Skip noisy utility paths ──────────────────────────────────────
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        # ── Assign request-ID ──────────────────────────────────────────────
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        set_request_id(request_id)

        # ── Log incoming request ───────────────────────────────────────────
        logger.info(
            f"→ {request.method} {request.url.path}",
            extra={"request_id": request_id},
        )

        # ── Initialize State for back-filling ──────────────────────────────
        request.state.intent = None
        request.state.agents = []

        start = time.perf_counter()
        error_msg = None
        status_code = 500

        try:
            response: Response = await call_next(request)
            status_code = response.status_code
        except Exception as exc:
            error_msg = str(exc)
            logger.exception(f"Unhandled exception on {request.url.path}")
            raise
        finally:
            elapsed_ms = (time.perf_counter() - start) * 1000
            elapsed_s  = elapsed_ms / 1000

            # ── Log outgoing response ──────────────────────────────────────
            level = logging.WARNING if status_code >= 400 else logging.INFO
            logger.log(
                level,
                f"← {status_code} {request.method} {request.url.path} "
                f"[{elapsed_ms:.0f} ms]",
                extra={"status": status_code, "duration_ms": elapsed_ms},
            )

            # ── Slow request alert ─────────────────────────────────────────
            if elapsed_s > 5.0:
                logger.warning(
                    f"🐢 SLOW REQUEST: {request.url.path} took {elapsed_s:.2f}s",
                    extra={"duration_s": elapsed_s},
                )

            # ── Record to metrics store ────────────────────────────────────
            metrics.record_request(
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                status_code=status_code,
                duration_ms=elapsed_ms,
                intent=getattr(request.state, "intent", None),
                agents_used=getattr(request.state, "agents", []),
                error=error_msg,
            )


        # ── Propagate request-ID in response header ────────────────────────
        response.headers["X-Request-ID"] = request_id
        return response
