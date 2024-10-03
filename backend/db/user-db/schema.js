db = db.getSiblingDB('users_db');
db.questions.createIndex({ "userId": 1 }, { unique: true});