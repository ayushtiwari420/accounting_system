import axios from "axios";
import finoraDataset from "../data/finoraDataset.json";

/**
 * Finora System Dataset Knowledge Base
 */
export { finoraDataset };

/**
 * Finora Dataset Retrieval Pipeline
 * Matches user query against dataset definitions, tools, and workflows
 */
export const searchFinoraDataset = (query) => {
  if (!query) return { matchedDefs: [], matchedTools: [], contextText: "" };
  const lower = query.toLowerCase();

  const matchedDefs = finoraDataset.definitions.filter(
    (item) =>
      lower.includes(item.term.toLowerCase()) ||
      item.term.toLowerCase().split(" ").some((word) => word.length > 3 && lower.includes(word)) ||
      (item.route && lower.includes(item.route.toLowerCase()))
  );

  const matchedTools = finoraDataset.tools.filter(
    (tool) =>
      lower.includes(tool.tool_name.toLowerCase()) ||
      tool.tool_name.toLowerCase().split(" ").some((word) => word.length > 3 && lower.includes(word)) ||
      (tool.route && lower.includes(tool.route.toLowerCase()))
  );

  let contextText = "";
  if (matchedDefs.length > 0) {
    contextText += "\nFINORA DATASET DEFINITIONS MATCHED:\n" + matchedDefs.map((d) => `- ${d.term} (${d.route}): ${d.definition}`).join("\n");
  }
  if (matchedTools.length > 0) {
    contextText += "\nFINORA DATASET TOOL GUIDES MATCHED:\n" + matchedTools.map((t) => `- ${t.tool_name} (${t.route}): ${t.purpose}\n  Steps: ${t.steps.join(" -> ")}`).join("\n");
  }

  return { matchedDefs, matchedTools, contextText };
};

/**
 * Finora ERP System Prompt & Knowledge Base for LLM Training / Context Window
 */
export const FINORA_SYSTEM_PROMPT = `
You are the official Finora Financial ERP Knowledge Base Assistant.
Finora is an enterprise business accounting and finance management system for Urban Furniture Manufacturing & Sourcing.

YOUR BOUNDARIES & TONE RULES:
1. SYSTEM SCOPE: You are specialized strictly in Finora Financial ERP. Answer all questions regarding system definitions, tools, accounting concepts, feature navigation, and PostgreSQL database architecture thoroughly and politely.
2. COURTEOUS & POLITE TONE:
   - Always respond in a polite, warm, professional, and helpful manner.
   - Explain all concepts and tool usage steps with extreme clarity and courtesy.
3. OFF-TOPIC BOUNDARY GUARD:
   - If a user asks a question unrelated to Finora Financial ERP, respond politely with:
     "I am specialized strictly in Finora Financial ERP. While I cannot assist with topics outside our system, I would be delighted to help you navigate Finora ERP, manage your invoices, or explain any accounting workflows!"
4. RESPONSE STRUCTURE:
   - Provide clean, step-by-step instructions (Step 1, Step 2, Step 3) with exact page routes (e.g., /invoices, /sales-orders, /reports, /accounts).
5. CONCEPTUAL & "WHY" QUESTIONS:
   - When the user asks "why" a feature exists (e.g., "why there is a journals", "why double entry", "why analytic accounts"), explain the core business purpose, accounting necessity, and benefit of that feature specifically inside Finora Financial ERP.
   - Provide a warm, clear explanation first, followed by step-by-step instructions on where to find and manage it in the system.

FINORA ERP PAGE ROUTES & TASK INSTRUCTIONS:
- Dashboard (/): Overview KPIs, Total Revenue, Expenses, Net Profit, Recent Invoices, Recent Bills.
- Sales Orders (/sales-orders): Create, view, confirm customer furniture sales orders.
- Customer Invoices (/invoices): View customer invoices, line items, payment status (DRAFT/POSTED/PAID/PARTIALLY_PAID).
- Customer Payments (/payments?type=customer): Record receipts from customers.
- Purchase Orders (/purchase-orders): Create purchase orders to vendors for teak wood, steel, hardware.
- Vendor Bills (/bills): Convert POs to posted vendor bills, track Accounts Payable (Account 2000) & COGS (Account 5000).
- Vendor Payments (/payments?type=vendor): Record disbursements to suppliers.
- Chart of Accounts (/accounts): Manage Assets (1000-1200), Liabilities (2000-2200), Capital (3000), Revenue (4000), Expenses (5000-5100).
- Journals (/journals): Sales (SJ), Purchase (PJ), Cash (CJ), Bank (BJ) journals.
- Journal Entries (/journal-entries): View or create double-entry General Ledger posted entries (JE-2026-*).
- Analytic Accounts (/analytic-accounts): Define cost centers (Commercial Projects, Workshop Operations).
- Budgets (/budgets): Define target planned budgets and monitor variance balance & % utilization.
- Financial Statements (/reports): Executive Profit & Loss (P&L) statement with period presets (Last 1 Month, Last 6 Months, Last 1 Year, All Time), Gross Profit Margin %, Net Profit Margin %, itemized GL transaction logs, and "Download PDF / Print Statement".
- Contacts Master (/contacts): Manage Customers and Vendors master records, phone numbers, addresses, tax IDs.
- Products Master (/products): Manage Furniture Goods and Assembly Services catalog.
- Database Architecture (/database-architecture): Inspect live schema stats and row counts for all 19 PostgreSQL tables.
- User Roles & Access: Admin (Full Access), Accountant (Financial Operations & Posting), Customer/Vendor (Read-Only Portal Access).
`;

