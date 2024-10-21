"""
gRPC client to query question-service
"""

import grpc
from matching_service.common import Difficulty

from .config import settings
from .protos import question_pb2 as pb2
from .protos import question_pb2_grpc as pb2_grpc


def query_num_questions(topic: str, difficulty: Difficulty) -> int:
    with grpc.insecure_channel(settings.QUESTIONS_GRPC) as channel:
        stub = pb2_grpc.QuestionStub(channel)
        response = stub.QuestionsExists(pb2.QuestionsExistsRequest(difficulty=difficulty.value, topic=topic))
        return response.numQuestions
