import prisma from "../config/prisma.js";

export const createContactService = async (data) => {
  return prisma.contacts.create({
    data: {
      name: data.name,
      type: data.type || "CUSTOMER",
      email: data.email || null,
      mobile: data.mobile || data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      pincode: data.pincode || null,
      is_active: true,
    },
  });
};

export const getContactsService = async () => {
  return prisma.contacts.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
};

export const getContactByIdService = async (id) => {
  return prisma.contacts.findUnique({
    where: {
      id,
    },
  });
};

export const updateContactService = async (id, data) => {
  return prisma.contacts.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteContactService = async (id) => {
  return prisma.contacts.update({
    where: {
      id,
    },
    data: {
      is_active: false,
    },
  });
};