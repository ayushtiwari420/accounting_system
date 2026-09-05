import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createCustomerPayment = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Customer Invoice
    const invoice = await tx.customer_invoices.findUnique({
      where: {
        id: data.invoice_id,
      },
      include: {
        contacts: true,
      },
    });

    if (!invoice) {
      throw new ApiError(404, "Customer invoice not found");
    }

    if (invoice.status === "PAID") {
      throw new ApiError(400, "Invoice is already fully paid");
    }

    if (invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
      throw new ApiError(
        400,
        `Cannot pay an invoice with status '${invoice.status}'`
      );
    }

    const currentPaid = Number(invoice.paid_amount || 0);
    const totalAmount = Number(invoice.total_amount);
    const remainingDue = totalAmount - currentPaid;
    const paymentAmount = Number(data.amount);

    if (paymentAmount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than 0");
    }

    if (paymentAmount > remainingDue + 0.01) {
      throw new ApiError(
        400,
        `Payment amount (${paymentAmount}) exceeds remaining balance (${remainingDue.toFixed(2)})`
      );
    }

    // 2. Determine Payment Account (1000 Cash or 1010 Bank)
    const accountCode = data.payment_method === "CASH" ? "1000" : "1010";
    const paymentAccount = await tx.accounts.findFirst({
      where: {
        code: accountCode,
        is_active: true,
      },
    });

    if (!paymentAccount) {
      throw new ApiError(
        500,
        `Payment account for code '${accountCode}' not found`
      );
    }

    // 3. Find Accounts Receivable (1100)
    const receivableAccount = await tx.accounts.findFirst({
      where: {
        code: "1100",
        is_active: true,
      },
    });

    if (!receivableAccount) {
      throw new ApiError(500, "Accounts Receivable account not found");
    }

    // 4. Find Journal (CJ for Cash, BJ for Bank)
    let journalId = data.journal_id;
    if (!journalId) {
      const journalCode = data.payment_method === "CASH" ? "CJ" : "BJ";
      const journal = await tx.journals.findFirst({
        where: {
          code: journalCode,
          is_active: true,
        },
      });

      if (!journal) {
        throw new ApiError(500, `Journal for code '${journalCode}' not found`);
      }
      journalId = journal.id;
    }

    const paymentDate = data.payment_date
      ? new Date(data.payment_date)
      : new Date();

    // 5. Create Payment Record
    const count = await tx.payments.count();
    const paymentNumber = `PAY-2026-${String(count + 1).padStart(3, "0")}`;
    const payment = await tx.payments.create({
      data: {
        payment_number: paymentNumber,
        invoice_id: invoice.id,
        journal_id: journalId,
        amount: paymentAmount,
        payment_date: paymentDate,
        payment_method: data.payment_method,
        reference: data.reference || `Payment for ${invoice.invoice_number}`,
        status: "POSTED",
        created_by: userId,
      },
    });

    // 6. Create Posted Journal Entry
    const journalEntry = await tx.journal_entries.create({
      data: {
        journal_id: journalId,
        entry_number: `JE-${Date.now()}`,
        entry_date: paymentDate,
        reference: payment.payment_number,
        source_type: "CUSTOMER_PAYMENT",
        source_id: payment.id,
        status: "POSTED",
        created_by: userId,
        posted_at: new Date(),
      },
    });

    // 7. Create Journal Entry Lines (Debit Cash/Bank, Credit Accounts Receivable)
    await tx.journal_entry_lines.createMany({
      data: [
        {
          journal_entry_id: journalEntry.id,
          account_id: paymentAccount.id,
          description: `Payment ${payment.payment_number} for Invoice ${invoice.invoice_number}`,
          debit: paymentAmount,
          credit: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: receivableAccount.id,
          description: `Payment ${payment.payment_number} for Invoice ${invoice.invoice_number}`,
          debit: 0,
          credit: paymentAmount,
        },
      ],
    });

    // 8. Link Journal Entry to Payment
    await tx.payments.update({
      where: { id: payment.id },
      data: { journal_entry_id: journalEntry.id },
    });

    // 9. Update Customer Invoice paid_amount & status
    const newPaidAmount = currentPaid + paymentAmount;
    const newStatus =
      newPaidAmount >= totalAmount - 0.01 ? "PAID" : "PARTIALLY_PAID";

    await tx.customer_invoices.update({
      where: { id: invoice.id },
      data: {
        paid_amount: newPaidAmount,
        status: newStatus,
      },
    });

    // 10. Return completed payment
    return await tx.payments.findUnique({
      where: { id: payment.id },
      include: {
        customer_invoices: true,
        journals: true,
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
  });
};

