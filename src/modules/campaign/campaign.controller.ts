import { NextFunction, Request, Response } from "express";
import {
  createCampaignService,
  deleteCampaignService,
  getCampaignByIdService,
  getCampaignsService,
  updateCampaignService,
  updateCampaignStatusService,
} from "./campaign.service";
import {
  createCampaignSchema,
  updateCampaignSchema,
  updateCampaignStatusSchema,
} from "./campaign.validation";

export const getCampaignsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const campaigns = await getCampaignsService(req.user.companyId, req.query);

    res.status(200).json({
      message: "Campagnes récupérées avec succès",
      ...campaigns,
    });
  } catch (error) {
    next(error);
  }
};

export const createCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createCampaignSchema.parse(req.body);

    const campaign = await createCampaignService(
      req.user.companyId,
      req.user.userId,
      data
    );

    res.status(201).json({
      message: "Campagne créée avec succès",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const campaign = await getCampaignByIdService(
      req.user.companyId,
      req.params.id
    );

    res.status(200).json({
      message: "Campagne récupérée avec succès",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCampaignSchema.parse(req.body);

    const campaign = await updateCampaignService(
      req.user.companyId,
      req.params.id,
      data
    );

    res.status(200).json({
      message: "Campagne mise à jour avec succès",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteCampaignService(req.user.companyId, req.params.id);

    res.status(200).json({
      message: "Campagne supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaignStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCampaignStatusSchema.parse(req.body);

    const campaign = await updateCampaignStatusService(
        req.user.companyId,
        req.user.userId,
        req.params.id,
        data
    );

    res.status(200).json({
      message: "Statut de la campagne mis à jour avec succès",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};