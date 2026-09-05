import prisma  from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createSalesOrder = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {

    // 1. Check customer
    const customer = await tx.contacts.findUnique({
      where: {
        id: data.customer_id
      }
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    if (!customer.is_active) {
      throw new ApiError(400, "Customer contact is inactive");
    }

    let subtotal = 0;
    let taxAmount = 0;

    const processedItems = [];

    // 2. Process every item
    for (const item of data.items) {

      const product = await tx.products.findUnique({
        where: {
          id: item.product_id
        }
      });

      if (!product) {
        throw new ApiError(
          404,
          `Product ${item.product_id} not found`
        );
      }

      if (!product.is_active) {
        throw new ApiError(
          400,
          `Product ${product.name} is inactive`
        );
      }

      // Calculate line amount
      const lineTotal =
        Number(item.quantity) * Number(item.unit_price);

      let itemTaxAmount = 0;

      // 3. Calculate tax
      if (item.tax_id) {

        const tax = await tx.taxes.findUnique({
          where: {
            id: item.tax_id
          }
        });

        if (!tax) {
          throw new ApiError(404, "Tax not found");
        }

        itemTaxAmount =
          lineTotal * Number(tax.rate) / 100;
      }

      subtotal += lineTotal;
      taxAmount += itemTaxAmount;

      processedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_id: item.tax_id || null,
        tax_amount: itemTaxAmount,
        line_total: lineTotal
      });
    }

    const totalAmount = subtotal + taxAmount;

    // 4. Generate sequential order number
    const count = await tx.sales_orders.count();
    const orderNumber = `SO-2026-${String(count + 1).padStart(3, "0")}`;

    // 5. Create sales order
    const salesOrder = await tx.sales_orders.create({
      data: {
        order_number: orderNumber,
        customer_id: data.customer_id,
        order_date: new Date(data.order_date),
        status: "DRAFT",
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        created_by: userId
      }
    });

    // 6. Create order items
    await tx.sales_order_items.createMany({
      data: processedItems.map((item) => ({
        sales_order_id: salesOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_id: item.tax_id,
        tax_amount: item.tax_amount,
        line_total: item.line_total
      }))
    });

    // 7. Return complete order
    return await tx.sales_orders.findUnique({
      where: {
        id: salesOrder.id
      },
      include: {
        sales_order_items: true
      }
    });
  });
};


export const getSalesOrders = async () => {
  return await prisma.sales_orders.findMany({
    orderBy: {
      created_at: "desc"
    },
    include: {
      contacts: true,
      sales_order_items: {
        include: {
          products: true
        }
      }
    }
  });
};


export const getSalesOrderById = async (id) => {

  const salesOrder = await prisma.sales_orders.findUnique({
    where: {
      id
    },
    include: {
      contacts: true,
      sales_order_items: {
        include: {
          products: true
        }
      }
    }
  });

  if (!salesOrder) {
    throw new ApiError(404, "Sales order not found");
  }

  return salesOrder;
};