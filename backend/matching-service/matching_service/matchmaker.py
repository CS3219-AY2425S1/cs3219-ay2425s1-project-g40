import json
import time
from threading import Event

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

        self._stop_event = Event()
        logger.info(f"MATCHMAKER: connected to {self.client.get_connection_kwargs()}")

    def run(self):
        self.pubsub.subscribe(self.channel.value)
        while not self._stop_event.is_set():
            message = self.pubsub.get_message()
            if message and message["type"] == "message":
                logger.info("MATCHMAKER: Received match request")
                user_data = json.loads(message["data"])

                try:
                    req = MatchRequest(**user_data)
                except ValidationError as e:
                    logger.warn(f"\tUnrecognised request format discarded: {e}")
                    continue

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
            time.sleep(0.1)

    def stop(self):
        """
        `stop` is used if Matchmaker is run in the background as a thread
        e.g
        - tests
        - matchmaking-service needs to run both api server and matchmaker in a single container (not recommended)
        """
        self._stop_event.set()
        self.pubsub.unsubscribe()
        self.pubsub.close()
        self.client.close()


def request_match(publisher: Redis, user: MatchRequest):
    channel = RedisSettings.Channels.REQUESTS.value
    publisher.publish(channel, user.model_dump_json())
    logger.info(f"CLIENT: User {user.user} requested match for {user.topic}, {user.difficulty}")


if __name__ == "__main__":
    logger.info("🤖 Matchmaker started!")
    matchmaker = Matchmaker()
    matchmaker.run()
