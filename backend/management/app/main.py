# path: app/main.py

from datetime import datetime
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


# ✅ 로깅 설정 실행
setup_logging()
logger = logging.getLogger()


# ✅ 라우트 ID 생성 함수
def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


# ✅ Sentry 설정 (운영 환경에서만 활성화)
if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
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

def datetime_encoder(v: datetime) -> str:
    # 밀리초 단위 RFC3339 형식
    return v.isoformat(timespec="milliseconds")

# ✅ FastAPI 앱 생성
app = FastAPI(
    title=f"{settings.PROJECT_NAME} - {settings.APP_NAME} [{settings.ENVIRONMENT}]",
    generate_unique_id_function=custom_generate_unique_id,
    openapi_version="3.0.0",
    lifespan=lifespan,
)
# ✅ Sentry 미들웨어 추가 (운영 환경)
if (
    settings.SENTRY_DSN
    and settings.ENVIRONMENT != "dev"
    or settings.ENVIRONMENT != "local"
):
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

# ✅ API 라우터 등록
app.include_router(api_router, prefix=settings.API_V1_STR)
