import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createBillFromPurchaseOrder = async (
  purchaseOrderId,
  dueDate,
  userId
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find Purchase Order
    const purchaseOrder = await tx.purchase_orders.findUnique({
      where: { id: purchaseOrderId },
      include: { purchase_order_items: true },
    });

    if (!purchaseOrder) {
      throw new ApiError(404, "Purchase order not found");
    }

    if (
      !purchaseOrder.purchase_order_items ||
      purchaseOrder.purchase_order_items.length === 0
    ) {
      throw new ApiError(400, "Purchase order has no items");
    }

    // 2. Check duplicate bill
    const existingBill = await tx.vendor_bills.findFirst({
      where: { purchase_order_id: purchaseOrderId },
    });

    if (existingBill) {
      throw new ApiError(400, "Purchase order has already been billed");
    }

    // 3. Create Vendor Bill
    const count = await tx.vendor_bills.count();
    const billNumber = `BILL-2026-${String(count + 1).padStart(3, "0")}`;
    const bill = await tx.vendor_bills.create({
      data: {
        bill_number: billNumber,
        vendor_id: purchaseOrder.vendor_id,
        purchase_order_id: purchaseOrder.id,
        bill_date: new Date(),
        due_date: new Date(dueDate),
        subtotal: purchaseOrder.subtotal,
        tax_amount: purchaseOrder.tax_amount,
        total_amount: purchaseOrder.total_amount,
        paid_amount: 0,
        status: "POSTED",
      },
    });

    // 4. Copy Items to vendor_bill_items
    await tx.vendor_bill_items.createMany({
      data: purchaseOrder.purchase_order_items.map((item) => ({
        bill_id: bill.id,
        product_id: item.product_id,
        description: null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_id: item.tax_id,
        tax_amount: item.tax_amount,
        line_total: item.line_total,
      })),
    });

    // 5. Find Purchase Journal (PJ)
    const purchaseJournal = await tx.journals.findFirst({
      where: {
        type: "PURCHASE",
        is_active: true,
      },
    });

    if (!purchaseJournal) {
      throw new ApiError(500, "Purchase journal (PJ) not found");
    }

    // 6. Find Purchases Expense account (5000)
    const purchasesExpenseAccount = await tx.accounts.findFirst({
      where: {
        code: "5000",
        is_active: true,
      },
    });

    if (!purchasesExpenseAccount) {
      throw new ApiError(500, "Purchases Expense account (5000) not found");
    }

    // 7. Find Accounts Payable account (2000)
    const payableAccount = await tx.accounts.findFirst({
      where: {
        code: "2000",
        is_active: true,
      },
    });

    if (!payableAccount) {
      throw new ApiError(500, "Accounts Payable account (2000) not found");
    }

    // 8. Create Posted Journal Entry (Debit Purchases Expense, Credit Accounts Payable)
    const journalEntry = await tx.journal_entries.create({
      data: {
        journal_id: purchaseJournal.id,
        entry_number: `JE-${Date.now()}`,
        entry_date: bill.bill_date,
        reference: bill.bill_number,
        source_type: "PURCHASE_BILL",
        source_id: bill.id,
        status: "POSTED",
        created_by: userId,
        posted_at: new Date(),
      },
    });

    await tx.journal_entry_lines.createMany({
      data: [
        {
          journal_entry_id: journalEntry.id,
          account_id: purchasesExpenseAccount.id,
          description: `Bill ${bill.bill_number}`,
          debit: bill.total_amount,
          credit: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: payableAccount.id,
          description: `Bill ${bill.bill_number}`,
          debit: 0,
          credit: bill.total_amount,
        },
      ],
    });

    // 9. Link Journal Entry to Bill
    const updatedBill = await tx.vendor_bills.update({
      where: { id: bill.id },
      data: { journal_entry_id: journalEntry.id },
      include: {
        vendor_bill_items: true,
        contacts: true,
        journal_entries: {
          include: {
            journal_entry_lines: {
              include: { accounts: true },
            },
          },
        },
      },
    });

    // 10. Update Purchase Order Status to CONFIRMED
    await tx.purchase_orders.update({
      where: { id: purchaseOrder.id },
      data: { status: "CONFIRMED" },
    });

    return updatedBill;
  });
};

export const getBills = async () => {
  return await prisma.vendor_bills.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      contacts: true,
      vendor_bill_items: {
        include: { products: true },
      },
      journal_entries: {
        include: {
          journal_entry_lines: {
            include: { accounts: true },
          },
        },
      },
    },
  });
};

export const getBillById = async (id) => {
  const bill = await prisma.vendor_bills.findUnique({
    where: { id },
    include: {
      contacts: true,
      vendor_bill_items: {
        include: { products: true },
      },
      journal_entries: {
        include: {
          journal_entry_lines: {
            include: { accounts: true },
          },
        },
      },
    },
  });

  if (!bill) {
    throw new ApiError(404, "Vendor bill not found");
  }

  return bill;
};
