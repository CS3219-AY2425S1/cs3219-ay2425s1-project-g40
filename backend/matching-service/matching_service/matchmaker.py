import json
from typing import Any

from pydantic import ValidationError
from redis import Redis
from structlog import get_logger

from matching_service.common import MatchRequest
from matching_service.config import RedisSettings, settings

logger = get_logger()


"""
TODO
- Write to `MATCHES` channel instead of just logging results
"""


class Matchmaker:
    def __init__(self):
        self.channel = RedisSettings.Channels.REQUESTS
        self.client: Redis = Redis.from_url(RedisSettings.redis_url(self.channel))
        self.timeout: int = settings.MATCH_TIMEOUT
        self.pubsub = self.client.pubsub()

        self.r_thread = None
        logger.info(f"MATCHMAKER: connected to {self.client.get_connection_kwargs()}")

    def run(self):
        self.pubsub.subscribe(**{"requests": self.message_handler})
        self.r_thread = self.pubsub.run_in_thread(sleep_time=0.1, exception_handler=self.exception_handler)

    def message_handler(self, message: dict[str, Any] | None):
        if message and message["type"] == "message":
            logger.info("MATCHMAKER: Received match request")
            user_data = json.loads(message["data"])

            try:
                req = MatchRequest(**user_data)
            except ValidationError as e:
                # just raise and let redis exception_handler handle
                raise ValueError(f"\tUnrecognised request format discarded: {e}")

            logger.info(f"\t💬 Received matchmaking request from User {req.user} for {req.get_key()}")

            unmatched_key = req.get_key()
            unmatched_user_exists = self.client.exists(unmatched_key)
            if unmatched_user_exists:
                other_user = self.client.get(unmatched_key).decode("utf-8")
                self.client.delete(unmatched_key)
                logger.info(f"\t✅ Matched Users: {req.user} and {other_user} for {unmatched_key}!")
            else:
                self.client.setex(unmatched_key, self.timeout, req.user)
                logger.info(f"\t⏳ User {req.user} added to the unmatched pool for {unmatched_key}")

    def exception_handler(self, ex, _pubsub, _thread):
        logger.warn(ex)

    def stop(self):
        """
        `stop` is used if Matchmaker is run in the background as a thread
        e.g
        - tests
        - matchmaking-service needs to run both api server and matchmaker in a single container (not recommended)
        """
        self.r_thread.stop()
        self.r_thread.join(timeout=1.0)
        self.pubsub.close()



if __name__ == "__main__":
    logger.info("🤖 Matchmaker started!")
    matchmaker = Matchmaker()
    matchmaker.run()
