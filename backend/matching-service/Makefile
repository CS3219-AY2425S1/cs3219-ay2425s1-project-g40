.PHONY: redis 
redis:
	@docker run --name matching-redis -p 6379:6379 -d \
		redis:alpine3.20

.PHONY: server
server:
	@uvicorn matching_service.api:app --reload --host 0.0.0.0 --port 8000


.PHONY: matchmaker
matchmaker:
	@python3 -m matching_service.matchmaker

.PHONY: test
test:
	@pytest --cov=matching_service

.PHONY: lint
lint:
	@ruff check matching_service/* tests/*

.PHONY: format
format:
	@ruff format matching_service/* tests/*