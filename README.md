# Lembraí

> Você fala. O assistente organiza.

MVP da Lembraí, um assistente acadêmico integrado ao WhatsApp por meio da Evolution API, com frontend React/JavaScript, backend Node.js/JavaScript, chatbot Python/FastAPI, PostgreSQL hospedado no Supabase e Redis/BullMQ.

A execução rápida recomendada **não exige Docker**. Na pasta do projeto, execute:

```powershell
npm run dev
```

Esse comando inicia o chatbot, o backend em modo memória e o frontend. Depois acesse [http://localhost:5173](http://localhost:5173). Consulte [`LEIA-ME.md`](LEIA-ME.md) para configurar o PostgreSQL do Supabase, o Redis e a alternativa local com Docker Compose.

A arquitetura completa está em [`docs/arquitetura-mvp.md`](docs/arquitetura-mvp.md). O Design System obrigatório está consolidado em [`docs/design-system-lembr-ai.md`](docs/design-system-lembr-ai.md).
