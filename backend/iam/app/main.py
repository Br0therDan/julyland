# path: app/main.py

import logging
from contextlib import asynccontextmanager

from fastapi.exceptions import RequestValidationError
import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware

from app.api.main import api_router
from app.core.database import initiate_database, settings
from app.core.logging import setup_logging
from app.exceptions.handlers import (
    validation_exception_handler,
    http_exception_handler,
    global_exception_handler,
    RequestLoggingMiddleware,
)

# ✅ 로깅 설정 실행
setup_logging()
logger = logging.getLogger()


# ✅ 라우트 ID 생성 함수
def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


# ✅ Sentry 설정 (운영 환경에서만 활성화)
if settings.ENVIRONMENT == "production":
    sentry_sdk.init(
        dsn=str(settings.SENTRY_DSN),
        enable_tracing=True,
        send_default_pii=True,
        traces_sample_rate=1.0,
        _experiments={"continuous_profiling_auto_start": True},
    )


# ✅ FastAPI 앱 수명 주기 설정
@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작 시 실행할 코드"""
    app.state.db = await initiate_database()
    yield
    # await app.state.db.close()


# ✅ FastAPI 앱 생성
app = FastAPI(
    title=f"{settings.PROJECT_NAME} - {(settings.APP_NAME).upper()} [{settings.ENVIRONMENT}]",
    openapi_url="/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

# ✅ Sentry 미들웨어 추가 (운영 환경)
if settings.ENVIRONMENT == "production":
    app.add_middleware(SentryAsgiMiddleware)

# ✅ CORS 설정
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        # allow_origins=settings.all_cors_origins,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ✅ API 요청 로깅 미들웨어 추가
app.add_middleware(RequestLoggingMiddleware)


# ✅ 글로벌 예외 핸들러 추가
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)


# ✅ API 라우터 등록
app.include_router(api_router, prefix=settings.API_V1_STR)
