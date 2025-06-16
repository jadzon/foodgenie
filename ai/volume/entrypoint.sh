#!/bin/sh
# przejdź do katalogu /app, gdzie są Twoje moduły
cd /app
uvicorn funkcja:app --host 0.0.0.0 --port 8000
