# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: question.proto
# Protobuf Python Version: 5.27.2
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    27,
    2,
    '',
    'question.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0equestion.proto\x12\x08question\"\x1b\n\x0bPingRequest\x12\x0c\n\x04name\x18\x01 \x01(\t\"\x1c\n\tPingReply\x12\x0f\n\x07message\x18\x01 \x01(\t\"^\n\x16QuestionsExistsRequest\x12\x17\n\ndifficulty\x18\x01 \x01(\tH\x00\x88\x01\x01\x12\x12\n\x05topic\x18\x02 \x01(\tH\x01\x88\x01\x01\x42\r\n\x0b_difficultyB\x08\n\x06_topic\",\n\x14QuestionsExistsReply\x12\x14\n\x0cnumQuestions\x18\x01 \x01(\x05\x32\x97\x01\n\x08Question\x12\x34\n\x04Ping\x12\x15.question.PingRequest\x1a\x13.question.PingReply\"\x00\x12U\n\x0fQuestionsExists\x12 .question.QuestionsExistsRequest\x1a\x1e.question.QuestionsExistsReply\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'question_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_PINGREQUEST']._serialized_start=28
  _globals['_PINGREQUEST']._serialized_end=55
  _globals['_PINGREPLY']._serialized_start=57
  _globals['_PINGREPLY']._serialized_end=85
  _globals['_QUESTIONSEXISTSREQUEST']._serialized_start=87
  _globals['_QUESTIONSEXISTSREQUEST']._serialized_end=181
  _globals['_QUESTIONSEXISTSREPLY']._serialized_start=183
  _globals['_QUESTIONSEXISTSREPLY']._serialized_end=227
  _globals['_QUESTION']._serialized_start=230
  _globals['_QUESTION']._serialized_end=381
# @@protoc_insertion_point(module_scope)