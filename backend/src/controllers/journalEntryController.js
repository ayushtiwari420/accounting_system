import {
  createJournalEntryService,
  getJournalEntriesService,
  getJournalEntryByIdService,
} from "../services/journalEntryService.js";

export const createJournalEntry = async (req, res, next) => {
  try {
    const entry = await createJournalEntryService(req.body);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalEntries = async (req, res, next) => {
  try {
    const entries = await getJournalEntriesService();

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalEntryById = async (req, res, next) => {
  try {
    const entry = await getJournalEntryByIdService(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};