import prisma  from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createSalesInvoiceEntry = async (
  invoice,
  userId
) => {
  return await prisma.$transaction(async (tx) => {

    // 1. Find Sales Journal
    const salesJournal = await tx.journals.findFirst({
      where: {
        type: "SALES",
        is_active: true
      }
    });

    if (!salesJournal) {
      throw new ApiError(
        500,
        "Sales journal not found"
      );
    }

    // 2. Find Accounts Receivable account
    const receivableAccount =
      await tx.accounts.findFirst({
        where: {
          code: "1100",
          is_active: true
        }
      });

    if (!receivableAccount) {
      throw new ApiError(
        500,
        "Accounts Receivable account not found"
      );
    }

    // 3. Find Sales Income account
    const salesIncomeAccount =
      await tx.accounts.findFirst({
        where: {
          code: "4000",
          is_active: true
        }
      });

    if (!salesIncomeAccount) {
      throw new ApiError(
        500,
        "Sales Income account not found"
      );
    }

    // 4. Create journal entry
    const journalEntry =
      await tx.journal_entries.create({
        data: {
          journal_id: salesJournal.id,
          entry_number: `JE-${Date.now()}`,
          entry_date: invoice.invoice_date,
          reference: invoice.invoice_number,
          source_type: "SALES_INVOICE",
          source_id: invoice.id,
          status: "POSTED",
          created_by: userId,
          posted_at: new Date()
        }
      });

    // 5. Create accounting lines
    await tx.journal_entry_lines.createMany({
      data: [
        {
          journal_entry_id: journalEntry.id,
          account_id: receivableAccount.id,
          description: `Invoice ${invoice.invoice_number}`,
          debit: invoice.total_amount,
          credit: 0
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: salesIncomeAccount.id,
          description: `Invoice ${invoice.invoice_number}`,
          debit: 0,
          credit: invoice.total_amount
        }
      ]
    });

    return journalEntry;
  });
};