# ==============================================================================
# Multi-Stage Dockerfile for Bhratritya Foundation
# Single Container: Next.js Frontend (Public) + FastAPI Backend (Internal Only)
# ==============================================================================

# -------------------------------------------------------------
# Stage 1: Build Python Virtual Environment & Dependencies
# -------------------------------------------------------------
FROM python:3.12-slim-bookworm AS python-builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# -------------------------------------------------------------
# Stage 2: Build Next.js Production Application
# -------------------------------------------------------------
FROM node:20-bookworm-slim AS node-builder

WORKDIR /app/frontend

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY frontend/package.json frontend/package-lock.json ./
COPY frontend/prisma ./prisma/

RUN npm ci

COPY frontend ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV INTERNAL_API_URL=http://127.0.0.1:8000
ENV DATABASE_URL="postgresql://neondb_owner:npg_LQS5KhkGqn3w@ep-dark-bar-azxfwau3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

RUN npx prisma generate && npx next build

# -------------------------------------------------------------
# Stage 3: Production Runner Container
# -------------------------------------------------------------
FROM python:3.12-slim-bookworm AS runner

WORKDIR /app

# Install libpq for Postgres, curl for healthchecks, procps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy Node.js runtime from node-builder
COPY --from=node-builder /usr/local/bin/node /usr/local/bin/node

# Copy Python virtual environment from stage 1
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Backend application
COPY backend /app/backend

# Copy Frontend built application
COPY --from=node-builder /app/frontend /app/frontend

# Copy entrypoint script
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Environment settings
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PYTHONPATH=/app
ENV FASTAPI_INTERNAL_URL=http://127.0.0.1:8000
ENV INTERNAL_API_URL=http://127.0.0.1:8000
ENV PORT=3000

# Expose only the Next.js public HTTP port (FastAPI on 8000 is internal loopback only)
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
