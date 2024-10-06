from typing import List

from beanie import UpdateResponse
from structlog import get_logger

from ..models.question_model import Question
from ..schemas import UpdateQuestionModel

question_collection = Question

logger = get_logger()


async def create_question(new_question: Question) -> Question:
    question = await new_question.create()
    return question


async def get_questions() -> List[Question]:
    questions = await question_collection.all().to_list()
    return questions


async def get_question(title_slug: str) -> Question:
    question = await question_collection.find_one({"titleSlug": title_slug})
    return question


# await Product.find_one(Product.name == "Tony's").update({"$set": {Product.price: 3.33}})
async def update_question(title_slug: str, updated_question: UpdateQuestionModel) -> Question:
    question = await question_collection.find_one(Question.titleSlug == title_slug).update(
        {"$set": updated_question.model_dump(exclude_unset=True)}, response_type=UpdateResponse.NEW_DOCUMENT
    )
    return question


async def delete_question(title_slug: str) -> None:
    await question_collection.find_one({"titleSlug": title_slug}).delete()
