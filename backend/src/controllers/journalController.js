import {
  createJournalService,
  getJournalsService,
  getJournalByIdService,
  updateJournalService,
  deleteJournalService,
} from "../services/journalService.js";

export const createJournal = async (req, res, next) => {
  try {
    const journal = await createJournalService(req.body);

    res.status(201).json({
      success: true,
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournals = async (req, res, next) => {
  try {
    const journals = await getJournalsService();

    res.json({
      success: true,
      data: journals,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalById = async (req, res, next) => {
  try {
    const journal = await getJournalByIdService(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.json({
      success: true,
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJournal = async (req, res, next) => {
  try {
    const journal = await updateJournalService(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournal = async (req, res, next) => {
  try {
    const journal = await deleteJournalService(req.params.id);

    res.json({
      success: true,
      message: "Journal deactivated successfully",
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};