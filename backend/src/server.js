import "dotenv/config";
import express from "express";
import prisma from "./config/prisma.js";
import accountRoutes from "./routes/accountRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import journalEntryRoutes from "./routes/journalEntryRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/journal-entries", journalEntryRoutes);
app.use("/api/sales-orders", salesRoutes);
app.use("/api/purchase-orders", purchaseRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Finora Financial ERP API is running",
  });
});

app.get("/api/system/schema-stats", async (req, res) => {
  try {
    const [
      users,
      contacts,
      products,
      taxes,
      salesOrders,
      salesOrderItems,
      customerInvoices,
      customerInvoiceItems,
      purchaseOrders,
      purchaseOrderItems,
      vendorBills,
      vendorBillItems,
      payments,
      accounts,
      journals,
      journalEntries,
      journalEntryLines,
      analyticAccounts,
      budgets
    ] = await Promise.all([
      prisma.users.count(),
      prisma.contacts.count(),
      prisma.products.count(),
      prisma.taxes.count(),
      prisma.sales_orders.count(),
      prisma.sales_order_items.count(),
      prisma.customer_invoices.count(),
      prisma.customer_invoice_items.count(),
      prisma.purchase_orders.count(),
      prisma.purchase_order_items.count(),
      prisma.vendor_bills.count(),
      prisma.vendor_bill_items.count(),
      prisma.payments.count(),
      prisma.accounts.count(),
      prisma.journals.count(),
      prisma.journal_entries.count(),
      prisma.journal_entry_lines.count(),
      prisma.analytic_accounts.count(),
      prisma.budgets.count()
    ]);

    res.json({
      success: true,
      data: {
        database: "PostgreSQL 16",
        orm: "Prisma ORM",
        totalTables: 19,
        tables: {
          users,
          contacts,
          products,
          taxes,
          sales_orders: salesOrders,
          sales_order_items: salesOrderItems,
          customer_invoices: customerInvoices,
          customer_invoice_items: customerInvoiceItems,
          purchase_orders: purchaseOrders,
          purchase_order_items: purchaseOrderItems,
          vendor_bills: vendorBills,
          vendor_bill_items: vendorBillItems,
          payments,
          accounts,
          journals,
          journal_entries: journalEntries,
          journal_entry_lines: journalEntryLines,
          analytic_accounts: analyticAccounts,
          budgets
        }
      }
    });
  } catch (error) {
    console.error("Schema stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch database schema statistics",
    });
  }
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Server and database are healthy",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});