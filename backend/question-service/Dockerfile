# Adapted from https://github.com/orgs/python-poetry/discussions/1879
#
# Poetry is not necessary as we already have `requirements.txt` exported

# Multi-stage build to keep images small
#
# https://pythonspeed.com/articles/multi-stage-docker-python/
FROM python:3.12.7-alpine AS python-base

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
RUN apk upgrade --no-cache  && \
    apk add --no-cache \
    build-base

WORKDIR $PYSETUP_PATH
COPY requirements.txt ./

RUN pip install -r requirements.txt

FROM python-base AS development
ENV FASTAPI_ENV=development
WORKDIR $PYSETUP_PATH

COPY --from=python-base $PYSETUP_PATH $PYSETUP_PATH

COPY . /app/
WORKDIR /app

EXPOSE 8000
CMD ["make", "server"]