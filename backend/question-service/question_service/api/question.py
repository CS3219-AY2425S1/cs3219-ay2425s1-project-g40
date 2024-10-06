from fastapi import APIRouter, HTTPException, Response, status
from pymongo.errors import DuplicateKeyError
from structlog import get_logger

from ..models import Question
from ..schemas import CreateQuestionModel, UpdateQuestionModel
from ..service.question_service import create_question as create_question_db
from ..service.question_service import delete_question, get_question, get_questions, update_question

router = APIRouter()
logger = get_logger()


@router.get("/question/{titleSlug}", response_model=Question)
async def get_question_by_title(titleSlug: str) -> Question:
    # validate params -> return 401 Bad request
    logger.info(f"Retrieving {titleSlug}")
    if not titleSlug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid title slug")

    question = await get_question(titleSlug)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question


@router.delete("/question/{titleSlug}")
async def delete_question_by_title(titleSlug: str) -> Response:
    if not titleSlug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid title slug")

    question = await get_question(titleSlug)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    await delete_question(titleSlug)
    return Response(status_code=status.HTTP_200_OK)


@router.put("/question/{titleSlug}", response_model=Question)
async def update_question_by_title(titleSlug: str, req: UpdateQuestionModel) -> Question:
    if not titleSlug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid title slug")

    question = await get_question(titleSlug)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    question = await update_question(titleSlug, req)
    return question


@router.get("/question/", response_model=list[Question])
async def get_all_questions() -> list[Question]:
    logger.info("Retrieving all questions")

    questions = await get_questions()
    if questions is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There are no questions in question bank")
    return questions


@router.post("/question/", status_code=status.HTTP_201_CREATED, response_model=Question)
async def create_question(question: CreateQuestionModel) -> Question:
    if not question:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid question")
    try:
        question = await create_question_db(Question(**question.model_dump()))
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question already exists")
    return question
