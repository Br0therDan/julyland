# path: app/exceptions/handlers.py

import logging
import time
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.schemas.response import ResponseSchema, ValidationErrorResponseSchema

# ✅ 컬러 설정
COLORS = {
    "DEBUG": "\033[36m",
    "INFO": "\033[32m",
    "WARNING": "\033[33m",
    "ERROR": "\033[31m",
    "CRITICAL": "\033[41m",
    "RESET": "\033[0m",
}

logger = logging.getLogger()  # ✅ 루트 로거 사용


def colored_log(level: str, message: str):
    """터미널 컬러 로그 적용"""
    color = COLORS.get(level, COLORS["RESET"])
    return f"{color}{message}{COLORS['RESET']}"


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Pydantic Validation Error Handler"""
    errors = [
        {
            "loc": " → ".join(map(str, err["loc"])),
            "msg": err["msg"],
            "type": err["type"],
        }
        for err in exc.errors()
    ]

    logger.warning(
        colored_log("WARNING", f"🚨 Validation Error: {errors}"), exc_info=True
    )

    return JSONResponse(
        status_code=422,
        content=ValidationErrorResponseSchema(
            success=False,
            message="입력 데이터 검증 오류",
            data=errors,
            error_code="VALIDATION_ERROR",
        ).model_dump(),
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """FastAPI 기본 HTTPException 처리"""
    logger.warning(
        colored_log(
            "ERROR",
            f"🔥 HTTP Exception [{type(exc).__name__}]: {exc.detail} (status: {exc.status_code})",
        ),
        exc_info=True,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=ResponseSchema(
            success=False,
            message=exc.detail,
            data=None,
            error_code=str(exc.status_code),
        ).model_dump(),
    )


async def global_exception_handler(request: Request, exc: Exception):
    """서버 내부 오류 처리"""
    logger.critical(
        colored_log("CRITICAL", f"💥 Server Error [{type(exc).__name__}]: {str(exc)}"),
        exc_info=True,
    )

    return JSONResponse(
        status_code=500,
        content=ResponseSchema(
            success=False,
            message="서버 내부 오류가 발생했습니다.",
            data=None,
            error_code="SERVER_ERROR",
        ).model_dump(),
    )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """API 요청 로깅 미들웨어"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        logger.info(
            colored_log("INFO", f"➡️ [{request.method}] {request.url} 요청 시작")
        )

        response = await call_next(request)
        process_time = time.time() - start_time

        status_color = "INFO" if response.status_code < 400 else "ERROR"
        logger.info(
            colored_log(
                status_color,
                f"✅ [{request.method}] {request.url} -> {response.status_code} (처리 시간: {process_time:.2f}s)",
            )
        )

        return response
