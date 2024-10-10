import json
import time

import redis

redis_client = redis.Redis(host="localhost", port=6379, db=0)


class User:
    def __init__(self, user_id: int, difficulty: str):
        self.user_id = user_id
        self.difficulty = difficulty


def request_match(user: User):
    channel = f"matchmaking_{user.difficulty}"  # e.g., matchmaking_easy
    message = json.dumps({"user_id": user.user_id, "difficulty": user.difficulty})
    redis_client.publish(channel, message)
    print(f"User {user.user_id} requested match on {channel}")


def matchmaking_service(difficulty: str):
    pubsub = redis_client.pubsub()
    channel = f"matchmaking_{difficulty}"
    pubsub.subscribe(channel)
    print(f"Subscribed to {channel} for matchmaking...")

    while True:
        message = pubsub.get_message()
        if message and message["type"] == "message":
            user_data = json.loads(message["data"])
            user_id = user_data["user_id"]
            print(f"💬 Received matchmaking request from User {user_id} for {difficulty}")

            unmatched_key = f"unmatched_{difficulty}"
            unmatched_users = redis_client.lrange(unmatched_key, 0, -1)

            if unmatched_users:
                other_user = redis_client.lpop(unmatched_key).decode("utf-8")
                print(f"✅ Matched Users: {user_id} and {other_user} for {difficulty}!")
            else:
                redis_client.rpush(unmatched_key, user_id)
                print(f"⏳ User {user_id} added to the unmatched pool for {difficulty}")
        time.sleep(0.1)


if __name__ == "__main__":
    user1 = User(user_id="user1", difficulty="easy")
    user2 = User(user_id="user2", difficulty="easy")
    user3 = User(user_id="user3", difficulty="medium")

    from threading import Thread

    easy_thread = Thread(target=matchmaking_service, args=("easy",))
    medium_thread = Thread(target=matchmaking_service, args=("medium",))
    easy_thread.start()
    medium_thread.start()

    time.sleep(1)  # Give time for the service to start
    request_match(user1)
    time.sleep(2)
    request_match(user2)
    time.sleep(2)
    request_match(user3)