export const createVendorPayment = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Vendor Bill
    const bill = await tx.vendor_bills.findUnique({
      where: {
        id: data.bill_id,
      },
      include: {
        contacts: true,
      },
    });

    if (!bill) {
      throw new ApiError(404, "Vendor bill not found");
    }

    if (bill.status === "PAID") {
      throw new ApiError(400, "Bill is already fully paid");
    }

    if (bill.status === "CANCELLED" || bill.status === "DRAFT") {
      throw new ApiError(
        400,
        `Cannot pay a bill with status '${bill.status}'`
      );
    }

    const currentPaid = Number(bill.paid_amount || 0);
    const totalAmount = Number(bill.total_amount);
    const remainingDue = totalAmount - currentPaid;
    const paymentAmount = Number(data.amount);

    if (paymentAmount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than 0");
    }

    if (paymentAmount > remainingDue + 0.01) {
      throw new ApiError(
        400,
        `Payment amount (${paymentAmount}) exceeds remaining balance (${remainingDue.toFixed(2)})`
      );
    }

    // 2. Determine Payment Account (1000 Cash or 1010 Bank)
    const accountCode = data.payment_method === "CASH" ? "1000" : "1010";
    const paymentAccount = await tx.accounts.findFirst({
      where: {
        code: accountCode,
        is_active: true,
      },
    });

    if (!paymentAccount) {
      throw new ApiError(
        500,
        `Payment account for code '${accountCode}' not found`
      );
    }

    // 3. Find Accounts Payable (2000)
    const payableAccount = await tx.accounts.findFirst({
      where: {
        code: "2000",
        is_active: true,
      },
    });

    if (!payableAccount) {
      throw new ApiError(500, "Accounts Payable account not found");
    }

    // 4. Find Journal (CJ for Cash, BJ for Bank)
    let journalId = data.journal_id;
    if (!journalId) {
      const journalCode = data.payment_method === "CASH" ? "CJ" : "BJ";
      const journal = await tx.journals.findFirst({
        where: {
          code: journalCode,
          is_active: true,
        },
      });

      if (!journal) {
        throw new ApiError(500, `Journal for code '${journalCode}' not found`);
      }
      journalId = journal.id;
    }

    const paymentDate = data.payment_date
      ? new Date(data.payment_date)
      : new Date();

    // 5. Create Payment Record (bill_id set, invoice_id null)
    const countV = await tx.payments.count();
    const paymentNumber = `PAY-2026-${String(countV + 1).padStart(3, "0")}`;
    const payment = await tx.payments.create({
      data: {
        payment_number: paymentNumber,
        bill_id: bill.id,
        journal_id: journalId,
        amount: paymentAmount,
        payment_date: paymentDate,
        payment_method: data.payment_method,
        reference: data.reference || `Payment for Bill ${bill.bill_number}`,
        status: "POSTED",
        created_by: userId,
      },
    });

    // 6. Create Posted Journal Entry (Debit Accounts Payable, Credit Cash/Bank)
    const journalEntry = await tx.journal_entries.create({
      data: {
        journal_id: journalId,
        entry_number: `JE-${Date.now()}`,
        entry_date: paymentDate,
        reference: payment.payment_number,
        source_type: "VENDOR_PAYMENT",
        source_id: payment.id,
        status: "POSTED",
        created_by: userId,
        posted_at: new Date(),
      },
    });

    await tx.journal_entry_lines.createMany({
      data: [
        {
          journal_entry_id: journalEntry.id,
          account_id: payableAccount.id,
          description: `Payment ${payment.payment_number} for Bill ${bill.bill_number}`,
          debit: paymentAmount,
          credit: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: paymentAccount.id,
          description: `Payment ${payment.payment_number} for Bill ${bill.bill_number}`,
          debit: 0,
          credit: paymentAmount,
        },
      ],
    });

    // 7. Link Journal Entry to Payment
    await tx.payments.update({
      where: { id: payment.id },
      data: { journal_entry_id: journalEntry.id },
    });

    // 8. Update Vendor Bill paid_amount & status
    const newPaidAmount = currentPaid + paymentAmount;
    const newStatus =
      newPaidAmount >= totalAmount - 0.01 ? "PAID" : "PARTIALLY_PAID";

    await tx.vendor_bills.update({
      where: { id: bill.id },
      data: {
        paid_amount: newPaidAmount,
        status: newStatus,
      },
    });

    // 9. Return completed payment
    return await tx.payments.findUnique({
      where: { id: payment.id },
      include: {
        vendor_bills: true,
        journals: true,
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
  });
};

export const getPayments = async () => {
  return await prisma.payments.findMany({
    orderBy: {
      payment_date: "desc",
    },
    include: {
      customer_invoices: {
        include: {
          contacts: true,
          customer_invoice_items: {
            include: { products: true },
          },
        },
      },
      vendor_bills: {
        include: {
          contacts: true,
          vendor_bill_items: {
            include: { products: true },
          },
        },
      },
      journals: true,
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

export const getPaymentById = async (id) => {
  const payment = await prisma.payments.findUnique({
    where: { id },
    include: {
      customer_invoices: {
        include: {
          contacts: true,
          customer_invoice_items: {
            include: { products: true },
          },
        },
      },
      vendor_bills: {
        include: {
          contacts: true,
          vendor_bill_items: {
            include: { products: true },
          },
        },
      },
      journals: true,
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

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return payment;
};
