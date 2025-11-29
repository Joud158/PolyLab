#!/bin/bash
exec uvicorn Backend.main:app --host 0.0.0.0 --port 8000 --workers 1 --proxy-headers
