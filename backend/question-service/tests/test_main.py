from http import HTTPStatus

from fastapi.testclient import TestClient
from question_service.main import app

client = TestClient(app)


def test_ping():
    response = client.get("/ping")
    assert response.status_code == HTTPStatus.OK
    assert response.content == b"pong"