/**
 * Call LLM API function with dataset RAG pipeline
 * @param {string} userMessage - User query
 * @param {Array} chatHistory - Previous message history
 */
export const queryLLMApi = async (userMessage, chatHistory = []) => {
  const apiKey = import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_NVIDIA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
  const customUrl = import.meta.env.VITE_LLM_API_URL;
  const provider = (import.meta.env.VITE_LLM_PROVIDER || "auto").toLowerCase();

  // Retrieve dataset context using search pipeline
  const { matchedDefs, matchedTools, contextText } = searchFinoraDataset(userMessage);
  const augmentedPrompt = `${FINORA_SYSTEM_PROMPT}\n${contextText}`;

  if (apiKey || customUrl) {
    try {
      // 1. NVIDIA NIM / Nemotron API Connection
      if (provider === "nvidia" || provider === "nemotron" || apiKey?.startsWith("nvapi-")) {
        const targetUrl = customUrl || "https://integrate.api.nvidia.com/v1/chat/completions";
        const modelName = import.meta.env.VITE_LLM_MODEL || "nvidia/nemotron-4-340b-instruct";

        const res = await axios.post(
          targetUrl,
          {
            model: modelName,
            messages: [
              { role: "system", content: augmentedPrompt },
              ...chatHistory.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
              })),
              { role: "user", content: userMessage },
            ],
            temperature: 0.2,
            top_p: 0.7,
            max_tokens: 1024,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        const reply = res.data?.choices?.[0]?.message?.content;
        if (reply) return reply;
      }

      // 2. OpenRouter API (Supports NVIDIA Nemotron free models on OpenRouter)
      if (provider === "openrouter" || apiKey?.startsWith("sk-or-")) {
        const targetUrl = customUrl || "https://openrouter.ai/api/v1/chat/completions";
        const modelName = import.meta.env.VITE_LLM_MODEL || "nvidia/nemotron-4-340b-instruct:free";

        const res = await axios.post(
          targetUrl,
          {
            model: modelName,
            messages: [
              { role: "system", content: augmentedPrompt },
              ...chatHistory.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
              })),
              { role: "user", content: userMessage },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "Finora ERP Assistant",
            },
          }
        );
        const reply = res.data?.choices?.[0]?.message?.content;
        if (reply) return reply;
      }

      // 3. Google Gemini API Connection
      if (provider === "gemini" || apiKey?.startsWith("AIza") || apiKey?.startsWith("AQ.") || import.meta.env.VITE_GEMINI_API_KEY) {
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || apiKey;
        try {
          const geminiUrl = customUrl || `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
          const res = await axios.post(geminiUrl, {
            contents: [
              {
                role: "user",
                parts: [{ text: `${augmentedPrompt}\n\nUser Question: ${userMessage}` }],
              },
            ],
          });
          const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return reply;
        } catch (geminiErr) {
          // Fallback to gemini-2.0-flash if 1.5 is unavailable
          console.warn("Gemini 1.5 flash failed, attempting Gemini 2.0 flash...", geminiErr.message);
          const gemini2Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
          const res2 = await axios.post(gemini2Url, {
            contents: [
              {
                role: "user",
                parts: [{ text: `${augmentedPrompt}\n\nUser Question: ${userMessage}` }],
              },
            ],
          });
          const reply2 = res2.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply2) return reply2;
        }
      }

      // 4. OpenAI / Generic OpenAI-Compatible REST Connection (Groq, Custom Endpoints)
      const targetUrl = customUrl || "https://api.openai.com/v1/chat/completions";
      const res = await axios.post(
        targetUrl,
        {
          model: import.meta.env.VITE_LLM_MODEL || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: augmentedPrompt },
            ...chatHistory.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: userMessage },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
        }
      );
      const reply = res.data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    } catch (err) {
      console.error("LLM API Call Error:", err.response?.data || err.message);
    }
  }

  // Dataset-driven fallback pipeline
  if (matchedTools.length > 0) {
    const t = matchedTools[0];
    return `**${t.tool_name}** (${t.route})\n${t.purpose}\n\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
  }

  if (matchedDefs.length > 0) {
    const d = matchedDefs[0];
    return `**${d.term}** (${d.route})\n${d.definition}`;
  }

  const lowerQuery = userMessage.toLowerCase();
  const erpKeywords = [
    "sales", "invoice", "order", "bill", "vendor", "customer", "purchase", "product", "furniture",
    "profit", "loss", "p&l", "pdf", "report", "journal", "entry", "account", "ledger", "budget",
    "analytic", "contact", "database", "postgres", "role", "login", "payment", "revenue", "cogs",
    "debit", "credit", "tax", "gst", "finora", "erp", "how", "where", "check", "create", "download"
  ];

  if (!erpKeywords.some((kw) => lowerQuery.includes(kw))) {
    return "I am specialized strictly in Finora Financial ERP. While I cannot assist with topics outside our system, I would be delighted to help you navigate Finora ERP, manage your invoices, or explain any accounting workflows!";
  }

  return `Here is how you perform this task in Finora Financial ERP:
1. Go to the relevant page in the left sidebar (e.g. /invoices, /sales-orders, /bills, /reports).
2. Complete the action steps specified in the tool menu.
3. Review your posted transactions in Chart of Accounts (/accounts) or Financial Statements (/reports).`;
};
