import {
  createContactService,
  getContactsService,
  getContactByIdService,
  updateContactService,
  deleteContactService,
} from "../services/contactService.js";

export const createContact = async (req, res, next) => {
  try {
    const contact = await createContactService(req.body);

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await getContactsService();

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const contact = await getContactByIdService(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await updateContactService(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await deleteContactService(req.params.id);

    res.json({
      success: true,
      message: "Contact deactivated successfully",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};