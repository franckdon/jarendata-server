import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { handleIncomingWhatsAppMessage } from "./conversation.engine";
import {
  getMessageLogsService,
  getMyMessagingAccountService,
  getPlatformMessagingAccountService,
  sendCampaignMessagesService,
  upsertMyMessagingAccountService,
  upsertPlatformMessagingAccountService,
} from "./messaging.service";
import {
  sendCampaignMessagesSchema,
  upsertCompanyMessagingAccountSchema,
  upsertPlatformMessagingAccountSchema,
} from "./messaging.validation";

export const getMyMessagingAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const account = await getMyMessagingAccountService(req.user.companyId);

    res.status(200).json({
      message: "Compte messaging entreprise récupéré avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const upsertMyMessagingAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = upsertCompanyMessagingAccountSchema.parse(req.body);

    const account = await upsertMyMessagingAccountService(
      req.user.companyId,
      data
    );

    res.status(200).json({
      message: "Compte messaging entreprise enregistré avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformMessagingAccountController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const account = await getPlatformMessagingAccountService();

    res.status(200).json({
      message: "Compte messaging Jarendata récupéré avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const upsertPlatformMessagingAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = upsertPlatformMessagingAccountSchema.parse(req.body);

    const account = await upsertPlatformMessagingAccountService(data);

    res.status(200).json({
      message: "Compte messaging Jarendata enregistré avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessageLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logs = await getMessageLogsService(req.user.companyId, req.query);

    res.status(200).json({
      message: "Logs de messages récupérés avec succès",
      ...logs,
    });
  } catch (error) {
    next(error);
  }
};

export const sendCampaignMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = sendCampaignMessagesSchema.parse(req.body);

    const result = await sendCampaignMessagesService(
      req.user.companyId,
      req.params.campaignId,
      data
    );

    res.status(200).json({
      message: "Traitement d’envoi terminé",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyWhatsAppWebhookController = (
  req: Request,
  res: Response
) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.globalWhatsappVerifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

export const receiveWhatsAppWebhookController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = req.body;

    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const fromPhone = message.from;
    const body =
      message?.text?.body ||
      message?.button?.text ||
      message?.interactive?.button_reply?.title ||
      message?.interactive?.list_reply?.title ||
      "";

    if (!fromPhone || !body) {
      return res.sendStatus(200);
    }

    await handleIncomingWhatsAppMessage({
      fromPhone,
      body,
      payload,
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return res.sendStatus(200);
  }
};