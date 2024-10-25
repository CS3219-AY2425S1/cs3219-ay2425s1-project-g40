from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class PingRequest(_message.Message):
    __slots__ = ("name",)
    NAME_FIELD_NUMBER: _ClassVar[int]
    name: str
    def __init__(self, name: _Optional[str] = ...) -> None: ...

class PingReply(_message.Message):
    __slots__ = ("message",)
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    message: str
    def __init__(self, message: _Optional[str] = ...) -> None: ...

class QuestionsExistsRequest(_message.Message):
    __slots__ = ("difficulty", "topic")
    DIFFICULTY_FIELD_NUMBER: _ClassVar[int]
    TOPIC_FIELD_NUMBER: _ClassVar[int]
    difficulty: str
    topic: str
    def __init__(self, difficulty: _Optional[str] = ..., topic: _Optional[str] = ...) -> None: ...

class QuestionsExistsReply(_message.Message):
    __slots__ = ("numQuestions",)
    NUMQUESTIONS_FIELD_NUMBER: _ClassVar[int]
    numQuestions: int
    def __init__(self, numQuestions: _Optional[int] = ...) -> None: ...

class QuestionRequest(_message.Message):
    __slots__ = ("difficulty", "topic")
    DIFFICULTY_FIELD_NUMBER: _ClassVar[int]
    TOPIC_FIELD_NUMBER: _ClassVar[int]
    difficulty: str
    topic: str
    def __init__(self, difficulty: _Optional[str] = ..., topic: _Optional[str] = ...) -> None: ...

class QuestionReply(_message.Message):
    __slots__ = ("title", "titleSlug", "difficulty", "topic", "description")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TITLESLUG_FIELD_NUMBER: _ClassVar[int]
    DIFFICULTY_FIELD_NUMBER: _ClassVar[int]
    TOPIC_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    title: str
    titleSlug: str
    difficulty: str
    topic: str
    description: str
    def __init__(self, title: _Optional[str] = ..., titleSlug: _Optional[str] = ..., difficulty: _Optional[str] = ..., topic: _Optional[str] = ..., description: _Optional[str] = ...) -> None: ...
