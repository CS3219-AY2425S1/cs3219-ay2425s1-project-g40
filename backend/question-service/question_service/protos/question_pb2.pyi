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
