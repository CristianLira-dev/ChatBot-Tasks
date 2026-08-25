from fastapi import APIRouter, Header, HTTPException

from aplicativo.esquemas.modelos import RequisicaoProcessamento, RespostaProcessamento
from aplicativo.servicos.interpretador import interpretar


rotas = APIRouter(prefix="/api/v1/assistente", tags=["assistente"])


@rotas.post("/processar", response_model=RespostaProcessamento)
async def processar_mensagem(requisicao: RequisicaoProcessamento, x_servico_token: str | None = Header(default=None)) -> RespostaProcessamento:
    # O backend envia o token de serviço; em desenvolvimento o valor padrão permite executar sem segredo externo.
    import os
    esperado = os.getenv("TOKEN_SERVICO_INTERNO", "desenvolvimento-token-interno")
    if x_servico_token != esperado:
        raise HTTPException(status_code=401, detail="Serviço não autorizado")
    return interpretar(requisicao)
