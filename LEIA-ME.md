# Assistente Acadêmico

> Você fala. O assistente organiza.

MVP de um assistente acadêmico integrado ao WhatsApp, com painel web React, API Node.js, chatbot Python/FastAPI, PostgreSQL e Redis/BullMQ.

## O que foi implementado

O fluxo principal está preparado de ponta a ponta:

```text
Evolution API → webhook Node.js → fila BullMQ → chatbot Python → confirmação persistida → tarefa → lembrete → resposta WhatsApp
```

O painel web permite entrar, cadastrar conta, visualizar indicadores, criar/editar/concluir/excluir tarefas, configurar lembretes, consultar conversas e acompanhar integrações de calendário. A integração WhatsApp opera em modo simulado quando as variáveis da Evolution API estão vazias, permitindo validar o produto sem credenciais externas.

## Requisitos

Para a execução completa, instale Docker com Docker Compose. Para rodar cada serviço fora de containers, use Node.js 20+, Python 3.11+ e instâncias PostgreSQL e Redis acessíveis.

## Execução com Docker Compose

```bash
cp .env.exemplo .env
# edite .env e defina JWT_SEGREDO e TOKEN_SERVICO_INTERNO

docker compose up --build
```

Depois, acesse [http://localhost:5173](http://localhost:5173). A API ficará em [http://localhost:3000](http://localhost:3000) e o chatbot em [http://localhost:8000/docs](http://localhost:8000/docs).

Como o ambiente do agente não possui Docker instalado, a validação automatizada usa os testes unitários locais dos serviços. Em uma máquina de desenvolvimento, o Compose executa as migrations do Prisma no início do backend.

## Execução local sem Docker

```bash
cp .env.exemplo .env

cd chatbot
python3 -m venv .venv
. .venv/bin/activate
pip install -r requisitos.txt
uvicorn aplicativo.principal:aplicacao --reload --port 8000
```

Em outro terminal:

```bash
cd backend
npm install
npx prisma generate
npm run desenvolvimento
```

Em outro terminal:

```bash
cd frontend
npm install
npm run desenvolvimento
```

A execução local exige que `DATABASE_URL`, `REDIS_URL`, `URL_CHATBOT` e demais valores estejam ajustados ao endereço dos serviços.

## Testes e validações

```bash
cd chatbot && python -m unittest discover -s testes -v
cd ../backend && npm test
cd ../frontend && npm run build
```

O endpoint de saúde pode ser verificado em `GET /api/saude`. Para simular uma mensagem, envie um payload `MESSAGES_UPSERT` para `POST /api/webhooks/evolution` com o segredo configurado. Em `MODO_WHATSAPP=simulado`, a resposta aparece nos logs do backend.

## Documentação

A arquitetura detalhada, o modelo de dados, os fluxos de autenticação, webhooks, calendários, filas, segurança, rotas e o plano de evolução estão em [`docs/arquitetura-mvp.md`](docs/arquitetura-mvp.md).

## Configuração de integrações reais

Para usar a Evolution API, preencha `EVOLUTION_API_URL`, `EVOLUTION_API_CHAVE`, `EVOLUTION_API_INSTANCIA`, `EVOLUTION_WEBHOOK_SEGREDO` e altere `MODO_WHATSAPP` para `evolution`. O webhook público deve ser HTTPS em produção.

Para Google Calendar ou Outlook, cadastre um cliente OAuth no provedor, informe as variáveis correspondentes e mantenha o callback apontando para o backend. O frontend nunca recebe os tokens. Sem credenciais, as conexões permanecem em estado disponível para configuração, sem simular uma autorização OAuth real.

## Próximas evoluções

O MVP deixa contratos prontos para sincronização bidirecional, novos provedores, resumo diário, notificações com preferências avançadas e processamento de linguagem natural via modelo externo. Essas extensões devem preservar o isolamento entre o backend, os adaptadores externos e o chatbot.
