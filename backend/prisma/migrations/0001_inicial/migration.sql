-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaCriptografada` VARCHAR(191) NOT NULL,
    `fusoHorario` VARCHAR(191) NOT NULL DEFAULT 'America/Sao_Paulo',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_telefone_key`(`telefone`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tarefa` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `materia` VARCHAR(191) NULL,
    `tipo` ENUM('tarefa', 'prova', 'trabalho', 'aula', 'compromisso', 'outro') NOT NULL DEFAULT 'tarefa',
    `dataEntrega` DATETIME(3) NOT NULL,
    `horarioEntrega` VARCHAR(191) NULL,
    `duracao` INTEGER NULL,
    `prioridade` ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
    `status` ENUM('pendente', 'concluida', 'cancelada') NOT NULL DEFAULT 'pendente',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Tarefa_usuarioId_status_idx`(`usuarioId`, `status`),
    INDEX `Tarefa_usuarioId_dataEntrega_idx`(`usuarioId`, `dataEntrega`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConexaoCalendario` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `provedor` VARCHAR(191) NOT NULL,
    `emailConta` VARCHAR(191) NULL,
    `tokenAcessoCriptografado` VARCHAR(191) NULL,
    `tokenAtualizacaoCriptografado` VARCHAR(191) NULL,
    `expiraEm` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'disponivel',
    `ultimoSincronismoEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `ConexaoCalendario_usuarioId_status_idx`(`usuarioId`, `status`),
    UNIQUE INDEX `ConexaoCalendario_usuarioId_provedor_key`(`usuarioId`, `provedor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoCalendario` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `tarefaId` VARCHAR(191) NOT NULL,
    `provedor` VARCHAR(191) NOT NULL,
    `identificadorEventoExterno` VARCHAR(191) NULL,
    `identificadorCalendario` VARCHAR(191) NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `fusoHorario` VARCHAR(191) NOT NULL,
    `statusSincronizacao` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `ultimaVersaoExternaEm` DATETIME(3) NULL,
    `ultimoSincronismoEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `EventoCalendario_usuarioId_provedor_idx`(`usuarioId`, `provedor`),
    INDEX `EventoCalendario_tarefaId_idx`(`tarefaId`),
    UNIQUE INDEX `EventoCalendario_provedor_identificadorEventoExterno_key`(`provedor`, `identificadorEventoExterno`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lembrete` (
    `id` VARCHAR(191) NOT NULL,
    `tarefaId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `agendadoPara` DATETIME(3) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `status` ENUM('agendado', 'enviado', 'falhou', 'cancelado') NOT NULL DEFAULT 'agendado',
    `tentativas` INTEGER NOT NULL DEFAULT 0,
    `enviadoEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Lembrete_usuarioId_status_agendadoPara_idx`(`usuarioId`, `status`, `agendadoPara`),
    INDEX `Lembrete_tarefaId_idx`(`tarefaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversa` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `intencaoPendente` VARCHAR(191) NULL,
    `dadosPendentes` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Conversa_telefone_idx`(`telefone`),
    UNIQUE INDEX `Conversa_usuarioId_telefone_key`(`usuarioId`, `telefone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mensagem` (
    `id` VARCHAR(191) NOT NULL,
    `conversaId` VARCHAR(191) NOT NULL,
    `identificadorMensagemExterna` VARCHAR(191) NULL,
    `direcao` ENUM('entrada', 'saida') NOT NULL,
    `conteudo` VARCHAR(191) NOT NULL,
    `tipoMensagem` VARCHAR(191) NOT NULL DEFAULT 'texto',
    `statusProcessamento` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Mensagem_conversaId_criadoEm_idx`(`conversaId`, `criadoEm`),
    UNIQUE INDEX `Mensagem_conversaId_identificadorMensagemExterna_key`(`conversaId`, `identificadorMensagemExterna`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoWebhook` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NULL,
    `provedor` VARCHAR(191) NOT NULL,
    `identificadorEventoExterno` VARCHAR(191) NOT NULL,
    `tipoEvento` VARCHAR(191) NOT NULL,
    `dados` JSON NOT NULL,
    `statusProcessamento` VARCHAR(191) NOT NULL DEFAULT 'recebido',
    `recebidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processadoEm` DATETIME(3) NULL,

    INDEX `EventoWebhook_statusProcessamento_recebidoEm_idx`(`statusProcessamento`, `recebidoEm`),
    UNIQUE INDEX `EventoWebhook_provedor_identificadorEventoExterno_key`(`provedor`, `identificadorEventoExterno`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistroSincronizacao` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `provedor` VARCHAR(191) NOT NULL,
    `operacao` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `mensagemErro` VARCHAR(191) NULL,
    `iniciadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalizadoEm` DATETIME(3) NULL,

    INDEX `RegistroSincronizacao_usuarioId_provedor_iniciadoEm_idx`(`usuarioId`, `provedor`, `iniciadoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tarefa` ADD CONSTRAINT `Tarefa_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConexaoCalendario` ADD CONSTRAINT `ConexaoCalendario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoCalendario` ADD CONSTRAINT `EventoCalendario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoCalendario` ADD CONSTRAINT `EventoCalendario_tarefaId_fkey` FOREIGN KEY (`tarefaId`) REFERENCES `Tarefa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lembrete` ADD CONSTRAINT `Lembrete_tarefaId_fkey` FOREIGN KEY (`tarefaId`) REFERENCES `Tarefa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lembrete` ADD CONSTRAINT `Lembrete_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversa` ADD CONSTRAINT `Conversa_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensagem` ADD CONSTRAINT `Mensagem_conversaId_fkey` FOREIGN KEY (`conversaId`) REFERENCES `Conversa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoWebhook` ADD CONSTRAINT `EventoWebhook_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroSincronizacao` ADD CONSTRAINT `RegistroSincronizacao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

