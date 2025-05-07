# path: app/core/logging.py

import logging
import sys
import json
from logging.handlers import RotatingFileHandler
from app.core.config import settings


class JsonFormatter(logging.Formatter):
    """JSON 포맷 로그 저장용 핸들러"""

    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        return json.dumps(log_record, ensure_ascii=False)


class ColoredFormatter(logging.Formatter):
    """터미널 컬러 출력용 포맷"""

    COLORS = {
        "DEBUG": "\033[36m",  # 청록색
        "INFO": "\033[32m",  # 초록색
        "WARNING": "\033[33m",  # 노란색
        "ERROR": "\033[31m",  # 빨간색
        "CRITICAL": "\033[41m",  # 배경 빨간색
        "RESET": "\033[0m",
    }

    def format(self, record):
        log_msg = super().format(record)
        color = self.COLORS.get(record.levelname, self.COLORS["RESET"])
        return f"{color}{log_msg}{self.COLORS['RESET']}"


def setup_logging():
    """환경에 따라 로깅 설정을 다르게 적용"""
    log_format = "%(asctime)s | %(levelname)-8s | %(message)s"  # ✅ %(name)s 제거
    date_format = "%Y-%m-%d %H:%M:%S"

    root_logger = logging.getLogger()  # ✅ 루트 로거 사용
    root_logger.setLevel(
        logging.DEBUG if settings.ENVIRONMENT == "local" else logging.INFO
    )

    # ✅ FastAPI에서 추가된 핸들러 제거
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    # ✅ 터미널 핸들러 (컬러 적용)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ColoredFormatter(fmt=log_format, datefmt=date_format))
    root_logger.addHandler(console_handler)

    # ✅ 운영 환경에서는 JSON 로그 파일 저장
    if settings.ENVIRONMENT != "local":
        file_handler = RotatingFileHandler(
            "app.log", maxBytes=5 * 1024 * 1024, backupCount=5
        )
        file_handler.setFormatter(JsonFormatter())
        root_logger.addHandler(file_handler)

    # ✅ MongoDB 관련 로깅 레벨을 WARNING 이상으로 변경 (하트비트 로그 제거)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("beanie").setLevel(logging.WARNING)
    logging.getLogger("pymongo").setLevel(logging.WARNING)

    # logging.info(f"✅ 로깅이 초기화되었습니다. 환경: {settings.ENVIRONMENT}")
