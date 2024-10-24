from typing import List

from beanie import UpdateResponse
from structlog import get_logger

from ..models.question_model import Difficulty, Question, QuestionTopic
from ..schemas import UpdateQuestionModel

question_collection = Question

logger = get_logger()


async def create_question(new_question: Question) -> Question:
    question = await new_question.create()
    return question


async def get_questions(topic: str | None, difficulty: Difficulty | None) -> List[Question]:
    filter_query = {}
    if topic:
        filter_query["topic"] = topic
    if difficulty:
        filter_query["difficulty"] = difficulty

    questions = await question_collection.find_many(filter_query).to_list()
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


async def get_topics() -> set[str]:
    topics = await question_collection.all(projection_model=QuestionTopic).to_list()
    topics_set = {topic.topic for topic in topics}
    return topics_set


async def get_difficulties() -> list[str]:
    return [d.value for d in Difficulty]
