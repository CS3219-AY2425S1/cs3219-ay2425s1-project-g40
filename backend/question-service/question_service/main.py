from beanie import init_beanie
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from structlog import get_logger

from .api import main_router
from .config import settings
from .models import Question
from .schemas import CustomValidationErrorResponse

logger = get_logger()


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errs = {
        "errors": [
            {
                "loc": err["loc"][1],
                "msg": err["msg"],
            }
            for err in exc.errors()
        ]
    }
    err_model = CustomValidationErrorResponse(**errs)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder(err_model),
    )


async def app_lifespan(app: FastAPI):
    # onStart:
    logger.info("📚 Question service started")
    client: AsyncIOMotorClient = AsyncIOMotorClient("mongodb://localhost:27017", serverselectiontimeoutms=10000)
    try:
        await init_beanie(client.questions_db, document_models=[Question])
        logger.info(f"✅ Connected to MongDB: {client.address}")
    except Exception:
        logger.error("🛑 Unable to connect to MongoDB")

    app.include_router(main_router)

    yield

    # onShutdown:
    client.close()


app = FastAPI(
    title="Question Service Backend",
    exception_handlers={RequestValidationError: validation_exception_handler},
    responses={
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "Validation Error",
            "model": CustomValidationErrorResponse,
        }
    },
    lifespan=app_lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    # To update if after auth
    allow_headers=["*"],
)
