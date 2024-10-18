.PHONY: db 
db:
	@docker run --name question-db -p 27018:27017 -d \
		-e MONGO_INITDB_DATABASE=questions_db \
		-e INIT_QUESTION_COLLECTION=questions \
		alxarkar/cs3219-ay2425s1-g40-question

.PHONY: dropdb
dropdb:
	@docker exec question-db \
		--eval "use questions_db" --eval  "db.dropDatabase()";

.PHONY: proto
proto:
	@python3 -m grpc_tools.protoc -I ../protos --python_out=./question_service/protos --pyi_out=./question_service/protos --grpc_python_out=./question_service/protos ../protos/question.proto
.PHONY: server
server:
	@uvicorn question_service.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: test
test:
	@pytest --cov=question_service

.PHONY: lint
lint:
	@ruff check question_service/* tests/*

.PHONY: format
format:
	@ruff format question_service/* tests/*