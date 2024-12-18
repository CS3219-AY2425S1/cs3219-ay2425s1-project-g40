"""
Integration test for matchmaker
"""

import json
import time
from threading import Thread

import pytest
from matching_service.api import request_match
from matching_service.common import MatchRequest
from matching_service.matchmaker import Matchmaker
from redis import Redis
from testcontainers.redis import RedisContainer


@pytest.fixture(scope="module")
def redis_container():
    """Fixture to spin up a Redis test container."""
    with RedisContainer() as test_redis:
        test_client = test_redis.get_client()
        yield test_client


@pytest.fixture(scope="module")
def matchmaker_thread(redis_container: Redis):
    """Fixture to set up the Matchmaker with a background thread."""
    mm = Matchmaker()
    mm.client = redis_container
    mm.pubsub = mm.client.pubsub()
    mm.timeout = 2

    mm.run()

    yield mm

    mm.stop()


def test_single_user_leaves_user_in_queue(redis_container: Redis, matchmaker_thread: Thread):
    """Test that a single user request remains in the queue."""
    redis_container.flushall()
    match_req = MatchRequest(user="user1", difficulty="Easy", topic="test")
    request_match(redis_container, match_req)

    time.sleep(1)

    result = redis_container.exists(match_req.get_key())
    assert result == 1


def test_match_removes_users(redis_container: Redis, matchmaker_thread: Matchmaker):
    redis_container.flushall()
    match_req1 = MatchRequest(user="user1", difficulty="Easy", topic="test")
    match_req2 = MatchRequest(user="user2", difficulty="Easy", topic="test")

    request_match(redis_container, match_req1)
    request_match(redis_container, match_req2)

    time.sleep(0.5)

    result = redis_container.exists(match_req1.get_key())
    assert result == 0


def test_users_with_different_topic_does_not_match(redis_container: Redis, matchmaker_thread: Matchmaker):
    redis_container.flushall()
    match_req1 = MatchRequest(user="user1", difficulty="Easy", topic="dp")
    match_req2 = MatchRequest(user="user2", difficulty="Easy", topic="linked-list")

    request_match(redis_container, match_req1)
    request_match(redis_container, match_req2)

    time.sleep(0.5)

    topic1 = redis_container.exists(match_req1.get_key())
    assert topic1 == 1
    topic2 = redis_container.exists(match_req2.get_key())
    assert topic2 == 1


def test_expired_requests_does_not_match(redis_container: Redis, matchmaker_thread: Matchmaker):
    redis_container.flushall()
    match_req1 = MatchRequest(user="user1", difficulty="Easy", topic="test")
    match_req2 = MatchRequest(user="user2", difficulty="Easy", topic="test")

    request_match(redis_container, match_req1)
    time.sleep(2.2)
    request_match(redis_container, match_req2)

    time.sleep(0.5)

    result = redis_container.exists(match_req1.get_key())
    assert result == 1


def test_exception_handler_called_on_invalid_request(mocker, redis_container: Redis):
    redis_container.flushall()
    mm = Matchmaker()
    exception_handler_spy = mocker.spy(mm, "exception_handler")
    mm.client = redis_container
    mm.pubsub = mm.client.pubsub()
    mm.run()

    invalid_request = {"invalid": "invalid", "broken": 2}
    req = json.dumps(invalid_request)
    redis_container.publish("requests", req)
    time.sleep(0.5)
    mm.stop()

    assert exception_handler_spy.call_count == 1


def test_consecutive_requests_raises_error(redis_container: Redis, matchmaker_thread: Matchmaker):
    redis_container.flushall()
    match_req1 = MatchRequest(user="user1", difficulty="Easy", topic="test")
    match_req2 = MatchRequest(user="user1", difficulty="Easy", topic="test")

    request_match(redis_container, match_req1)
    with pytest.raises(ValueError):
        time.sleep(0.5)
        request_match(redis_container, match_req2)

    result = redis_container.exists(match_req1.get_key())
    # first request should still exist
    assert result == 1
