# Adapted from https://github.com/orgs/python-poetry/discussions/1879
#
# Poetry is not necessary as we already have `requirements.txt` exported

# Multi-stage build to keep images small
#
# https://pythonspeed.com/articles/multi-stage-docker-python/
FROM python:3.12.7-bullseye AS python-base

ENV PYTHONUNBUFFERED=1 \
    # prevents python creating .pyc files
    PYTHONDONTWRITEBYTECODE=1 \     
    # pip
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    # paths
    # this is where our requirements + virtual environment will live
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

# Update and install packages + create venv
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR $PYSETUP_PATH
COPY requirements.txt ./

#  https://github.com/grpc/grpc/issues/22815
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

FROM python-base AS development
ENV FASTAPI_ENV=development
WORKDIR $PYSETUP_PATH

COPY --from=python-base $PYSETUP_PATH $PYSETUP_PATH

COPY . /app/
WORKDIR /app

EXPOSE 8000
CMD ["make", "server"]