import json
import os
from pathlib import Path
from typing import List, Optional

PATH = os.path.abspath(os.path.dirname(__file__))
DB_PATH = Path(PATH) / "init.json"


class MockDB:
    def __init__(self):
        self.db: List[dict] = self._load()

    def _load(self):
        with open(DB_PATH, "r") as file:
            json_data = json.load(file)
            db = {i["titleSlug"]: i for i in json_data}
            return db

    def get_question_by_title(self, title_slug: str) -> Optional[dict]:
        if title_slug in self.db:
            return self.db[title_slug]
        return None

    def get_questions(self) -> List[dict]:
        return self.db

    def create_question(self, question: dict) -> None:
        # this method has no validation,
        # the actual repository layer should have validation
        self.db[question["titleSlug"]] = question
        return self.db[question["titleSlug"]]

    def update_question(self, title_slug: str, updated_question: dict) -> dict:
        old_question = self.get_question_by_title(title_slug)
        new_dict = dict(old_question)
        new_dict.update(updated_question)
        self.db[title_slug] = new_dict
        return new_dict

    def delete_question(self, title_slug: str):
        self.db.pop(title_slug)


mock_db = MockDB()
