import { NextFunction, Request, Response } from "express";
import {
  createContactService,
  deleteContactService,
  getContactByIdService,
  getContactsService,
  importContactsService,
  optInContactService,
  syncContactFromApiService,
  updateContactService,
} from "./audience.service";
import {
  createContactSchema,
  importContactsSchema,
  optInContactSchema,
  syncContactSchema,
  updateContactSchema,
} from "./audience.validation";

export const getContactsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contacts = await getContactsService(req.user.companyId, req.query);

    res.status(200).json({
      message: "Audience récupérée avec succès",
      ...contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createContactSchema.parse(req.body);
    const contact = await createContactService(req.user.companyId, data);

    res.status(201).json({
      message: "Contact ajouté avec succès",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const importContactsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = importContactsSchema.parse(req.body);
    const result = await importContactsService(req.user.companyId, data);

    res.status(201).json({
      message: "Import audience terminé",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const syncContactFromApiController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = syncContactSchema.parse(req.body);
    const result = await syncContactFromApiService(req.user.companyId, data);

    res.status(200).json({
      message: "Contact synchronisé avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const optInContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = optInContactSchema.parse(req.body);
    const result = await optInContactService(data);

    res.status(201).json({
      message: "Opt-in enregistré avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await getContactByIdService(
      req.user.companyId,
      String(req.params.id)
    );

    res.status(200).json({
      message: "Contact récupéré avec succès",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateContactSchema.parse(req.body);

    const contact = await updateContactService(
      req.user.companyId,
      String(req.params.id),
      data
    );

    res.status(200).json({
      message: "Contact mis à jour avec succès",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteContactService(req.user.companyId, String(req.params.id));

    res.status(200).json({
      message: "Contact supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};