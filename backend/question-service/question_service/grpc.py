from concurrent import futures

from structlog import get_logger

import grpc

from .protos import question_pb2 as pb2
from .protos import question_pb2_grpc as pb2_grpc
from .service import get_questions

logger = get_logger()


class QuestionGrpc(pb2_grpc.QuestionServicer):
    async def Ping(self, request: pb2.PingRequest, context: grpc.aio.ServicerContext) -> pb2.PingReply:
        return pb2.PingReply(message="Hello, %s" % request.name)

    async def QuestionsExists(
        self, request: pb2.QuestionsExistsRequest, context: grpc.aio.ServicerContext
    ) -> pb2.QuestionsExistsReply:
        logger.info(f"[question-grpc] questionExists: {request.topic}, {request.difficulty}")
        questions = await get_questions(topic=request.topic, difficulty=request.difficulty)
        num_questions = len(questions)
        return pb2.QuestionsExistsReply(numQuestions=num_questions)


async def serve() -> None:
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=3))
    pb2_grpc.add_QuestionServicer_to_server(QuestionGrpc(), server)
    listen_addr = "[::]:50051"
    server.add_insecure_port(listen_addr)
    logger.info("✅ Question GRPC server started")
    await server.start()
    await server.wait_for_termination()
