.PHONY: db
db:
	@docker run --name user-db -p 27018:27018 -d \
		-e MONGO_INITDB_DATABASE=users_db \
		-e INIT_QUESTION_COLLECTION=users \
		alxarkar/cs3219-ay2425s1-g40-question

.PHONY: dropdb
dropdb:
	@docker exec user-db \
		--eval "use users_db" --eval  "db.dropDatabase()";

.PHONY: server
server:
	@uvicorn user_service.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: test
test:
	@pytest --cov=user_service

.PHONY: lint
lint:
	@ruff check user_service/* tests/*

.PHONY: format
format:
	@ruff format user_service/* tests/*