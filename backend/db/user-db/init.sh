#!/bin/bash
# import from container directory
mongoimport \
    --db=${MONGO_INITDB_DATABASE} \
    --collection=${INIT_USER_COLLECTION} \
    --jsonArray \
    --file=/docker-entrypoint-initdb.d/init.json