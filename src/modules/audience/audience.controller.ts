import { NextFunction, Request, Response } from "express";
import {
  createContactService,
  deleteContactService,
  getContactByIdService,
  getContactsService,
  updateContactService,
} from "./audience.service";
import {
  createContactSchema,
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

export const getContactByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await getContactByIdService(
      req.user.companyId,
      req.params.id
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
      req.params.id,
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
    await deleteContactService(req.user.companyId, req.params.id);

    res.status(200).json({
      message: "Contact supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};