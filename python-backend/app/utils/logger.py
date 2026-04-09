"""
Logging Module — Production-grade logging configuration.

Features:
  1. Clean human-readable format: [time] | [level] | [msg]
  2. Request-ID tracing via contextvars (Contextual logging)
  3. Seamless Uvicorn integration (Fixes %(message)s issue)
  4. Optional JSON formatting for log aggregators (ELK/Splunk)
"""
import logging
import sys
import json
import os
from datetime import datetime, timezone
from typing import Optional
from contextvars import ContextVar

# ── Context variable for Request-ID propagation ────────────────────────────────
_request_id_var: ContextVar[str] = ContextVar("request_id", default="MAIN")

def set_request_id(request_id: str) -> None:
    _request_id_var.set(request_id)

def get_request_id() -> str:
    return _request_id_var.get()


# ── Custom Formatters ──────────────────────────────────────────────────────────

class CustomConsoleFormatter(logging.Formatter):
    """
    Requested Format: %(asctime)s | %(levelname)s | %(message)s
    Enhanced with Request-ID for better debugging.
    """
    
    # ANSI Colors for terminal visibility
    COLORS = {
        logging.DEBUG:    "\033[0;36m", # Cyan
        logging.INFO:     "\033[0;32m", # Green
        logging.WARNING:  "\033[0;33m", # Yellow
        logging.ERROR:    "\033[0;31m", # Red
        logging.CRITICAL: "\033[0;35m", # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        # ── Global Silence Filter (for presentation readiness) ──────────────
        # Suppress persistent library spam that bypasses standard level filters
        if "posthog" in record.name or "telemetry" in record.getMessage().lower():
            return ""

        # Time format: HH:MM:SS
        log_time = datetime.fromtimestamp(record.created).strftime("%H:%M:%S")
        
        # Level formatting
        level_name = record.levelname.ljust(7)
        color = self.COLORS.get(record.levelno, self.RESET)
        
        # Request ID (truncated for brevity)
        rid = get_request_id()
        rid_str = f" | {rid[:8]}" if rid != "MAIN" else ""

        # Map logger names for better demo visibility
        logger_name = record.name.split('.')[-1]
        name_map = {"error": "UV_ERR", "access": "UV_ACC", "main": "APP_MAIN"}
        display_name = name_map.get(logger_name, logger_name).ljust(10)

        # Construct final line
        line = f"{log_time} | {color}{level_name}{self.RESET}{rid_str} | {display_name} | {record.getMessage()}"
        
        if record.exc_info:
            line += "\n" + self.formatException(record.exc_info)
        return line


class JSONFormatter(logging.Formatter):
    """Compact JSON for production logging."""
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "request_id": get_request_id(),
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


# ── Logging Configuration Bootstrap ──────────────────────────────────────────

def configure_logging(level: Optional[str] = None):
    """
    Bootstrap logging. Handles Uvicorn log interception to avoid the %(message)s bug.
    """
    log_level = (level or os.getenv("LOG_LEVEL", "INFO")).upper()
    json_enabled = os.getenv("JSON_LOGS", "false").lower() == "true"

    # 1. Create standardized handler
    handler = logging.StreamHandler(sys.stdout)
    if json_enabled:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(CustomConsoleFormatter())

    # 2. Reset root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers = [handler]

    # 3. Intercept & Reconfigure Uvicorn Loggers
    # This is the key to fixing the "%(message)s" issue.
    # We force them to use our handler and stop them from using their default config.
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        log = logging.getLogger(logger_name)
        log.handlers = [handler]
        log.propagate = False  # Avoid duplicate logs via root

    # 4. Silence noisy background libraries
    for noisy in ("httpx", "httpcore", "chromadb", "asyncio", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    
    # Strictly disable posthog (ChromaDB telemetry) warnings/errors
    ph_log = logging.getLogger("posthog")
    ph_log.setLevel(logging.CRITICAL)
    ph_log.disabled = True

    logging.info(f"Logging initialized (level={log_level}, json={json_enabled})")


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
