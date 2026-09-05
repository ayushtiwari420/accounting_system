import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";
import Loading from "../components/Loading";
import CurrencyDisplay from "../components/CurrencyDisplay";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { formatDate } from "../utils/formatters";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    arAmount: 0,
    apAmount: 0,
    totalMoneyCollected: 0,
    totalMoneyDisbursed: 0,
    bankCashLiquidBalance: 0,
    recentInvoices: [],
    recentBills: [],
    recentPayments: [],
    recentJournalEntries: [],
  });

  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  // Quick Booking Modals
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [executing, setExecuting] = useState(false);

  // Quick Sale State
  const [saleForm, setSaleForm] = useState({
    customer_id: "",
    product_id: "",
    quantity: 1,
    unit_price: 0,
    payment_method: "BANK",
  });

  // Quick Purchase State
  const [purchaseForm, setPurchaseForm] = useState({
    vendor_id: "",
    product_id: "",
    quantity: 1,
    unit_price: 0,
    payment_method: "BANK",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        plRes,
        invoicesRes,
        billsRes,
        journalEntriesRes,
        contactsRes,
        productsRes,
        paymentsRes,
      ] = await Promise.all([
        api.get("/reports/profit-loss"),
        api.get("/invoices"),
        api.get("/bills"),
        api.get("/journal-entries"),
        api.get("/contacts"),
        api.get("/products"),
        api.get("/payments"),
      ]);

      const pl = plRes.data?.data || plRes.data || {};
      const invoices = invoicesRes.data?.data || invoicesRes.data || [];
      const bills = billsRes.data?.data || billsRes.data || [];
      const entries = journalEntriesRes.data?.data || journalEntriesRes.data || [];
      const allContacts = contactsRes.data?.data || contactsRes.data || [];
      const allProducts = productsRes.data?.data || productsRes.data || [];
      const payments = paymentsRes.data?.data || paymentsRes.data || [];

      // Calculate AR (Accounts Receivable)
      const ar = invoices.reduce((sum, inv) => {
        const total = Number(inv.total_amount || 0);
        const paid = Number(inv.paid_amount || 0);
        return sum + Math.max(0, total - paid);
      }, 0);

      // Calculate AP (Accounts Payable)
      const ap = bills.reduce((sum, b) => {
        const total = Number(b.total_amount || 0);
        const paid = Number(b.paid_amount || 0);
        return sum + Math.max(0, total - paid);
      }, 0);

      // Calculate Actual Money Inflow (Customer Payments Received)
      const collected = payments
        .filter((p) => Boolean(p.invoice_id || p.customer_invoices))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      // Calculate Actual Money Outflow (Vendor Payments Disbursed)
      const disbursed = payments
        .filter((p) => Boolean(p.bill_id || p.vendor_bills))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const liquidCash = collected - disbursed;

      setMetrics({
        totalRevenue: Number(pl.total_income || 0),
        totalExpense: Number(pl.total_expense || 0),
        netProfit: Number(pl.net_profit || 0),
        arAmount: ar,
        apAmount: ap,
        totalMoneyCollected: collected,
        totalMoneyDisbursed: disbursed,
        bankCashLiquidBalance: liquidCash,
        recentInvoices: invoices.slice(0, 5),
        recentBills: bills.slice(0, 5),
        recentPayments: payments.slice(0, 5),
        recentJournalEntries: entries.slice(0, 5),
      });

      setContacts(allContacts);
      setProducts(allProducts);

      const custs = allContacts.filter((c) => c.type === "CUSTOMER" || c.type === "BOTH");
      const vends = allContacts.filter((c) => c.type === "VENDOR" || c.type === "BOTH");

      if (custs.length > 0) {
        setSaleForm((prev) => ({ ...prev, customer_id: custs[0].id }));
      } else if (allContacts.length > 0) {
        setSaleForm((prev) => ({ ...prev, customer_id: allContacts[0].id }));
      }

      if (vends.length > 0) {
        setPurchaseForm((prev) => ({ ...prev, vendor_id: vends[0].id }));
      } else if (allContacts.length > 0) {
        setPurchaseForm((prev) => ({ ...prev, vendor_id: allContacts[0].id }));
      }

      if (allProducts.length > 0) {
        const defaultProd = allProducts[0];
        const defaultPrice = Number(defaultProd.sales_price || defaultProd.price || 0);
        const defaultCost = Number(defaultProd.purchase_price || defaultProd.cost || 0);

        setSaleForm((prev) => ({
          ...prev,
          product_id: defaultProd.id,
          unit_price: defaultPrice,
        }));

        setPurchaseForm((prev) => ({
          ...prev,
          product_id: defaultProd.id,
          unit_price: defaultCost,
        }));
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load live financial command metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectSaleProduct = (prodId) => {
    const prod = products.find((p) => p.id === prodId);
    const price = prod ? Number(prod.sales_price || prod.price || 0) : 0;
    setSaleForm((prev) => ({
      ...prev,
      product_id: prodId,
      unit_price: price > 0 ? price : prev.unit_price,
    }));
  };

  const handleSelectPurchaseProduct = (prodId) => {
    const prod = products.find((p) => p.id === prodId);
    const cost = prod ? Number(prod.purchase_price || prod.cost || 0) : 0;
    setPurchaseForm((prev) => ({
      ...prev,
      product_id: prodId,
      unit_price: cost > 0 ? cost : prev.unit_price,
    }));
  };

  // Execute 1-Click Sale Booking
  const handleExecuteFullSale = async (e) => {
    e.preventDefault();
    if (!saleForm.customer_id || !saleForm.product_id) {
      setError("Please select both a Customer and a Product.");
      return;
    }

    try {
      setExecuting(true);
      setError(null);
      setSuccessMsg(null);

      // Step 1: Create Sales Order
      const soPayload = {
        customer_id: saleForm.customer_id,
        order_date: new Date().toISOString().split("T")[0],
        items: [
          {
            product_id: saleForm.product_id,
            quantity: Number(saleForm.quantity),
            unit_price: Number(saleForm.unit_price),
          },
        ],
      };

      const soRes = await api.post("/sales-orders", soPayload);
      const salesOrder = soRes.data?.data || soRes.data || soRes;
      const soId = salesOrder.id;

      // Step 2: Post Customer Invoice
      const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
      const invRes = await api.post(`/invoices/from-sales-order/${soId}`, { due_date: dueDate });
      const invoice = invRes.data?.data || invRes.data || invRes;
      const invId = invoice.id;

      // Step 3: Register Payment
      await api.post("/payments/customer", {
        invoice_id: invId,
        amount: Number(invoice.total_amount || Number(saleForm.quantity) * Number(saleForm.unit_price)),
        payment_method: saleForm.payment_method,
        payment_date: new Date().toISOString().split("T")[0],
        reference: `Quick Book Payment for ${invoice.invoice_number || "SO"}`,
      });

      setShowSaleModal(false);
      setSuccessMsg(
        `✓ Furniture Sale Successfully Booked! Created Sales Order (${salesOrder.order_number || "SO"}), Posted Invoice (${invoice.invoice_number || "INV"}), and Registered Payment in Ledger. Profit & Loss updated!`
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error executing quick sale:", err);
      setError(err.response?.data?.message || err.message || "Failed to execute sale booking");
    } finally {
      setExecuting(false);
    }
  };

  // Execute 1-Click Purchase Booking
  const handleExecuteFullPurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.vendor_id || !purchaseForm.product_id) {
      setError("Please select both a Vendor and a Product.");
      return;
    }

    try {
      setExecuting(true);
      setError(null);
      setSuccessMsg(null);

      // Step 1: Create Purchase Order
      const poPayload = {
        vendor_id: purchaseForm.vendor_id,
        order_date: new Date().toISOString().split("T")[0],
        items: [
          {
            product_id: purchaseForm.product_id,
            quantity: Number(purchaseForm.quantity),
            unit_price: Number(purchaseForm.unit_price),
          },
        ],
      };

      const poRes = await api.post("/purchase-orders", poPayload);
      const purchaseOrder = poRes.data?.data || poRes.data || poRes;
      const poId = purchaseOrder.id;

      // Step 2: Convert PO to Vendor Bill
      const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
      const billRes = await api.post(`/bills/from-purchase-order/${poId}`, { due_date: dueDate });
      const bill = billRes.data?.data || billRes.data || billRes;
      const billId = bill.id;

      // Step 3: Register Vendor Payment
      await api.post("/payments/vendor", {
        bill_id: billId,
        amount: Number(bill.total_amount || Number(purchaseForm.quantity) * Number(purchaseForm.unit_price)),
        payment_method: purchaseForm.payment_method,
        payment_date: new Date().toISOString().split("T")[0],
        reference: `Quick Book Payment for ${bill.bill_number || "PO"}`,
      });

      setShowPurchaseModal(false);
      setSuccessMsg(
        `✓ Furniture Purchase Successfully Booked! Created PO (${purchaseOrder.order_number || "PO"}), Generated Bill (${bill.bill_number || "BILL"}), and Disbursed Payment. Accounts & P&L updated!`
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error executing quick purchase:", err);
      setError(err.response?.data?.message || err.message || "Failed to execute purchase booking");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <Loading text="Initializing Executive Dashboard & Real-Time Ledgers..." />;

  const filteredCustomers = contacts.filter((c) => c.type === "CUSTOMER" || c.type === "BOTH");
  const customersList = filteredCustomers.length > 0 ? filteredCustomers : contacts;

  const filteredVendors = contacts.filter((c) => c.type === "VENDOR" || c.type === "BOTH");
  const vendorsList = filteredVendors.length > 0 ? filteredVendors : contacts;

  const isContactUser = user?.role === "CONTACT";

  return (
    <div className="space-y-6">
      {/* Contact Portal Banner if logged in as CONTACT */}
      {isContactUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-950 text-white p-6 rounded-2xl shadow-lg border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border border-emerald-500/30">
                ACTIVE CUSTOMER / VENDOR PORTAL
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Welcome, {user?.name || "Valued Contact"}</h2>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              You are logged in as a Contact User. You can order furniture products, view your invoices/bills, and register payments directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <i className="fa-solid fa-couch"></i>
              <span>Browse Products Catalog</span>
            </Link>
            <Link
              to="/invoices"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-[#1E3A8A] border border-[#1E3A8A] font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              <i className="fa-solid fa-credit-card"></i>
              <span>Pay My Invoices</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
      >
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] animate-ping"></span>
            <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-widest">
              {isContactUser ? "BUSINESS OVERVIEW & TRANSACTIONS" : "EXECUTIVE COMMAND CENTER"}
            </span>
          </div>
          <h1 className="text-[32px] font-bold leading-[1.2] text-[#1E3A8A]">Urban Furniture ERP Overview</h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Real-time business operations, double-entry ledgers, and live transaction booking studio.
          </p>
        </div>

        {/* Quick Transaction Action Bar */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSaleModal(true)}
            className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <i className="fa-solid fa-bolt"></i>
            <span>Book Sale Transaction</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPurchaseModal(true)}
            className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Book Purchase Transaction</span>
          </motion.button>

          <Link
            to="/reports"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-[#1E3A8A] font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-[#1E3A8A]"
          >
            <i className="fa-solid fa-chart-line text-[#1E3A8A]"></i>
            <span>View P&L Statements</span>
          </Link>
        </div>
      </motion.div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Animated Financial & Money Transaction KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money Received (Inflow) */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-[#1E3A8A] text-white p-5 rounded-2xl border border-[#1E3A8A] shadow-sm space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider">Money Inflow (Collected)</span>
            <i className="fa-solid fa-arrow-down-left text-white text-base"></i>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{metrics.totalMoneyCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-blue-100 font-medium">Actual Customer Cash & Bank Payments</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-40"></div>
        </motion.div>

        {/* Money Paid Out (Outflow) */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white text-[#1E3A8A] p-5 rounded-2xl border border-[#1E3A8A] shadow-sm space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-[#1E3A8A]">
            <span className="text-xs font-bold uppercase tracking-wider">Money Outflow (Disbursed)</span>
            <i className="fa-solid fa-arrow-up-right text-[#1E3A8A] text-base"></i>
          </div>
          <div className="text-2xl font-black text-[#1E3A8A] font-mono">
            ₹{metrics.totalMoneyDisbursed.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Actual Vendor Cash & Bank Disbursements</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E3A8A]"></div>
        </motion.div>

        {/* Liquid Cash Funds */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-[#1E3A8A] text-white p-5 rounded-2xl border border-[#1E3A8A] shadow-sm space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider">Liquid Funds (Bank & Cash)</span>
            <i className="fa-solid fa-wallet text-white text-base"></i>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{metrics.bankCashLiquidBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-blue-100 font-medium">1000 Cash + 1010 Bank Account Funds</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-40"></div>
        </motion.div>

        {/* Net Profit */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white text-[#1E3A8A] p-5 rounded-2xl border border-[#1E3A8A] shadow-sm space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-[#1E3A8A]">
            <span className="text-xs font-bold uppercase tracking-wider">Net Operating Profit</span>
            <i className="fa-solid fa-scale-balanced text-[#1E3A8A] text-base"></i>
          </div>
          <div className="text-2xl font-black font-mono text-[#1E3A8A]">
            ₹{metrics.netProfit.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Revenue (4000) - Expense (5000)</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E3A8A]"></div>
        </motion.div>
      </div>

      {/* Secondary Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Invoiced Revenue</span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹{metrics.totalRevenue.toLocaleString()}</div>
          </div>
          <span className="p-2.5 bg-white text-[#1E3A8A] rounded-xl font-bold text-xs border border-[#1E3A8A]">
            Account 4000
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Billed Expenses</span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹{metrics.totalExpense.toLocaleString()}</div>
          </div>
          <span className="p-2.5 bg-white text-[#1E3A8A] rounded-xl font-bold text-xs border border-[#1E3A8A]">
            Account 5000
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Receivables (AR)</span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹{metrics.arAmount.toLocaleString()}</div>
          </div>
          <span className="p-2.5 bg-white text-[#1E3A8A] rounded-xl font-bold text-xs border border-[#1E3A8A]">
            Uncollected
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Payables (AP)</span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹{metrics.apAmount.toLocaleString()}</div>
          </div>
          <span className="p-2.5 bg-white text-[#1E3A8A] rounded-xl font-bold text-xs border border-[#1E3A8A]">
            Unpaid Bills
          </span>
        </div>
      </div>

      {/* Main Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-file-invoice-dollar text-blue-600 text-sm"></i>
              <h3 className="font-black text-blue-950 text-xs uppercase tracking-wider">Active Customer Invoices</h3>
            </div>
            <Link to="/invoices" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
              View All Invoices &rarr;
            </Link>
          </div>

          <div className="p-4 flex-1">
            {metrics.recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No customer invoices issued yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-blue-100 bg-blue-50/50 text-blue-950 uppercase tracking-wider font-extrabold">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {metrics.recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-blue-50/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                          <Link to={`/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{inv.contacts?.name || "N/A"}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={inv.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay amount={inv.total_amount} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Bills */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-receipt text-blue-800 text-sm"></i>
              <h3 className="font-black text-blue-950 text-xs uppercase tracking-wider">Active Vendor Bills</h3>
            </div>
            <Link to="/bills" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
              View All Bills &rarr;
            </Link>
          </div>

          <div className="p-4 flex-1">
            {metrics.recentBills.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No vendor bills recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-blue-100 bg-blue-50/50 text-blue-950 uppercase tracking-wider font-extrabold">
                      <th className="py-2.5 px-3">Bill #</th>
                      <th className="py-2.5 px-3">Vendor</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {metrics.recentBills.map((b) => (
                      <tr key={b.id} className="hover:bg-blue-50/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                          <Link to={`/bills/${b.id}`}>{b.bill_number}</Link>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{b.contacts?.name || "N/A"}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={b.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay amount={b.total_amount} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Money Transactions & Bank Settlement Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-[#1E3A8A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-100 font-mono font-bold text-xs uppercase tracking-widest">LIVE CASHFLOW LOG</span>
            <span className="text-blue-200">•</span>
            <h3 className="font-black text-sm text-white uppercase tracking-wider">Real-Time Money Transactions (Bank & Cash Vouchers)</h3>
          </div>
          <Link
            to="/payments"
            className="text-xs font-bold bg-white text-[#1E3A8A] hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View All Payments &rarr;
          </Link>
        </div>

        <div className="p-4">
          {metrics.recentPayments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No money transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[#1E3A8A] uppercase tracking-wider font-extrabold">
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Transaction Flow</th>
                    <th className="py-2.5 px-3">Party / Contact</th>
                    <th className="py-2.5 px-3">Target Doc</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3 text-right">Actual Money Transacted</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {metrics.recentPayments.map((p) => {
                    const isInbound = Boolean(p.invoice_id || p.customer_invoices);
                    const contact = p.customer_invoices?.contacts || p.vendor_bills?.contacts;
                    const docNumber = p.customer_invoices?.invoice_number || p.vendor_bills?.bill_number || "Direct Voucher";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1E3A8A]">
                          <Link to={`/payments/${p.id}`}>{p.payment_number}</Link>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isInbound
                                ? "bg-[#1E3A8A] text-white border border-[#1E3A8A]"
                                : "bg-white text-[#1E3A8A] border border-[#1E3A8A]"
                            }`}
                          >
                            {isInbound ? "↑ Customer Inflow" : "↓ Vendor Outflow"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{contact?.name || "Direct Party"}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-slate-700 font-semibold">{docNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-800">
                          {p.payment_method === "CASH" ? "1000 Cash" : "1010 Bank"}
                        </td>
                        <td
                          className="py-2.5 px-3 text-right font-mono font-black text-sm text-[#1E3A8A]"
                        >
                          {isInbound ? "+" : "-"}₹{Number(p.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#1E3A8A] text-white uppercase">
                            ✓ SETTLED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* General Ledger Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-[#1E3A8A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-200 font-mono font-bold text-xs uppercase tracking-widest">REAL-TIME GL LOG</span>
            <span className="text-blue-300">•</span>
            <h3 className="font-black text-sm text-white uppercase tracking-wider">Double-Entry Journal Postings</h3>
          </div>
          <Link
            to="/journal-entries"
            className="text-xs font-bold bg-white text-[#1E3A8A] hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Audit All Entries &rarr;
          </Link>
        </div>

        <div className="p-4">
          {metrics.recentJournalEntries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No journal entries posted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50/50 text-blue-950 uppercase tracking-wider font-extrabold">
                    <th className="py-2.5 px-3">Entry #</th>
                    <th className="py-2.5 px-3">Posting Date</th>
                    <th className="py-2.5 px-3">Source Type</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Debit / Credit Impact</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {metrics.recentJournalEntries.map((je) => {
                    const lines = je.journal_entry_lines || [];
                    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);

                    return (
                      <tr key={je.id} className="hover:bg-blue-50/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                          <Link to={`/journal-entries/${je.id}`}>{je.entry_number}</Link>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(je.entry_date)}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-900 font-bold">{je.source_type || "MANUAL"}</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{je.reference || "—"}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay amount={totalDebit} size="sm" color="default" />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                            ✓ POSTED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QUICK SALE BOOKING MODAL */}
      <Modal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        title="Book Furniture Sale (Full Workflow Execution)"
      >
        <form onSubmit={handleExecuteFullSale} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 font-medium">
            ⚡ <strong>Automated Workflow Execution:</strong> Select a customer & furniture product. This 1-click action will create a <strong>Sales Order</strong>, issue a <strong>Customer Invoice</strong>, register <strong>Payment</strong>, and update the <strong>P&L Statement</strong> in real-time.
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Customer Contact *
            </label>
            <select
              value={saleForm.customer_id}
              onChange={(e) => setSaleForm({ ...saleForm, customer_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer...</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email || "Customer"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Furniture Product *
              </label>
              <select
                value={saleForm.product_id}
                onChange={(e) => handleSelectSaleProduct(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Furniture Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{Number(p.sales_price || p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Selling Price per Unit (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={saleForm.unit_price}
                onChange={(e) => setSaleForm({ ...saleForm, unit_price: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Payment Account *
              </label>
              <select
                value={saleForm.payment_method}
                onChange={(e) => setSaleForm({ ...saleForm, payment_method: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="BANK">1010 HDFC Bank Ledger</option>
                <option value="CASH">1000 Cash Account Ledger</option>
              </select>
            </div>
          </div>

          {/* Impact preview */}
          <div className="bg-blue-950 text-white p-4 rounded-xl space-y-1.5 font-mono text-xs">
            <div className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">CALCULATED TRANSACTION IMPACT</div>
            <div className="flex justify-between font-bold">
              <span>Gross Sales Revenue (Account 4000):</span>
              <span className="text-emerald-400">+₹{(Number(saleForm.quantity) * Number(saleForm.unit_price)).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSaleModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={executing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all"
            >
              {executing ? "Processing Transaction..." : "Execute Sale Transaction"}
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK PURCHASE BOOKING MODAL */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Book Furniture Purchase (Full Workflow Execution)"
      >
        <form onSubmit={handleExecuteFullPurchase} className="space-y-4">
          <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl text-xs text-slate-900 font-medium">
            📦 <strong>Procurement Workflow Execution:</strong> Select a vendor & product. This 1-click action will create a <strong>Purchase Order</strong>, generate a <strong>Vendor Bill</strong>, disburse <strong>Payment</strong>, and record expenses in the General Ledger.
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Vendor / Supplier Contact *
            </label>
            <select
              value={purchaseForm.vendor_id}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Vendor...</option>
              {vendorsList.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.email || "Vendor"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Furniture / Materials Product *
              </label>
              <select
                value={purchaseForm.product_id}
                onChange={(e) => handleSelectPurchaseProduct(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Cost: ₹{Number(p.purchase_price || p.cost || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Unit Purchase Cost (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={purchaseForm.unit_price}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, unit_price: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Disbursement Account *
              </label>
              <select
                value={purchaseForm.payment_method}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, payment_method: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="BANK">1010 HDFC Bank Ledger</option>
                <option value="CASH">1000 Cash Account Ledger</option>
              </select>
            </div>
          </div>

          {/* Impact preview */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1.5 font-mono text-xs">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CALCULATED TRANSACTION IMPACT</div>
            <div className="flex justify-between font-bold">
              <span>Purchases Expense (Account 5000):</span>
              <span className="text-rose-400">+₹{(Number(purchaseForm.quantity) * Number(purchaseForm.unit_price)).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPurchaseModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={executing}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-bold shadow-md transition-all"
            >
              {executing ? "Processing Procurement..." : "Execute Purchase Transaction"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
