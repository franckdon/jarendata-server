"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIncomingWhatsAppMessage = exports.sendFirstQuestionToRecipient = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const messaging_account_resolver_1 = require("./messaging-account.resolver");
const whatsapp_client_1 = require("./whatsapp.client");
const formatQuestionForWhatsApp = (question) => {
    let message = question.title;
    if (question.description) {
        message += `\n\n${question.description}`;
    }
    if (question.options && question.options.length > 0) {
        message += "\n\n";
        message += question.options
            .sort((a, b) => a.order - b.order)
            .map((option, index) => `${index + 1}. ${option.label}`)
            .join("\n");
    }
    if (question.placeholder && question.type === "TEXT") {
        message += `\n\n${question.placeholder}`;
    }
    return message;
};
const parseIncomingAnswer = (question, messageBody) => {
    const cleaned = messageBody.trim();
    if (question.type === "TEXT") {
        return {
            answerType: "TEXT",
            textValue: cleaned,
            rawValue: cleaned,
            optionId: null,
            numberValue: null,
            booleanValue: null,
            values: [],
            selectedOption: null,
        };
    }
    if (question.type === "RATING") {
        const numberValue = Number(cleaned);
        if (Number.isNaN(numberValue)) {
            throw new appError_1.AppError("Réponse invalide pour une question de notation", 400);
        }
        const selectedOption = question.options.find((option) => option.value === String(numberValue)) ||
            question.options.find((option) => option.order === numberValue);
        return {
            answerType: "RATING",
            numberValue,
            rawValue: cleaned,
            optionId: selectedOption?.id || null,
            textValue: null,
            booleanValue: null,
            values: [],
            selectedOption,
        };
    }
    if (question.type === "YES_NO") {
        const lower = cleaned.toLowerCase();
        const isYes = ["oui", "yes", "1", "y"].includes(lower);
        const isNo = ["non", "no", "2", "n"].includes(lower);
        const selectedOption = question.options.find((option) => {
            return (option.value.toLowerCase() === lower ||
                option.label.toLowerCase() === lower ||
                option.order === Number(cleaned));
        });
        return {
            answerType: "YES_NO",
            booleanValue: isYes ? true : isNo ? false : null,
            rawValue: cleaned,
            optionId: selectedOption?.id || null,
            textValue: null,
            numberValue: null,
            values: [],
            selectedOption,
        };
    }
    if (question.type === "SINGLE_CHOICE") {
        const selectedOption = question.options.find((option) => {
            return (option.value.toLowerCase() === cleaned.toLowerCase() ||
                option.label.toLowerCase() === cleaned.toLowerCase() ||
                option.order === Number(cleaned));
        });
        if (!selectedOption) {
            throw new appError_1.AppError("Option invalide", 400);
        }
        return {
            answerType: "SINGLE_CHOICE",
            optionId: selectedOption.id,
            rawValue: selectedOption.value,
            textValue: null,
            numberValue: null,
            booleanValue: null,
            values: [],
            selectedOption,
        };
    }
    if (question.type === "MULTIPLE_CHOICE") {
        const parts = cleaned
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
        const selectedOptions = question.options.filter((option) => {
            return parts.some((part) => option.value.toLowerCase() === part.toLowerCase() ||
                option.label.toLowerCase() === part.toLowerCase() ||
                option.order === Number(part));
        });
        return {
            answerType: "MULTIPLE_CHOICE",
            optionId: null,
            rawValue: cleaned,
            textValue: null,
            numberValue: null,
            booleanValue: null,
            values: selectedOptions.map((option) => option.value),
            selectedOption: selectedOptions[0] || null,
        };
    }
    throw new appError_1.AppError("Type de question non supporté", 400);
};
const findNextQuestion = async (campaignId, currentQuestion, selectedOption) => {
    if (selectedOption?.nextQuestionId) {
        return prisma_1.prisma.surveyQuestion.findFirst({
            where: {
                id: selectedOption.nextQuestionId,
                campaignId,
            },
            include: {
                options: {
                    orderBy: { order: "asc" },
                },
            },
        });
    }
    return prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            campaignId,
            order: {
                gt: currentQuestion.order,
            },
        },
        orderBy: {
            order: "asc",
        },
        include: {
            options: {
                orderBy: { order: "asc" },
            },
        },
    });
};
const sendFirstQuestionToRecipient = async (recipientId) => {
    const recipient = await prisma_1.prisma.campaignRecipient.findUnique({
        where: { id: recipientId },
        include: {
            campaign: true,
            contact: true,
        },
    });
    if (!recipient) {
        throw new appError_1.AppError("Destinataire introuvable", 404);
    }
    const firstQuestion = await prisma_1.prisma.surveyQuestion.findFirst({
        where: { campaignId: recipient.campaignId },
        orderBy: { order: "asc" },
        include: {
            options: {
                orderBy: { order: "asc" },
            },
        },
    });
    if (!firstQuestion) {
        throw new appError_1.AppError("Aucune question définie pour cette campagne", 400);
    }
    const messagingAccount = await (0, messaging_account_resolver_1.resolveMessagingAccountForCompany)(recipient.campaign.companyId);
    const body = formatQuestionForWhatsApp(firstQuestion);
    const result = await (0, whatsapp_client_1.sendWhatsAppTextMessage)({
        provider: messagingAccount.provider,
        accessToken: messagingAccount.accessToken,
        phoneNumberId: messagingAccount.phoneNumberId,
        to: recipient.contact.phone,
        body,
    });
    const log = await prisma_1.prisma.messageLog.create({
        data: {
            companyId: recipient.campaign.companyId,
            messagingAccountId: messagingAccount.id,
            campaignId: recipient.campaignId,
            contactId: recipient.contactId,
            recipientId: recipient.id,
            direction: "OUTBOUND",
            status: result.success ? "SENT" : "FAILED",
            provider: messagingAccount.provider,
            waMessageId: result.providerMessageId,
            toPhone: recipient.contact.phone,
            body,
            payload: result.raw,
            errorMessage: result.errorMessage,
        },
    });
    await prisma_1.prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
            status: result.success ? "SENT" : "FAILED",
            sentAt: result.success ? new Date() : null,
            failedAt: result.success ? null : new Date(),
            errorMessage: result.errorMessage,
        },
    });
    if (result.success) {
        await prisma_1.prisma.surveySession.upsert({
            where: {
                campaignId_contactId: {
                    campaignId: recipient.campaignId,
                    contactId: recipient.contactId,
                },
            },
            update: {
                recipientId: recipient.id,
                status: "IN_PROGRESS",
            },
            create: {
                campaignId: recipient.campaignId,
                contactId: recipient.contactId,
                recipientId: recipient.id,
                status: "STARTED",
            },
        });
    }
    return log;
};
exports.sendFirstQuestionToRecipient = sendFirstQuestionToRecipient;
const handleIncomingWhatsAppMessage = async ({ fromPhone, body, payload, }) => {
    const contact = await prisma_1.prisma.contact.findFirst({
        where: {
            phone: fromPhone,
        },
        include: {
            company: true,
        },
    });
    if (!contact) {
        return {
            handled: false,
            reason: "CONTACT_NOT_FOUND",
        };
    }
    const session = await prisma_1.prisma.surveySession.findFirst({
        where: {
            contactId: contact.id,
            status: {
                in: ["STARTED", "IN_PROGRESS"],
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            campaign: true,
            answers: true,
            recipient: true,
        },
    });
    const messagingAccount = await (0, messaging_account_resolver_1.resolveMessagingAccountForCompany)(contact.companyId);
    await prisma_1.prisma.messageLog.create({
        data: {
            companyId: contact.companyId,
            messagingAccountId: messagingAccount.id,
            campaignId: session?.campaignId,
            contactId: contact.id,
            recipientId: session?.recipientId,
            direction: "INBOUND",
            status: "RECEIVED",
            provider: messagingAccount.provider,
            fromPhone,
            body,
            payload,
        },
    });
    if (!session) {
        return {
            handled: false,
            reason: "NO_ACTIVE_SESSION",
        };
    }
    const answeredQuestionIds = session.answers.map((answer) => answer.questionId);
    const currentQuestion = await prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            campaignId: session.campaignId,
            id: {
                notIn: answeredQuestionIds,
            },
        },
        orderBy: {
            order: "asc",
        },
        include: {
            options: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    });
    if (!currentQuestion) {
        await prisma_1.prisma.surveySession.update({
            where: { id: session.id },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });
        if (session.recipientId) {
            await prisma_1.prisma.campaignRecipient.update({
                where: { id: session.recipientId },
                data: {
                    status: "RESPONDED",
                    respondedAt: new Date(),
                },
            });
        }
        return {
            handled: true,
            completed: true,
        };
    }
    const parsed = parseIncomingAnswer(currentQuestion, body);
    await prisma_1.prisma.surveyAnswer.upsert({
        where: {
            sessionId_questionId: {
                sessionId: session.id,
                questionId: currentQuestion.id,
            },
        },
        update: {
            optionId: parsed.optionId,
            answerType: parsed.answerType,
            textValue: parsed.textValue,
            numberValue: parsed.numberValue,
            booleanValue: parsed.booleanValue,
            values: parsed.values,
            rawValue: parsed.rawValue,
        },
        create: {
            sessionId: session.id,
            campaignId: session.campaignId,
            contactId: contact.id,
            questionId: currentQuestion.id,
            optionId: parsed.optionId,
            answerType: parsed.answerType,
            textValue: parsed.textValue,
            numberValue: parsed.numberValue,
            booleanValue: parsed.booleanValue,
            values: parsed.values,
            rawValue: parsed.rawValue,
        },
    });
    const nextQuestion = await findNextQuestion(session.campaignId, currentQuestion, parsed.selectedOption);
    if (!nextQuestion) {
        await prisma_1.prisma.surveySession.update({
            where: { id: session.id },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });
        if (session.recipientId) {
            await prisma_1.prisma.campaignRecipient.update({
                where: { id: session.recipientId },
                data: {
                    status: "RESPONDED",
                    respondedAt: new Date(),
                },
            });
        }
        const thankYouMessage = "Merci beaucoup pour votre retour 🙏";
        const result = await (0, whatsapp_client_1.sendWhatsAppTextMessage)({
            provider: messagingAccount.provider,
            accessToken: messagingAccount.accessToken,
            phoneNumberId: messagingAccount.phoneNumberId,
            to: contact.phone,
            body: thankYouMessage,
        });
        await prisma_1.prisma.messageLog.create({
            data: {
                companyId: contact.companyId,
                messagingAccountId: messagingAccount.id,
                campaignId: session.campaignId,
                contactId: contact.id,
                recipientId: session.recipientId,
                direction: "OUTBOUND",
                status: result.success ? "SENT" : "FAILED",
                provider: messagingAccount.provider,
                waMessageId: result.providerMessageId,
                toPhone: contact.phone,
                body: thankYouMessage,
                payload: result.raw,
                errorMessage: result.errorMessage,
            },
        });
        return {
            handled: true,
            completed: true,
        };
    }
    const nextBody = formatQuestionForWhatsApp(nextQuestion);
    const result = await (0, whatsapp_client_1.sendWhatsAppTextMessage)({
        provider: messagingAccount.provider,
        accessToken: messagingAccount.accessToken,
        phoneNumberId: messagingAccount.phoneNumberId,
        to: contact.phone,
        body: nextBody,
    });
    await prisma_1.prisma.messageLog.create({
        data: {
            companyId: contact.companyId,
            messagingAccountId: messagingAccount.id,
            campaignId: session.campaignId,
            contactId: contact.id,
            recipientId: session.recipientId,
            direction: "OUTBOUND",
            status: result.success ? "SENT" : "FAILED",
            provider: messagingAccount.provider,
            waMessageId: result.providerMessageId,
            toPhone: contact.phone,
            body: nextBody,
            payload: result.raw,
            errorMessage: result.errorMessage,
        },
    });
    return {
        handled: true,
        completed: false,
        nextQuestionSent: result.success,
    };
};
exports.handleIncomingWhatsAppMessage = handleIncomingWhatsAppMessage;
