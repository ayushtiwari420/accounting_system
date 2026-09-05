import prisma from "../config/prisma.js";

export const createProductService = async (data) => {
  return prisma.products.create({
    data: {
      name: data.name,
      type: data.type || "GOODS",
      sales_price: data.sales_price ?? data.price ?? 0,
      purchase_price: data.purchase_price ?? data.cost ?? data.cost_price ?? 0,
      category: data.category || "Office Furniture",
      description: data.description || "Urban Furniture Item",
      is_active: true,
    },
  });
};

export const getProductsService = async () => {
  return prisma.products.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

export const getProductByIdService = async (id) => {
  return prisma.products.findUnique({
    where: { id },
  });
};

export const updateProductService = async (id, data) => {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.sales_price !== undefined || data.price !== undefined) {
    updateData.sales_price = data.sales_price ?? data.price;
  }
  if (data.purchase_price !== undefined || data.cost !== undefined || data.cost_price !== undefined) {
    updateData.purchase_price = data.purchase_price ?? data.cost ?? data.cost_price;
  }
  if (data.category !== undefined) updateData.category = data.category;
  if (data.description !== undefined) updateData.description = data.description;

  return prisma.products.update({
    where: { id },
    data: updateData,
  });
};

export const deleteProductService = async (id) => {
  return prisma.products.update({
    where: { id },
    data: {
      is_active: false,
    },
  });
};