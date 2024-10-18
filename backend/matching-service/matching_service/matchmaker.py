import json
import time
from threading import Event

from pydantic import ValidationError
from redis import Redis
from structlog import get_logger

from matching_service.common import MatchRequest
from matching_service.config import RedisSettings

logger = get_logger()


"""
TODO
- Use Redis `SortedSet` instead of `List`
- Write to `MATCHES` channel instead of just logging results
- Run process in background that removes stale matches
"""


class Matchmaker:
    def __init__(self):
        self.channel = RedisSettings.Channels.REQUESTS
        self.client: Redis = Redis.from_url(RedisSettings.redis_url(self.channel))

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
                # self.client.zrangebyscore
                unmatched_users = self.client.lrange(unmatched_key, 0, -1)

                if unmatched_users:
                    # self.client.zpopmin
                    other_user = self.client.lpop(unmatched_key).decode("utf-8")
                    logger.info(f"\t✅ Matched Users: {req.user} and {other_user} for {unmatched_key}!")
                else:
                    # self.client.zadd, name="Easy:dp", score=req.timestamp, value=req.user
                    self.client.rpush(unmatched_key, req.user)
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



if __name__ == "__main__":
    logger.info("🤖 Matchmaker started!")
    matchmaker = Matchmaker()
    matchmaker.run()
