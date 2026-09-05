import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedRealWorldDataset() {
  console.log("🚀 Seeding Real-World Urban Furniture Accounting Dataset into PostgreSQL Database...");

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  // 1. CLEAN UP EXISTING TRANSACTIONS & MASTER DATA SAFELY
  console.log("🧹 Clearing old mock transactions...");
  await prisma.payments.deleteMany({});
  await prisma.journal_entry_lines.deleteMany({});
  await prisma.customer_invoice_items.deleteMany({});
  await prisma.customer_invoices.deleteMany({});
  await prisma.vendor_bill_items.deleteMany({});
  await prisma.vendor_bills.deleteMany({});
  await prisma.sales_order_items.deleteMany({});
  await prisma.sales_orders.deleteMany({});
  await prisma.purchase_order_items.deleteMany({});
  await prisma.purchase_orders.deleteMany({});
  await prisma.journal_entries.deleteMany({});
  await prisma.budgets.deleteMany({});
  await prisma.analytic_accounts.deleteMany({});
  await prisma.contacts.deleteMany({});
  await prisma.products.deleteMany({});
  await prisma.taxes.deleteMany({});
  await prisma.journals.deleteMany({});
  await prisma.accounts.deleteMany({});

  // 2. USERS
  console.log("👤 Creating Real Users...");
  await prisma.users.upsert({
    where: { email: "admin@finora.com" },
    update: { password_hash: passwordHash, role: "ADMIN", is_active: true },
    create: {
      name: "Admin Business Owner",
      email: "admin@finora.com",
      password_hash: passwordHash,
      role: "ADMIN",
    },
  });

  const accountantUser = await prisma.users.upsert({
    where: { email: "accountant@finora.com" },
    update: { password_hash: passwordHash, role: "ACCOUNTANT", is_active: true },
    create: {
      name: "Senior Financial Accountant",
      email: "accountant@finora.com",
      password_hash: passwordHash,
      role: "ACCOUNTANT",
    },
  });

  // 3. CONTACTS
  console.log("🏢 Creating Real Contacts (Customers & Vendors)...");
  const azureFurniture = await prisma.contacts.create({
    data: {
      name: "Azure Furniture Wholesalers",
      type: "VENDOR",
      email: "orders@azurefurniture.com",
      mobile: "+91 98201 12345",
      address: "Plot 42, Industrial Area Phase II",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400093",
    },
  });

  const rahulSharma = await prisma.contacts.create({
    data: {
      name: "Rahul Sharma Timber & Craft",
      type: "VENDOR",
      email: "rahul@sharmatimber.com",
      mobile: "+91 98192 88392",
      address: "12 Wood Market Road",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422001",
    },
  });

  const nimeshPathak = await prisma.contacts.create({
    data: {
      name: "Nimesh Pathak Architects",
      type: "CUSTOMER",
      email: "nimesh@pathakdesign.com",
      mobile: "+91 98700 44512",
      address: "802 Design Towers, BKC",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
    },
  });

  const apexTech = await prisma.contacts.create({
    data: {
      name: "Apex Tech Spaces Pvt Ltd",
      type: "CUSTOMER",
      email: "procurement@apextech.io",
      mobile: "+91 98331 99201",
      address: "Tech Park 4, Hinjewadi",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411057",
    },
  });

  await prisma.contacts.create({
    data: {
      name: "Grand Royale Hotels & Suites",
      type: "CUSTOMER",
      email: "purchase@grandroyale.com",
      mobile: "+91 99204 11823",
      address: "1 Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020",
    },
  });

  // 4. PRODUCTS
  console.log("🪑 Creating Real Furniture Products & Services...");
  const execChair = await prisma.products.create({
    data: {
      name: "Ergonomic Executive Chair",
      type: "GOODS",
      sales_price: 8500.0,
      purchase_price: 5500.0,
      category: "Office Furniture",
      description: "High-back mesh ergonomic executive office chair with lumbar support",
    },
  });

  const woodenDesk = await prisma.products.create({
    data: {
      name: "Solid Teak Wood Executive Desk",
      type: "GOODS",
      sales_price: 15000.0,
      purchase_price: 9500.0,
      category: "Office Furniture",
      description: "150cm premium teak wood executive desk with cable management",
    },
  });

  const confTable = await prisma.products.create({
    data: {
      name: "10-Seater Conference Table",
      type: "GOODS",
      sales_price: 35000.0,
      purchase_price: 22000.0,
      category: "Conference Furniture",
      description: "Modular conference room table with built-in power outlets",
    },
  });

  await prisma.products.create({
    data: {
      name: "Luxury Leather Lounge Sofa",
      type: "GOODS",
      sales_price: 45000.0,
      purchase_price: 30000.0,
      category: "Living & Reception",
      description: "3-seater genuine Italian leather reception sofa",
    },
  });

  const installationService = await prisma.products.create({
    data: {
      name: "On-Site Installation & Assembly",
      type: "SERVICE",
      sales_price: 3500.0,
      purchase_price: 0.0,
      category: "Services",
      description: "Professional assembly and placement service by certified technicians",
    },
  });

  // 5. TAXES
  console.log("🏷️ Creating Taxes...");
  const gst18 = await prisma.taxes.create({
    data: { name: "GST 18%", rate: 18.0 },
  });

  await prisma.taxes.create({
    data: { name: "GST 12%", rate: 12.0 },
  });

  // 6. CHART OF ACCOUNTS (CoA)
  console.log("📚 Creating Master Chart of Accounts...");
  const cashAcc = await prisma.accounts.create({
    data: { code: "1000", name: "Cash in Hand", type: "ASSET" },
  });

  const bankAcc = await prisma.accounts.create({
    data: { code: "1010", name: "HDFC Operating Bank Account", type: "ASSET" },
  });

  const receivableAcc = await prisma.accounts.create({
    data: { code: "1100", name: "Accounts Receivable (Debtors)", type: "ASSET" },
  });

  await prisma.accounts.create({
    data: { code: "1200", name: "Furniture Stock Inventory", type: "ASSET" },
  });

  const payableAcc = await prisma.accounts.create({
    data: { code: "2000", name: "Accounts Payable (Creditors)", type: "LIABILITY" },
  });

  await prisma.accounts.create({
    data: { code: "2200", name: "GST / Sales Tax Payable", type: "LIABILITY" },
  });

  await prisma.accounts.create({
    data: { code: "3000", name: "Shareholder Capital Equity", type: "CAPITAL" },
  });

  const salesAcc = await prisma.accounts.create({
    data: { code: "4000", name: "Furniture Sales Revenue", type: "INCOME" },
  });

  const purchasesAcc = await prisma.accounts.create({
    data: { code: "5000", name: "Raw Material & Goods Purchases", type: "EXPENSE" },
  });

  await prisma.accounts.create({
    data: { code: "5100", name: "Operating & Workshop Utility Expense", type: "EXPENSE" },
  });

  // 7. JOURNALS
  console.log("📖 Creating Accounting Journals...");
  const salesJournal = await prisma.journals.create({
    data: {
      name: "Customer Sales Journal",
      type: "SALES",
      code: "SJ",
      default_debit_account_id: receivableAcc.id,
      default_credit_account_id: salesAcc.id,
    },
  });

  const purchaseJournal = await prisma.journals.create({
    data: {
      name: "Vendor Purchase Journal",
      type: "PURCHASE",
      code: "PJ",
      default_debit_account_id: purchasesAcc.id,
      default_credit_account_id: payableAcc.id,
    },
  });

  await prisma.journals.create({
    data: {
      name: "Cash Receipts & Payments Journal",
      type: "CASH",
      code: "CJ",
      default_debit_account_id: cashAcc.id,
      default_credit_account_id: receivableAcc.id,
    },
  });

  const bankJournal = await prisma.journals.create({
    data: {
      name: "Bank Transactions Journal",
      type: "BANK",
      code: "BJ",
      default_debit_account_id: bankAcc.id,
      default_credit_account_id: receivableAcc.id,
    },
  });

  // 8. ANALYTIC ACCOUNTS & BUDGETS
  console.log("📊 Creating Analytic Accounts & Departmental Budgets...");
  const commercialAnalytic = await prisma.analytic_accounts.create({
    data: { name: "Commercial Office Projects", type: "EXPENSE" },
  });

  const showroomAnalytic = await prisma.analytic_accounts.create({
    data: { name: "Showroom & Workshop Operations", type: "EXPENSE" },
  });

  const corporateSalesAnalytic = await prisma.analytic_accounts.create({
    data: { name: "Corporate Client Sales", type: "INCOME" },
  });

  await prisma.budgets.create({
    data: {
      name: "Q1 Workshop & Material Budget",
      analytic_account_id: showroomAnalytic.id,
      responsible_user_id: accountantUser.id,
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-03-31"),
      planned_amount: 500000.0,
    },
  });

  await prisma.budgets.create({
    data: {
      name: "Annual Commercial Project Operating Budget",
      analytic_account_id: commercialAnalytic.id,
      responsible_user_id: accountantUser.id,
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-12-31"),
      planned_amount: 2500000.0,
    },
  });

  // 9. END-TO-END TRANSACTIONS

  // --- TRANSACTION 1: PURCHASE FLOW (PO -> Vendor Bill -> Payment) ---
  console.log("📦 Executing Purchase Transaction Flow (Azure Furniture)...");
  const po1 = await prisma.purchase_orders.create({
    data: {
      order_number: "PO-2026-001",
      vendor_id: azureFurniture.id,
      order_date: new Date("2026-02-01"),
      status: "CONFIRMED",
      subtotal: 245000.0,
      tax_amount: 44100.0,
      total_amount: 289100.0,
      created_by: accountantUser.id,
      purchase_order_items: {
        create: [
          {
            product_id: woodenDesk.id,
            quantity: 20,
            unit_price: 9500.0,
            tax_id: gst18.id,
            tax_amount: 34200.0,
            line_total: 224200.0,
          },
          {
            product_id: execChair.id,
            quantity: 10,
            unit_price: 5500.0,
            tax_id: gst18.id,
            tax_amount: 9900.0,
            line_total: 64900.0,
          },
        ],
      },
    },
  });

  const bill1 = await prisma.vendor_bills.create({
    data: {
      bill_number: "BILL-2026-001",
      vendor_id: azureFurniture.id,
      purchase_order_id: po1.id,
      bill_date: new Date("2026-02-05"),
      due_date: new Date("2026-03-05"),
      subtotal: 245000.0,
      tax_amount: 44100.0,
      total_amount: 289100.0,
      paid_amount: 150000.0,
      status: "PARTIALLY_PAID",
      vendor_bill_items: {
        create: [
          {
            product_id: woodenDesk.id,
            description: "20x Teak Executive Desks for Azure Order",
            quantity: 20,
            unit_price: 9500.0,
            tax_id: gst18.id,
            tax_amount: 34200.0,
            line_total: 224200.0,
          },
          {
            product_id: execChair.id,
            description: "10x Ergonomic Executive Chairs",
            quantity: 10,
            unit_price: 5500.0,
            tax_id: gst18.id,
            tax_amount: 9900.0,
            line_total: 64900.0,
          },
        ],
      },
    },
  });

  const jeBill1 = await prisma.journal_entries.create({
    data: {
      journal_id: purchaseJournal.id,
      entry_number: "JE-2026-001",
      entry_date: bill1.bill_date,
      reference: bill1.bill_number,
      source_type: "PURCHASE_BILL",
      source_id: bill1.id,
      status: "POSTED",
      created_by: accountantUser.id,
      posted_at: new Date("2026-02-05"),
      journal_entry_lines: {
        create: [
          {
            account_id: purchasesAcc.id,
            analytic_account_id: showroomAnalytic.id,
            description: "Material purchase for 20 desks & 10 chairs",
            debit: 289100.0,
            credit: 0.0,
          },
          {
            account_id: payableAcc.id,
            description: "Vendor Payable to Azure Furniture",
            debit: 0.0,
            credit: 289100.0,
          },
        ],
      },
    },
  });

  await prisma.vendor_bills.update({
    where: { id: bill1.id },
    data: { journal_entry_id: jeBill1.id },
  });

  const payBill1 = await prisma.payments.create({
    data: {
      payment_number: "PAY-2026-001",
      bill_id: bill1.id,
      journal_id: bankJournal.id,
      amount: 150000.0,
      payment_date: new Date("2026-02-10"),
      payment_method: "BANK",
      reference: "HDFC NEFT Ref #99210291",
      status: "POSTED",
      created_by: accountantUser.id,
    },
  });

  const jePayBill1 = await prisma.journal_entries.create({
    data: {
      journal_id: bankJournal.id,
      entry_number: "JE-2026-002",
      entry_date: payBill1.payment_date,
      reference: payBill1.payment_number,
      source_type: "VENDOR_PAYMENT",
      source_id: payBill1.id,
      status: "POSTED",
      created_by: accountantUser.id,
      posted_at: new Date("2026-02-10"),
      journal_entry_lines: {
        create: [
          {
            account_id: payableAcc.id,
            description: "Partial Vendor Payment to Azure Furniture",
            debit: 150000.0,
            credit: 0.0,
          },
          {
            account_id: bankAcc.id,
            description: "HDFC Bank Outflow for Azure Bill 1",
            debit: 0.0,
            credit: 150000.0,
          },
        ],
      },
    },
  });

  await prisma.payments.update({
    where: { id: payBill1.id },
    data: { journal_entry_id: jePayBill1.id },
  });

  // --- TRANSACTION 2: SALES FLOW #1 (SO -> Customer Invoice -> Full Payment) ---
  console.log("💰 Executing Sales Transaction Flow #1 (Nimesh Pathak)...");
  const so1 = await prisma.sales_orders.create({
    data: {
      order_number: "SO-2026-001",
      customer_id: nimeshPathak.id,
      order_date: new Date("2026-02-12"),
      status: "CONFIRMED",
      subtotal: 61000.0,
      tax_amount: 10980.0,
      total_amount: 71980.0,
      created_by: accountantUser.id,
      sales_order_items: {
        create: [
          {
            product_id: execChair.id,
            quantity: 5,
            unit_price: 8500.0,
            tax_id: gst18.id,
            tax_amount: 7650.0,
            line_total: 50150.0,
          },
          {
            product_id: woodenDesk.id,
            quantity: 1,
            unit_price: 15000.0,
            tax_id: gst18.id,
            tax_amount: 2700.0,
            line_total: 17700.0,
          },
          {
            product_id: installationService.id,
            quantity: 1,
            unit_price: 3500.0,
            tax_id: gst18.id,
            tax_amount: 630.0,
            line_total: 4130.0,
          },
        ],
      },
    },
  });

  const inv1 = await prisma.customer_invoices.create({
    data: {
      invoice_number: "INV-2026-001",
      customer_id: nimeshPathak.id,
      sales_order_id: so1.id,
      invoice_date: new Date("2026-02-14"),
      due_date: new Date("2026-03-14"),
      subtotal: 61000.0,
      tax_amount: 10980.0,
      total_amount: 71980.0,
      paid_amount: 71980.0,
      status: "PAID",
      customer_invoice_items: {
        create: [
          {
            product_id: execChair.id,
            description: "5x Ergonomic Executive Chairs for Architect Office",
            quantity: 5,
            unit_price: 8500.0,
            tax_id: gst18.id,
            tax_amount: 7650.0,
            line_total: 50150.0,
          },
          {
            product_id: woodenDesk.id,
            description: "1x Teak Wood Executive Desk",
            quantity: 1,
            unit_price: 15000.0,
            tax_id: gst18.id,
            tax_amount: 2700.0,
            line_total: 17700.0,
          },
          {
            product_id: installationService.id,
            description: "Assembly & Placement",
            quantity: 1,
            unit_price: 3500.0,
            tax_id: gst18.id,
            tax_amount: 630.0,
            line_total: 4130.0,
          },
        ],
      },
    },
  });

  const jeInv1 = await prisma.journal_entries.create({
    data: {
      journal_id: salesJournal.id,
      entry_number: "JE-2026-003",
      entry_date: inv1.invoice_date,
      reference: inv1.invoice_number,
      source_type: "SALES_INVOICE",
      source_id: inv1.id,
      status: "POSTED",
      created_by: accountantUser.id,
      posted_at: new Date("2026-02-14"),
      journal_entry_lines: {
        create: [
          {
            account_id: receivableAcc.id,
            description: "Customer Receivable - Nimesh Pathak",
            debit: 71980.0,
            credit: 0.0,
          },
          {
            account_id: salesAcc.id,
            analytic_account_id: corporateSalesAnalytic.id,
            description: "Sales Revenue for Invoice INV-2026-001",
            debit: 0.0,
            credit: 71980.0,
          },
        ],
      },
    },
  });

  await prisma.customer_invoices.update({
    where: { id: inv1.id },
    data: { journal_entry_id: jeInv1.id },
  });

  const payInv1 = await prisma.payments.create({
    data: {
      payment_number: "PAY-2026-002",
      invoice_id: inv1.id,
      journal_id: bankJournal.id,
      amount: 71980.0,
      payment_date: new Date("2026-02-18"),
      payment_method: "BANK",
      reference: "HDFC UPI Payment #88102930",
      status: "POSTED",
      created_by: accountantUser.id,
    },
  });

  const jePayInv1 = await prisma.journal_entries.create({
    data: {
      journal_id: bankJournal.id,
      entry_number: "JE-2026-004",
      entry_date: payInv1.payment_date,
      reference: payInv1.payment_number,
      source_type: "CUSTOMER_PAYMENT",
      source_id: payInv1.id,
      status: "POSTED",
      created_by: accountantUser.id,
      posted_at: new Date("2026-02-18"),
      journal_entry_lines: {
        create: [
          {
            account_id: bankAcc.id,
            description: "Customer Receipt from Nimesh Pathak",
            debit: 71980.0,
            credit: 0.0,
          },
          {
            account_id: receivableAcc.id,
            description: "Clear Receivable for Invoice INV-2026-001",
            debit: 0.0,
            credit: 71980.0,
          },
        ],
      },
    },
  });

  await prisma.payments.update({
    where: { id: payInv1.id },
    data: { journal_entry_id: jePayInv1.id },
  });

  // --- TRANSACTION 3: SALES FLOW #2 (SO -> Customer Invoice -> Partial Payment) ---
  console.log("📈 Executing Sales Transaction Flow #2 (Apex Tech Spaces)...");
  const so2 = await prisma.sales_orders.create({
    data: {
      order_number: "SO-2026-002",
      customer_id: apexTech.id,
      order_date: new Date("2026-02-20"),
      status: "CONFIRMED",
      subtotal: 172000.0,
      tax_amount: 30960.0,
      total_amount: 202960.0,
      created_by: accountantUser.id,
      sales_order_items: {
        create: [
          {
            product_id: confTable.id,
            quantity: 2,
            unit_price: 35000.0,
            tax_id: gst18.id,
            tax_amount: 12600.0,
            line_total: 82600.0,
          },
          {
            product_id: execChair.id,
            quantity: 12,
            unit_price: 8500.0,
            tax_id: gst18.id,
            tax_amount: 18360.0,
            line_total: 120360.0,
          },
        ],
      },
    },
  });

  const inv2 = await prisma.customer_invoices.create({
    data: {
      invoice_number: "INV-2026-002",
      customer_id: apexTech.id,
      sales_order_id: so2.id,
      invoice_date: new Date("2026-02-22"),
      due_date: new Date("2026-03-22"),
      subtotal: 172000.0,
      tax_amount: 30960.0,
      total_amount: 202960.0,
      paid_amount: 100000.0,
      status: "PARTIALLY_PAID",
      customer_invoice_items: {
        create: [
          {
            product_id: confTable.id,
            description: "2x 10-Seater Modular Conference Tables for Hinjewadi Office",
            quantity: 2,
            unit_price: 35000.0,
            tax_id: gst18.id,
            tax_amount: 12600.0,
            line_total: 82600.0,
          },
          {
            product_id: execChair.id,
            description: "12x Ergonomic Executive Chairs",
            quantity: 12,
            unit_price: 8500.0,
            tax_id: gst18.id,
            tax_amount: 18360.0,
            line_total: 120360.0,
          },
        ],
      },
    },
  });

  const jeInv2 = await prisma.journal_entries.create({
    data: {
      journal_id: salesJournal.id,
      entry_number: "JE-2026-005",
      entry_date: inv2.invoice_date,
      reference: inv2.invoice_number,
      source_type: "SALES_INVOICE",
      source_id: inv2.id,
      status: "POSTED",
      created_by: accountantUser.id,
      posted_at: new Date("2026-02-22"),
      journal_entry_lines: {
        create: [
          {
            account_id: receivableAcc.id,
            description: "Customer Receivable - Apex Tech Spaces",
            debit: 202960.0,
            credit: 0.0,
          },
          {
            account_id: salesAcc.id,
            analytic_account_id: corporateSalesAnalytic.id,
            description: "Sales Revenue for Conference Room Fitout",
            debit: 0.0,
            credit: 202960.0,
          },
        ],
      },
    },
  });

  await prisma.customer_invoices.update({
    where: { id: inv2.id },
    data: { journal_entry_id: jeInv2.id },
  });

  const payInv2 = await prisma.payments.create({
    data: {
      payment_number: "PAY-2026-003",
      invoice_id: inv2.id,
      journal_id: bankJournal.id,
      amount: 100000.0,
      payment_date: new Date("2026-02-25"),
      payment_method: "BANK",
      reference: "RTGS Transfer #77109201",
      status: "POSTED",
      created_by: accountantUser.id,
    },
  });

  const jePayInv2 = await prisma.journal_entries.create({
    data: {
      journal_id: bankJournal.id,
      entry_number: "JE-2026-006",
      entry_date: payInv2.payment_date,
      reference: payInv2.payment_number,
      source_type: "CUSTOMER_PAYMENT",
      source_id: payInv2.id,
      status: "POSTED",
      created_by: accountantUser.id,
      posted_at: new Date("2026-02-25"),
      journal_entry_lines: {
        create: [
          {
            account_id: bankAcc.id,
            description: "Partial Receipt from Apex Tech Spaces",
            debit: 100000.0,
            credit: 0.0,
          },
          {
            account_id: receivableAcc.id,
            description: "Reduce Receivable for INV-2026-002",
            debit: 0.0,
            credit: 100000.0,
          },
        ],
      },
    },
  });

  await prisma.payments.update({
    where: { id: payInv2.id },
    data: { journal_entry_id: jePayInv2.id },
  });

  console.log("🎉 SUCCESS: Comprehensive Urban Furniture Financial Accounting Dataset Seeded!");
}

seedRealWorldDataset()
  .catch((err) => {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
