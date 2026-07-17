FROM python:3.12-slim

WORKDIR /app

COPY BE/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY BE/ .
COPY BE/models/ ./models/
COPY BE/data/ ./data/

RUN mkdir -p uploads

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
