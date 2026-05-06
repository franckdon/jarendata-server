import { NextFunction, Request, Response } from "express";
import {
  clearCampaignRecipientsService,
  generateCampaignRecipientsService,
  getCampaignRecipientStatsService,
  getCampaignRecipientsService,
  previewCampaignRecipientsService,
  updateCampaignRecipientStatusService,
} from "./dispatch.service";
import { updateRecipientStatusSchema } from "./dispatch.validation";

export const previewCampaignRecipientsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const preview = await previewCampaignRecipientsService(
      req.user.companyId,
      String(req.params.campaignId)
    );

    res.status(200).json({
      message: "Prévisualisation des destinataires récupérée avec succès",
      data: preview,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCampaignRecipientsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await generateCampaignRecipientsService(
      req.user.companyId,
      String(req.params.campaignId)
    );

    res.status(201).json({
      message: "Destinataires générés avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignRecipientsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipients = await getCampaignRecipientsService(
      req.user.companyId,
      String(req.params.campaignId),
      req.query
    );

    res.status(200).json({
      message: "Destinataires récupérés avec succès",
      ...recipients,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignRecipientStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getCampaignRecipientStatsService(
      req.user.companyId,
      String(req.params.campaignId)
    );

    res.status(200).json({
      message: "Statistiques des destinataires récupérées avec succès",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaignRecipientStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateRecipientStatusSchema.parse(req.body);

    const recipient = await updateCampaignRecipientStatusService(
      req.user.companyId,
      String(req.params.campaignId),
      String(req.params.recipientId),
      data
    );

    res.status(200).json({
      message: "Statut du destinataire mis à jour avec succès",
      data: recipient,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCampaignRecipientsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await clearCampaignRecipientsService(
      req.user.companyId,
      String(req.params.campaignId)
    );

    res.status(200).json({
      message: "Destinataires en attente supprimés avec succès",
    });
  } catch (error) {
    next(error);
  }
};