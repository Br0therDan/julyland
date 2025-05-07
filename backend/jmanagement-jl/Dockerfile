# File: backend/iam/Dockerfile
# -------------------------
# 1) 공통 빌드 베이스 스테이지 (공통 스테이지)
# -------------------------
    FROM python:3.13-slim AS base

    ENV PYTHONUNBUFFERED=1
    WORKDIR /app

    # 시스템 의존성 설치
    RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
        && rm -rf /var/lib/apt/lists/*

    # Poetry 설치
    RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
        ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry && \
        poetry config virtualenvs.create false

    # -------------------------
    # 2) 빌드 스테이지 (Builder)
    # -------------------------
    FROM base AS builder

    # 의존성 파일 복사 및 종속성 설치
    COPY pyproject.toml poetry.lock /app/
    RUN --mount=type=cache,target=/root/.cache/pip poetry install --no-root

    # 애플리케이션 소스 복사
    COPY ./app /app/app

    # -------------------------
    # 3) 런타임 스테이지 (Runtime)
    # -------------------------
    FROM python:3.13-slim AS runtime

    ENV PYTHONUNBUFFERED=1
    ENV PYTHONPATH=/app
    WORKDIR /app

    # 런타임 의존성 설치
    RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        curl \
        && rm -rf /var/lib/apt/lists/*

    # 빌드 스테이지에서 설치된 패키지 복사 (Poetry는 제외)
    COPY --from=builder /usr/local /usr/local

    # 애플리케이션 소스 복사
    COPY ./app /app/app

    # .dockerignore 파일을 활용해 불필요한 파일 제외
    
    # 포트 노출
    EXPOSE 8000

    # 컨테이너 실행 시 Uvicorn으로 애플리케이션 시작
    CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
