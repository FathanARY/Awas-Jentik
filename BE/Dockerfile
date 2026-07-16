FROM python:3.12-slim

WORKDIR /app

COPY Awas-Jentik/BE/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY Awas-Jentik/BE/ .
COPY habitat_model.pkl mobility_model.pkl model_metadata.json ./

RUN mkdir -p uploads

EXPOSE 8000

CMD ["python", "-m", "seed"] && ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
