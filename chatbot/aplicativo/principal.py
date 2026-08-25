from fastapi import FastAPI

from aplicativo.api.rotas import rotas

aplicacao = FastAPI(title="Assistente Acadêmico — Chatbot", version="1.0.0")
aplicacao.include_router(rotas)


@aplicacao.get("/api/saude")
async def saude():
    return {"status": "ok", "servico": "chatbot"}
