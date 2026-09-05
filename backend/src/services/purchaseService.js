import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createPurchaseOrder = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check Vendor Contact
    const vendor = await tx.contacts.findUnique({
      where: {
        id: data.vendor_id,
      },
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    if (!vendor.is_active) {
      throw new ApiError(400, "Vendor contact is inactive");
    }

    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = [];

    // 2. Process Items
    for (const item of data.items) {
      const product = await tx.products.findUnique({
        where: {
          id: item.product_id,
        },
      });

      if (!product) {
        throw new ApiError(404, `Product ${item.product_id} not found`);
      }

      if (!product.is_active) {
        throw new ApiError(400, `Product ${product.name} is inactive`);
      }

      const lineTotal = Number(item.quantity) * Number(item.unit_price);
      let itemTaxAmount = 0;

      if (item.tax_id) {
        const tax = await tx.taxes.findUnique({
          where: {
            id: item.tax_id,
          },
        });

        if (!tax) {
          throw new ApiError(404, "Tax not found");
        }

        itemTaxAmount = (lineTotal * Number(tax.rate)) / 100;
      }

      subtotal += lineTotal;
      taxAmount += itemTaxAmount;

      processedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_id: item.tax_id || null,
        tax_amount: itemTaxAmount,
        line_total: lineTotal,
      });
    }

    const totalAmount = subtotal + taxAmount;

    const count = await tx.purchase_orders.count();
    const orderNumber = `PO-2026-${String(count + 1).padStart(3, "0")}`;
    const orderDate = data.order_date
      ? new Date(data.order_date)
      : new Date();

    // 3. Create Purchase Order
    const purchaseOrder = await tx.purchase_orders.create({
      data: {
        order_number: orderNumber,
        vendor_id: data.vendor_id,
        order_date: orderDate,
        status: "DRAFT",
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        created_by: userId,
      },
    });

    // 4. Create Order Items
    await tx.purchase_order_items.createMany({
      data: processedItems.map((item) => ({
        purchase_order_id: purchaseOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_id: item.tax_id,
        tax_amount: item.tax_amount,
        line_total: item.line_total,
      })),
    });

    // 5. Return complete Purchase Order
    return await tx.purchase_orders.findUnique({
      where: {
        id: purchaseOrder.id,
      },
      include: {
        contacts: true,
        purchase_order_items: {
          include: {
            products: true,
          },
        },
      },
    });
  });
};

export const getPurchaseOrders = async () => {
  return await prisma.purchase_orders.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      contacts: true,
      purchase_order_items: {
        include: {
          products: true,
        },
      },
    },
  });
};

export const getPurchaseOrderById = async (id) => {
  const purchaseOrder = await prisma.purchase_orders.findUnique({
    where: { id },
    include: {
      contacts: true,
      purchase_order_items: {
        include: {
          products: true,
        },
      },
    },
  });

  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase order not found");
  }

  return purchaseOrder;
};
