import express from "express";

import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
} from "../controllers/journalEntryController.js";

const router = express.Router();

router.post("/", createJournalEntry);
router.get("/", getJournalEntries);
router.get("/:id", getJournalEntryById);

export default router;