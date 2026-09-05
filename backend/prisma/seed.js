import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding database...");

  // =========================
  // USERS
  // =========================

  const password = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.users.upsert({
    where: {
      email: "admin@urbanfurniture.com",
    },
    update: {
      password_hash: password,
      role: "ADMIN",
      is_active: true,
    },
    create: {
      name: "Admin",
      email: "admin@urbanfurniture.com",
      password_hash: password,
      role: "ADMIN",
    },
  });

  const accountant = await prisma.users.upsert({
    where: {
      email: "accountant@urbanfurniture.com",
    },
    update: {
      password_hash: password,
      role: "ACCOUNTANT",
      is_active: true,
    },
    create: {
      name: "Accountant",
      email: "accountant@urbanfurniture.com",
      password_hash: password,
      role: "ACCOUNTANT",
    },
  });

  // =========================
  // CONTACTS
  // =========================

  const customer1 = await prisma.contacts.create({
    data: {
      name: "ABC Interiors",
      type: "CUSTOMER",
      email: "abc@interiors.com",
      mobile: "9876543210",
      address: "MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  });

  const customer2 = await prisma.contacts.create({
    data: {
      name: "Modern Office Solutions",
      type: "CUSTOMER",
      email: "modern@office.com",
      mobile: "9876543211",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
    },
  });

  const vendor1 = await prisma.contacts.create({
    data: {
      name: "WoodCraft Suppliers",
      type: "VENDOR",
      email: "sales@woodcraft.com",
      mobile: "9876543212",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422001",
    },
  });

  // =========================
  // PRODUCTS
  // =========================

  const chair = await prisma.products.create({
    data: {
      name: "Executive Office Chair",
      type: "GOODS",
      sales_price: 8500,
      purchase_price: 5500,
      category: "Office Furniture",
      description: "Ergonomic executive chair",
    },
  });

  const desk = await prisma.products.create({
    data: {
      name: "Executive Desk",
      type: "GOODS",
      sales_price: 15000,
      purchase_price: 9500,
      category: "Office Furniture",
      description: "Premium wooden executive desk",
    },
  });

  const table = await prisma.products.create({
    data: {
      name: "Conference Table",
      type: "GOODS",
      sales_price: 25000,
      purchase_price: 17000,
      category: "Conference Furniture",
      description: "Large conference table",
    },
  });

  const installation = await prisma.products.create({
    data: {
      name: "Furniture Installation",
      type: "SERVICE",
      sales_price: 2500,
      purchase_price: 0,
      category: "Services",
      description: "Furniture installation service",
    },
  });

  // =========================
  // TAXES
  // =========================

  const gst18 = await prisma.taxes.create({
    data: {
      name: "GST 18%",
      rate: 18,
    },
  });

  const gst12 = await prisma.taxes.create({
    data: {
      name: "GST 12%",
      rate: 12,
    },
  });

  // =========================
  // ACCOUNTS
  // =========================

  const cash = await prisma.accounts.upsert({
    where: {
      code: "1000",
    },
    update: {},
    create: {
      code: "1000",
      name: "Cash",
      type: "ASSET",
    },
  });

  const bank = await prisma.accounts.upsert({
    where: {
      code: "1010",
    },
    update: {},
    create: {
      code: "1010",
      name: "Bank",
      type: "ASSET",
    },
  });

  const receivable = await prisma.accounts.upsert({
    where: {
      code: "1100",
    },
    update: {},
    create: {
      code: "1100",
      name: "Accounts Receivable",
      type: "ASSET",
    },
  });

  const inventory = await prisma.accounts.upsert({
    where: {
      code: "1200",
    },
    update: {},
    create: {
      code: "1200",
      name: "Inventory",
      type: "ASSET",
    },
  });

  const payable = await prisma.accounts.upsert({
    where: {
      code: "2000",
    },
    update: {},
    create: {
      code: "2000",
      name: "Accounts Payable",
      type: "LIABILITY",
    },
  });

  const capital = await prisma.accounts.upsert({
    where: {
      code: "3000",
    },
    update: {},
    create: {
      code: "3000",
      name: "Capital",
      type: "CAPITAL",
    },
  });

  const salesIncome = await prisma.accounts.upsert({
    where: {
      code: "4000",
    },
    update: {},
    create: {
      code: "4000",
      name: "Sales Income",
      type: "INCOME",
    },
  });

  const purchaseExpense = await prisma.accounts.upsert({
    where: {
      code: "5000",
    },
    update: {},
    create: {
      code: "5000",
      name: "Purchases Expense",
      type: "EXPENSE",
    },
  });

  const operatingExpense = await prisma.accounts.upsert({
    where: {
      code: "5100",
    },
    update: {},
    create: {
      code: "5100",
      name: "Operating Expense",
      type: "EXPENSE",
    },
  });

  // =========================
  // JOURNALS
  // =========================

  await prisma.journals.upsert({
    where: {
      code: "SJ",
    },
    update: {},
    create: {
      name: "Sales Journal",
      type: "SALES",
      code: "SJ",
      default_debit_account_id: receivable.id,
      default_credit_account_id: salesIncome.id,
    },
  });

  await prisma.journals.upsert({
    where: {
      code: "PJ",
    },
    update: {},
    create: {
      name: "Purchase Journal",
      type: "PURCHASE",
      code: "PJ",
      default_debit_account_id: purchaseExpense.id,
      default_credit_account_id: payable.id,
    },
  });

  await prisma.journals.upsert({
    where: {
      code: "CJ",
    },
    update: {},
    create: {
      name: "Cash Journal",
      type: "CASH",
      code: "CJ",
      default_debit_account_id: cash.id,
      default_credit_account_id: receivable.id,
    },
  });

  await prisma.journals.upsert({
    where: {
      code: "BJ",
    },
    update: {},
    create: {
      name: "Bank Journal",
      type: "BANK",
      code: "BJ",
      default_debit_account_id: bank.id,
      default_credit_account_id: receivable.id,
    },
  });

  // =========================
  // ANALYTIC ACCOUNTS
  // =========================

  const office = await prisma.analytic_accounts.create({
    data: {
      name: "Office Operations",
      type: "EXPENSE",
    },
  });

  const sales = await prisma.analytic_accounts.create({
    data: {
      name: "Furniture Sales",
      type: "INCOME",
    },
  });

  // =========================
  // BUDGET
  // =========================

  await prisma.budgets.create({
    data: {
      name: "Office Operations Budget",
      analytic_account_id: office.id,
      responsible_user_id: accountant.id,
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-12-31"),
      planned_amount: 500000,
    },
  });

  // =========================
  // SUCCESS
  // =========================

  console.log("");
  console.log("=================================");
  console.log("Seed completed successfully!");
  console.log("=================================");
  console.log("");

  console.log({
    users: 2,
    contacts: 3,
    products: 4,
    taxes: 2,
    accounts: 9,
    journals: 4,
    analyticAccounts: 2,
    budgets: 1,
  });

  console.log("");
  console.log("Login credentials:");
  console.log("Admin: admin@urbanfurniture.com");
  console.log("Accountant: accountant@urbanfurniture.com");
  console.log("Password: Admin@123");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });