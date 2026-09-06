# 🏢 Finora Financial ERP System

**Finora Financial ERP** is an enterprise-grade accounting, financial operations, and inventory sourcing management system designed specifically for Urban Furniture Manufacturing & Sourcing.

Built on double-entry accounting principles, Finora ERP provides complete end-to-end management of Sales Orders, Customer Invoices, Procurement, Vendor Bills, Cost of Goods Sold (COGS), General Ledger Journals, Analytic Cost Centers, Executive P&L Statements with PDF Export, and an integrated **AI Copilot Assistant**.

---

## 🌟 Key Features

### 1. 📊 Executive Dashboard & Analytics
- Live overview of Total Revenue, Total Expenses, Net Operating Profit, and Gross Profit Margins.
- Transaction feeds for recent customer invoices, vendor bills, and cash flow movements.

### 2. 🧾 Customer Sales & Invoicing
- **Sales Orders (`/sales-orders`)**: Draft, inspect, and confirm customer furniture sales quotes.
- **Customer Invoices (`/invoices`)**: Generate line-item invoices with live payment tracking (`DRAFT`, `POSTED`, `PARTIALLY_PAID`, `PAID`).
- **Customer Payments (`/payments?type=customer`)**: Record cash and bank receipts against open invoices.

### 3. 📦 Procurement & Vendor Bills
- **Purchase Orders (`/purchase-orders`)**: Issue raw material POs to suppliers for teak wood, steel frames, and hardware.
- **Vendor Bills (`/bills`)**: Convert POs into posted vendor bills, automatically crediting Accounts Payable (`Account 2000`) and debiting Cost of Goods Sold (`Account 5000`).
- **Vendor Payments (`/payments?type=vendor`)**: Manage disbursements to timber and hardware suppliers.

### 4. 📚 Financial Accounting & General Ledger
- **Chart of Accounts (`/accounts`)**: Structured CoA hierarchy across Assets (1000-1200), Liabilities (2000-2200), Equity (3000), Revenue (4000), and Expenses (5000-5100).
- **Journals (`/journals`)**: Categorized logs for Sales Journal (SJ), Purchase Journal (PJ), Cash Journal (CJ), and Bank Journal (BJ).
- **Journal Entries (`/journal-entries`)**: Itemized double-entry General Ledger postings (`JE-2026-*`) maintaining strict debit-credit balance.

### 5. 🎯 Cost Centers & Budgeting
- **Analytic Accounts (`/analytic-accounts`)**: Track project-level profitability (e.g., Commercial Fitouts vs. Workshop Operations).
- **Budgets (`/budgets`)**: Define target expenditure caps and monitor live variance balances & percentage utilization.

### 6. 📄 Financial Statements & PDF Engine
- **P&L Reports (`/reports`)**: Executive Profit & Loss statements with period presets (*Last 1 Month*, *Last 6 Months*, *Last 1 Year*, *All Time*).
- **PDF Export**: One-click A4 executive statement printing and PDF downloading.

### 7. 🗄️ Database Architecture Inspector
- **Schema Inspector (`/database-architecture`)**: Live diagnostic view displaying active schema columns, foreign keys, and row counts across all **19 PostgreSQL database tables**.

### 8. 🤖 AI Copilot Assistant & Knowledge Base
- **Floating AI Assistant**: Circular interactive widget floating in the bottom-right corner.
- **Multi-Provider LLM Integration**: Auto-detects Google Gemini API, NVIDIA Nemotron NIM / OpenRouter, OpenAI, or custom endpoints.
- **Finora System Dataset (`finoraDataset.json`)**: Embedded RAG pipeline retrieving exact definitions and step-by-step navigation instructions strictly in terms of Finora ERP.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 8, Tailwind CSS, Framer Motion, Axios, React Router v7 |
| **Backend** | Node.js, Express.js 5, Prisma ORM 7, PostgreSQL (Render Cloud DB) |
| **Authentication** | JWT (JSON Web Tokens), Cookie-Parser, BcryptJS |
| **AI / LLM** | Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`), NVIDIA Nemotron NIM / OpenRouter |

---

## 📁 Directory Structure

```
financial_accounting_system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (19 PostgreSQL tables)
│   │   └── seed_urban_furniture.js    # Realistic seed data
│   ├── src/
│   │   ├── controllers/               # Express route handlers
│   │   ├── middlewares/               # Auth & error handling
│   │   ├── routes/                    # API endpoints
│   │   └── server.js                  # Entry server script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                # UI components & AIChatAssistant.jsx
│   │   ├── data/
│   │   │   └── finoraDataset.json     # RAG knowledge base dataset
│   │   ├── layouts/                   # DashboardLayout.jsx
│   │   ├── pages/                     # Application pages
│   │   ├── services/
│   │   │   ├── api.js                 # Axios API service
│   │   │   └── llmService.js          # LLM service & dataset search pipeline
│   │   └── App.jsx
│   ├── .env                           # Environment variables (API Keys)
│   └── package.json
└── README.md
```

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: Local instance or Render PostgreSQL database

### 2. Backend Setup
```bash
cd backend
npm install

# Push database schema & seed data
npm run db:push

# Start backend dev server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables in frontend/.env:
# VITE_GEMINI_API_KEY="your_gemini_api_key"
# VITE_NVIDIA_API_KEY="your_nvidia_api_key"
# VITE_LLM_PROVIDER="gemini"

# Start frontend dev server
npm run dev
```
Open **[http://localhost:5174](http://localhost:5174)** in your browser.

---

## 🔐 User Roles & Permissions

- **Admin**: Full read/write access across all financial ledgers, settings, database architecture, and user accounts.
- **Accountant**: Access to financial operations, posting invoices/bills, journal entries, and PDF financial reports.
- **Customer / Vendor Portal**: Read-only portal access to assigned sales orders, invoices, or vendor bills.

---

## 📝 License

This project is licensed under the **ISC License**.
