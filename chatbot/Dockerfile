FROM python:3.12-slim
WORKDIR /aplicacao
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/aplicacao
COPY requisitos.txt ./
RUN pip install --no-cache-dir -r requisitos.txt
COPY aplicativo ./aplicativo
EXPOSE 8000
CMD ["uvicorn", "aplicativo.principal:aplicacao", "--host", "0.0.0.0", "--port", "8000"]
