import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createAccountService = async (data) => {
  if (!data.code || !data.name || !data.type) {
    throw new ApiError(400, "Account code, name, and type are required");
  }

  const existing = await prisma.accounts.findUnique({
    where: { code: String(data.code).trim() },
  });

  if (existing) {
    throw new ApiError(
      400,
      `Account code '${data.code}' already exists in Chart of Accounts (${existing.name}). Please enter a unique code.`
    );
  }

  return prisma.accounts.create({
    data: {
      code: String(data.code).trim(),
      name: data.name,
      type: data.type,
      parent_id: data.parent_id || null,
      is_active: true,
    },
  });
};

export const getAccountsService = async () => {
  return prisma.accounts.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      code: "asc",
    },
  });
};

export const getAccountByIdService = async (id) => {
  return prisma.accounts.findUnique({
    where: { id },
  });
};

export const updateAccountService = async (id, data) => {
  return prisma.accounts.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      parent_id: data.parent_id || null,
    },
  });
};

export const deleteAccountService = async (id) => {
  return prisma.accounts.update({
    where: { id },
    data: {
      is_active: false,
    },
  });
};