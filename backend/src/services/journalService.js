import prisma from "../config/prisma.js";

export const createJournalService = async (data) => {
  return prisma.journals.create({
    data: {
      name: data.name,
      type: data.type,
      code: data.code,
      default_debit_account_id:
        data.default_debit_account_id || null,
      default_credit_account_id:
        data.default_credit_account_id || null,
    },
  });
};

export const getJournalsService = async () => {
  return prisma.journals.findMany({
    where: {
      is_active: true,
    },
    include: {
      accounts_journals_default_debit_account_idToaccounts: true,
      accounts_journals_default_credit_account_idToaccounts: true,
    },
    orderBy: {
      code: "asc",
    },
  });
};

export const getJournalByIdService = async (id) => {
  return prisma.journals.findUnique({
    where: {
      id,
    },
    include: {
      accounts_journals_default_debit_account_idToaccounts: true,
      accounts_journals_default_credit_account_idToaccounts: true,
    },
  });
};

export const updateJournalService = async (id, data) => {
  return prisma.journals.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      type: data.type,
      default_debit_account_id:
        data.default_debit_account_id || null,
      default_credit_account_id:
        data.default_credit_account_id || null,
    },
  });
};

export const deleteJournalService = async (id) => {
  return prisma.journals.update({
    where: {
      id,
    },
    data: {
      is_active: false,
    },
  });
};