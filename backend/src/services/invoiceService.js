import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createInvoiceFromSalesOrder = async (
  salesOrderId,
  dueDate,
  userId
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find Sales Order
    const salesOrder = await tx.sales_orders.findUnique({
      where: {
        id: salesOrderId,
      },
      include: {
        sales_order_items: true,
      },
    });

    if (!salesOrder) {
      throw new ApiError(404, "Sales order not found");
    }

    // 2. Make sure Sales Order has items
    if (
      !salesOrder.sales_order_items ||
      salesOrder.sales_order_items.length === 0
    ) {
      throw new ApiError(400, "Sales order has no items");
    }

    // 3. Prevent duplicate invoice
    const existingInvoice = await tx.customer_invoices.findFirst({
      where: {
        sales_order_id: salesOrderId,
      },
    });

    if (existingInvoice) {
      throw new ApiError(400, "Sales order has already been invoiced");
    }

    // 4. Create Invoice
    const count = await tx.customer_invoices.count();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(3, "0")}`;

    const invoice = await tx.customer_invoices.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: salesOrder.customer_id,
        sales_order_id: salesOrder.id,
        invoice_date: new Date(),
        due_date: new Date(dueDate),

        subtotal: salesOrder.subtotal,
        tax_amount: salesOrder.tax_amount,
        total_amount: salesOrder.total_amount,

        paid_amount: 0,
        status: "POSTED",
      },
    });

    // 5. Copy Sales Order items
    await tx.customer_invoice_items.createMany({
      data: salesOrder.sales_order_items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_id: item.tax_id,
        tax_amount: item.tax_amount,
        line_total: item.line_total,
      })),
    });

    // 6. Find Sales Journal
    const salesJournal = await tx.journals.findFirst({
      where: {
        type: "SALES",
        is_active: true,
      },
    });

    if (!salesJournal) {
      throw new ApiError(500, "Sales journal not found");
    }

    // 7. Find Accounts Receivable
    const receivableAccount = await tx.accounts.findFirst({
      where: {
        code: "1100",
        is_active: true,
      },
    });

    if (!receivableAccount) {
      throw new ApiError(500, "Accounts Receivable account not found");
    }

    // 8. Find Sales Income
    const salesIncomeAccount = await tx.accounts.findFirst({
      where: {
        code: "4000",
        is_active: true,
      },
    });

    if (!salesIncomeAccount) {
      throw new ApiError(500, "Sales Income account not found");
    }

    // 9. Create Journal Entry
    const journalEntry = await tx.journal_entries.create({
      data: {
        journal_id: salesJournal.id,
        entry_number: `JE-${Date.now()}`,
        entry_date: invoice.invoice_date,
        reference: invoice.invoice_number,
        source_type: "SALES_INVOICE",
        source_id: invoice.id,
        status: "POSTED",
        created_by: userId,
        posted_at: new Date(),
      },
    });

    // 10. Create Journal Entry Lines
    await tx.journal_entry_lines.createMany({
      data: [
        {
          journal_entry_id: journalEntry.id,
          account_id: receivableAccount.id,
          description: `Invoice ${invoice.invoice_number}`,
          debit: invoice.total_amount,
          credit: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: salesIncomeAccount.id,
          description: `Invoice ${invoice.invoice_number}`,
          debit: 0,
          credit: invoice.total_amount,
        },
      ],
    });

    // 11. Link Journal Entry to Invoice
    const updatedInvoice = await tx.customer_invoices.update({
      where: {
        id: invoice.id,
      },
      data: {
        journal_entry_id: journalEntry.id,
      },
      include: {
        customer_invoice_items: true,
      },
    });

    // 12. Mark Sales Order as invoiced
    await tx.sales_orders.update({
      where: {
        id: salesOrder.id,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return updatedInvoice;
  });
};

export const getInvoices = async () => {
  return await prisma.customer_invoices.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      contacts: true,
      sales_orders: true,
      customer_invoice_items: {
        include: {
          products: true,
        },
      },
      journal_entries: {
        include: {
          journal_entry_lines: {
            include: {
              accounts: true,
            },
          },
        },
      },
    },
  });
};

export const getInvoiceById = async (id) => {
  const invoice = await prisma.customer_invoices.findUnique({
    where: { id },
    include: {
      contacts: true,
      sales_orders: true,
      customer_invoice_items: {
        include: {
          products: true,
        },
      },
      journal_entries: {
        include: {
          journal_entry_lines: {
            include: {
              accounts: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new ApiError(404, "Customer invoice not found");
  }

  return invoice;
};