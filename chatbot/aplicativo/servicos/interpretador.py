import re
import unicodedata
from datetime import datetime
from typing import Any

from aplicativo.entidades.datas import combinar_data_horario, extrair_data, extrair_horario
from aplicativo.esquemas.modelos import Lembrete, RequisicaoProcessamento, RespostaProcessamento, TarefaInterpretada

TIPOS = {
    "prova": ("exam", "Prova"),
    "trabalho": ("assignment", "Trabalho"),
    "tarefa": ("task", "Tarefa"),
    "aula": ("class", "Aula"),
    "compromisso": ("appointment", "Compromisso"),
}


def sem_acentos(texto: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")


def detectar_tipo(texto: str) -> tuple[str, str]:
    baixo = sem_acentos(texto.lower())
    for chave, valor in TIPOS.items():
        if re.search(rf"\b{sem_acentos(chave)}\b", baixo): return valor
    return "task", "Tarefa"


def extrair_materia(texto: str, rotulo: str) -> str | None:
    padrao = rf"\b(?:de|da|do)\s+(.+?)(?=\s+(?:para entregar|para|no dia|dia\s+\d|amanha|amanhã|hoje|sexta|sabado|sábado|domingo|segunda|terca|terça|quarta|quinta|as\s+\d|às\s+\d|\d{{1,2}}h|\d{{1,2}}:)|$)"
    encontrado = re.search(padrao, texto, re.IGNORECASE)
    if not encontrado: return None
    materia = encontrado.group(1).strip(" .,!?:;")
    materia = re.sub(r"^(uma?|o|a)\s+", "", materia, flags=re.IGNORECASE)
    if materia.lower() == rotulo.lower(): return None
    return materia[:120].strip().title()


def extrair_lembretes(texto: str) -> list[Lembrete]:
    encontrado = re.search(r"\b(\d+)\s*(dia|dias|hora|horas|minuto|minutos)\s*antes\b", sem_acentos(texto.lower()))
    if not encontrado: return [Lembrete()]
    unidade = encontrado.group(2)
    unidade_normalizada = "day" if unidade.startswith("dia") else "hour" if unidade.startswith("hora") else "minute"
    return [Lembrete(amount=int(encontrado.group(1)), unit=unidade_normalizada)]


def montar_resposta(tarefa: TarefaInterpretada, rotulo: str, missing: list[str]) -> str:
    if "subject" in missing:
        return f"Claro! Qual é a matéria da {rotulo.lower()}?"
    if "dueDate" in missing:
        return f"Qual é a data da {rotulo.lower()}?"
    titulo = tarefa.title or rotulo
    linhas = ["📚 Entendi!", "", titulo]
    if tarefa.dueDate: linhas.append(f"📅 {tarefa.dueDate}")
    if tarefa.dueTime: linhas.append(f"⏰ {tarefa.dueTime}")
    linhas.append("")
    linhas.append("Quer que eu adicione à sua agenda e te lembre antes do prazo?")
    return "\n".join(linhas)


def interpretar(requisicao: RequisicaoProcessamento) -> RespostaProcessamento:
    texto = requisicao.message.content.strip()
    baixo = sem_acentos(texto.lower())
    pendente = requisicao.context.pendingAction
    if re.fullmatch(r"(sim|s|confirmo|pode|ok|pode sim|yes)", baixo):
        return RespostaProcessamento(intent="confirm", confidence=0.99, response="Confirmando sua tarefa...")
    if re.fullmatch(r"(nao|n|cancelar|cancela|deixa pra la)", baixo):
        return RespostaProcessamento(intent="cancel", confidence=0.99, response="Tudo bem, cancelei a operação pendente.")

    if pendente and pendente.get("intent") == "create_task":
        dados_pendentes = pendente.get("task") or {}
        tipo_pendente = dados_pendentes.get("type", "task")
        rotulo_pendente = next((rotulo for tipo, rotulo in TIPOS.values() if tipo == tipo_pendente), "Tarefa")
        data_pendente, _ = extrair_data(texto, requisicao.user.timezone)
        horario_pendente, _ = extrair_horario(texto)
        materia_pendente = dados_pendentes.get("subject")
        if not materia_pendente and len(texto.split()) <= 5 and not data_pendente and not horario_pendente:
            materia_pendente = texto.strip(" .,!?:;").title()
        data_iso = dados_pendentes.get("dueDate") or (data_pendente.isoformat() if data_pendente else None)
        horario_iso = dados_pendentes.get("dueTime") or horario_pendente
        tarefa_pendente = TarefaInterpretada(title=dados_pendentes.get("title") or f"{rotulo_pendente} de {materia_pendente}" if materia_pendente else rotulo_pendente, subject=materia_pendente, type=tipo_pendente, dueDate=data_iso, dueTime=horario_iso, dueDateTime=dados_pendentes.get("dueDateTime") or combinar_data_horario(data_pendente, horario_iso, requisicao.user.timezone), timezone=requisicao.user.timezone, duration=dados_pendentes.get("duration"), priority=dados_pendentes.get("priority", "medium"), notes=dados_pendentes.get("notes"), reminders=[Lembrete(**item) for item in dados_pendentes.get("reminders", [{"amount": 1, "unit": "day"}])])
        faltantes: list[str] = []
        if not tarefa_pendente.dueDate: faltantes.append("dueDate")
        if tipo_pendente in {"exam", "assignment"} and not tarefa_pendente.subject: faltantes.append("subject")
        return RespostaProcessamento(intent="create_task", confidence=0.94 if not faltantes else 0.82, requiresConfirmation=not faltantes, missingFields=faltantes, task=tarefa_pendente, response=montar_resposta(tarefa_pendente, rotulo_pendente, faltantes))

    if any(chave in baixo for chave in ["tarefas de hoje", "agenda de hoje", "o que tenho hoje", "minha agenda"]):
        return RespostaProcessamento(intent="list_today", confidence=0.95, response="Aqui está o que você tem hoje:")
    if any(chave in baixo for chave in ["tarefas da semana", "essa semana", "semana"]):
        return RespostaProcessamento(intent="list_week", confidence=0.93, response="Aqui está sua agenda da semana:")
    if "proxima prova" in baixo or "próxima prova" in texto.lower():
        return RespostaProcessamento(intent="next_exam", confidence=0.96, response="Estas são suas próximas provas:")
    if "atrasad" in baixo:
        return RespostaProcessamento(intent="list_overdue", confidence=0.96, response="Estas são suas tarefas atrasadas:")
    if any(chave in baixo for chave in ["terminei", "conclui", "concluí", "marcar como conclu"]):
        referencia = re.sub(r"^(terminei|conclui|concluí|marcar como conclu[ií]da?)\s*", "", texto, flags=re.IGNORECASE).strip(" .")
        tarefa_referenciada = TarefaInterpretada(title=referencia.title() if referencia else None)
        return RespostaProcessamento(intent="complete_task", confidence=0.9, task=tarefa_referenciada, response="Vou marcar a tarefa como concluída.")
    if any(chave in baixo for chave in ["cancelar o", "cancela o", "excluir", "apagar"]):
        referencia = re.sub(r"^(?:pode\s+)?(?:cancelar|cancela|excluir|apagar)\s+(?:o|a)?\s*", "", texto, flags=re.IGNORECASE).strip(" .")
        tarefa_referenciada = TarefaInterpretada(title=referencia.title() if referencia else None)
        return RespostaProcessamento(intent="delete_task", confidence=0.9, task=tarefa_referenciada, response="Vou localizar a tarefa para cancelá-la.")

    tipo, rotulo = detectar_tipo(texto)
    data, _ = extrair_data(texto, requisicao.user.timezone)
    horario, _ = extrair_horario(texto)
    materia = extrair_materia(texto, rotulo)
    if not any(token in baixo for token in ["prova", "trabalho", "tarefa", "aula", "compromisso", "entrega"]):
        return RespostaProcessamento(intent="unknown", confidence=0.25, response="Posso organizar provas, trabalhos e tarefas. Exemplo: “Tenho prova de matemática sexta às 19h”.")

    titulo = f"{rotulo} de {materia}" if materia else rotulo
    tarefa = TarefaInterpretada(title=titulo, subject=materia, type=tipo, dueDate=data.isoformat() if data else None, dueTime=horario, dueDateTime=combinar_data_horario(data, horario, requisicao.user.timezone), timezone=requisicao.user.timezone, reminders=extrair_lembretes(texto))
    missing: list[str] = []
    if not data: missing.append("dueDate")
    if tipo in {"exam", "assignment"} and not materia: missing.append("subject")
    resposta = montar_resposta(tarefa, rotulo, missing)
    return RespostaProcessamento(intent="create_task", confidence=0.96 if not missing else 0.78, requiresConfirmation=not missing, missingFields=missing, task=tarefa, response=resposta)
