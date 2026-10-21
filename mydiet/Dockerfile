ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM ${BUILD_FROM}

RUN apk add --no-cache python3 py3-pip \
    && python3 -m venv /venv \
    && /venv/bin/pip install --no-cache-dir fastapi "uvicorn[standard]" httpx

COPY app /app
WORKDIR /app
CMD ["/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8099"]
