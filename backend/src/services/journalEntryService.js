import prisma from "../config/prisma.js";

const validateJournalEntry = (lines) => {
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new Error("A journal entry must contain at least two lines");
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);

    if (debit < 0 || credit < 0) {
      throw new Error("Debit and credit cannot be negative");
    }

    if (debit > 0 && credit > 0) {
      throw new Error(
        "A journal line cannot contain both debit and credit"
      );
    }

    if (debit === 0 && credit === 0) {
      throw new Error(
        "A journal line must contain either debit or credit"
      );
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(
      `Journal entry is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
    );
  }

  return {
    totalDebit,
    totalCredit,
  };
};

export const createJournalEntryService = async (data) => {
  validateJournalEntry(data.lines);

  return prisma.$transaction(async (tx) => {
    const journal = await tx.journals.findUnique({
      where: {
        id: data.journal_id,
      },
    });

    if (!journal) {
      throw new Error("Journal not found");
    }

    const count = await tx.journal_entries.count();
    const entryNumber = `JE-2026-${String(count + 1).padStart(3, "0")}`;

    const journalEntry = await tx.journal_entries.create({
      data: {
        journal_id: data.journal_id,
        entry_number: entryNumber,
        entry_date: new Date(data.entry_date),
        reference: data.reference || null,
        source_type: data.source_type || "MANUAL",
        source_id: data.source_id || null,
        status: "POSTED",
        created_by: data.created_by || null,
        posted_at: new Date(),

        journal_entry_lines: {
          create: data.lines.map((line) => ({
            account_id: line.account_id,
            analytic_account_id:
              line.analytic_account_id || null,
            description: line.description || null,
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0),
          })),
        },
      },

      include: {
        journal_entry_lines: {
          include: {
            accounts: true,
          },
        },
      },
    });

    return journalEntry;
  });
};

export const getJournalEntriesService = async () => {
  return prisma.journal_entries.findMany({
    include: {
      journals: true,
      journal_entry_lines: {
        include: {
          accounts: true,
          analytic_accounts: true,
        },
      },
    },
    orderBy: {
      entry_date: "desc",
    },
  });
};

export const getJournalEntryByIdService = async (id) => {
  return prisma.journal_entries.findUnique({
    where: {
      id,
    },
    include: {
      journals: true,
      journal_entry_lines: {
        include: {
          accounts: true,
          analytic_accounts: true,
        },
      },
    },
  });
};