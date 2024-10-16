db = db.getSiblingDB('questions_db');
db.questions.createIndex({ "title": 1 }, { unique: true});
db.questions.createIndex({ "titleSlug": 1 }, { unique: true});
