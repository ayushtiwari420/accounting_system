import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import FinancialSummary from "../components/FinancialSummary";
import CurrencyDisplay from "../components/CurrencyDisplay";
import Modal from "../components/Modal";

const CreateSalesOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProductId = searchParams.get("product_id");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Quick Customer & Product Modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "CUSTOMER",
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    purchase_price: 3000,
    sales_price: 5000,
    category: "Office Furniture",
  });

  const [formData, setFormData] = useState({
    customer_id: "",
    order_date: new Date().toISOString().split("T")[0],
    payment_terms: "Immediate",
    autoInvoice: true,
  });

  const [lines, setLines] = useState([
    { product_id: "", quantity: 1, unit_price: 0, tax_rate: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contactsRes, productsRes] = await Promise.all([
          api.get("/contacts"),
          api.get("/products"),
        ]);

        const allContacts = contactsRes.data?.data || (Array.isArray(contactsRes.data) ? contactsRes.data : []);
        setCustomers(allContacts);

        const prodList = productsRes.data?.data || (Array.isArray(productsRes.data) ? productsRes.data : []);
        setProducts(prodList);

        const firstCustomer =
          allContacts.find((c) => c.type === "CUSTOMER" || c.type === "BUSINESSMAN") || allContacts[0];
        if (firstCustomer) {
          setFormData((prev) => ({ ...prev, customer_id: firstCustomer.id }));
        }

        if (urlProductId && prodList.length > 0) {
          const targetProd = prodList.find((p) => p.id === urlProductId);
          if (targetProd) {
            setLines([
              {
                product_id: targetProd.id,
                quantity: 1,
                unit_price: Number(targetProd.sales_price || targetProd.price || 0),
                tax_rate: 0,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error loading sales order masters:", err);
        setError("Failed to load customer or product master data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlProductId]);

  const handleQuickAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/contacts", newCustomerForm);
      const createdCustomer = res.data?.data || res.data;
      if (createdCustomer?.id) {
        setCustomers((prev) => [createdCustomer, ...prev]);
        setFormData((prev) => ({ ...prev, customer_id: createdCustomer.id }));
        setShowCustomerModal(false);
        setNewCustomerForm({ name: "", email: "", mobile: "", type: "CUSTOMER" });
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      alert(err.response?.data?.message || "Failed to create new customer");
    }
  };

  const handleQuickAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/products", newProductForm);
      const createdProd = res.data?.data || res.data;
      if (createdProd?.id) {
        setProducts((prev) => [createdProd, ...prev]);
        setLines((prevLines) => {
          const updated = [...prevLines];
          updated[0].product_id = createdProd.id;
          updated[0].unit_price = Number(createdProd.sales_price || createdProd.price || 0);
          return updated;
        });
        setShowProductModal(false);
        setNewProductForm({ name: "", purchase_price: 3000, sales_price: 5000, category: "Office Furniture" });
      }
    } catch (err) {
      console.error("Error creating product:", err);
      alert(err.response?.data?.message || "Failed to create new product");
    }
  };

  const handleProductSelect = (index, productId) => {
    const prod = products.find((p) => p.id === productId);
    const newLines = [...lines];
    newLines[index].product_id = productId;
    if (prod) {
      newLines[index].unit_price = Number(prod.price || prod.sales_price || 0);
    }
    setLines(newLines);
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { product_id: "", quantity: 1, unit_price: 0, tax_rate: 0 },
    ]);
  };

  const removeLine = (index) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
    0
  );
  const taxAmount = lines.reduce(
    (sum, l) =>
      sum +
      (Number(l.quantity) || 0) *
        (Number(l.unit_price) || 0) *
        ((Number(l.tax_rate) || 0) / 100),
    0
  );
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      setError("Please select a customer.");
      return;
    }

    const invalidLine = lines.find((l) => !l.product_id || l.quantity <= 0);
    if (invalidLine) {
      setError("Each line item must have a product and a quantity greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        customer_id: formData.customer_id,
        order_date: formData.order_date,
        items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
        })),
      };

      const res = await api.post("/sales-orders", payload);
      const createdId = res.data?.data?.id || res.data?.id;

      if (createdId && formData.autoInvoice) {
        try {
          const invRes = await api.post(`/invoices/from-sales-order/${createdId}`, {
            due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          });
          const invId = invRes.data?.data?.id || invRes.data?.id;
          if (invId) {
            navigate(`/invoices/${invId}`);
            return;
          }
        } catch (invErr) {
          console.warn("Auto-invoice generation error:", invErr);
        }
      }

      if (createdId) {
        navigate(`/sales-orders/${createdId}`);
      } else {
        navigate("/sales-orders");
      }
    } catch (err) {
      console.error("Error creating sales order:", err);
      setError(err.response?.data?.message || "Failed to create Sales Order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading master product & customer catalog..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="New Sales Order"
        subtitle="Document-style sales quotation & order entry"
        breadcrumbs={[
          { label: "Sales Orders", path: "/sales-orders" },
          { label: "Create Order" },
        ]}
        status="DRAFT"
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Header Metadata */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Customer Name *
              </label>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
              >
                + Add New Customer
              </button>
            </div>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer...</option>
              <optgroup label="👤 Registered Customers">
                {customers
                  .filter((c) => c.type === "CUSTOMER" || c.type === "BUSINESSMAN")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name} ({c.type}) — {c.email || "No Email"}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="🏢 Other Contacts & Vendors">
                {customers
                  .filter((c) => c.type !== "CUSTOMER" && c.type !== "BUSINESSMAN")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      🏢 {c.name} ({c.type}) — {c.email || "No Email"}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Order Date *
            </label>
            <input
              type="date"
              value={formData.order_date}
              onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Payment Terms
            </label>
            <input
              type="text"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              placeholder="e.g. Net 15, Immediate"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto-Issue Invoice Option Banner */}
        <div className="bg-white border border-[#1E3A8A] p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoInvoice"
              checked={formData.autoInvoice}
              onChange={(e) => setFormData({ ...formData, autoInvoice: e.target.checked })}
              className="w-4 h-4 text-[#1E3A8A] rounded focus:ring-[#1E3A8A] cursor-pointer"
            />
            <label htmlFor="autoInvoice" className="text-xs font-extrabold text-[#1E3A8A] cursor-pointer">
              Auto-Issue Customer Invoice & Post GL Journal Entry (Updates Profit & Loss Immediately)
            </label>
          </div>
          <span className="text-[10px] font-extrabold bg-[#1E3A8A] text-white px-2 py-0.5 rounded uppercase">
            Recommended
          </span>
        </div>

        {/* Dynamic Items Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-extrabold text-slate-900">Order Line Items</h3>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center space-x-1"
              >
                <i className="fa-solid fa-plus text-[10px]" />
                <span>Quick Add New Product</span>
              </button>
            </div>
            <button
              type="button"
              onClick={addLine}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              + Add Product Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/70 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-1/3">Product *</th>
                  <th className="py-2.5 px-3 text-right w-24">Qty *</th>
                  <th className="py-2.5 px-3 text-right w-36">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 text-right w-36">Subtotal (₹)</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, idx) => {
                  const lineSub = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);

                  return (
                    <tr key={idx}>
                      <td className="py-2.5 pr-2">
                        <select
                          value={line.product_id}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Furniture Product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku || "PROD"}) — Price: ₹{Number(p.price || p.sales_price || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, "quantity", e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-right font-mono font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unit_price}
                          onChange={(e) => handleLineChange(idx, "unit_price", e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-right font-mono font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                        <CurrencyDisplay amount={lineSub} size="sm" />
                      </td>

                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <FinancialSummary subtotal={subtotal} taxAmount={taxAmount} totalAmount={totalAmount} />

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <Link
            to="/sales-orders"
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100 transition-all"
          >
            {submitting ? "Creating Sales Order..." : "Create Sales Order"}
          </button>
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleQuickAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Customer Name / Company *
            </label>
            <input
              type="text"
              required
              value={newCustomerForm.name}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
              placeholder="e.g. Apex Office Tech"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contact Type
            </label>
            <select
              value={newCustomerForm.type}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="BUSINESSMAN">BUSINESSMAN (Commercial Entity)</option>
              <option value="VENDOR">VENDOR</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={newCustomerForm.email}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
              placeholder="customer@company.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phone / Mobile
            </label>
            <input
              type="text"
              value={newCustomerForm.mobile}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, mobile: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowCustomerModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-100"
            >
              Save Customer & Select &rarr;
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Quick Adding New Product */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Create & Add New Product"
      >
        <form onSubmit={handleQuickAddProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={newProductForm.name}
              onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
              placeholder="e.g. Executive Wooden Chair, Office Desk"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Purchase Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newProductForm.purchase_price}
                onChange={(e) => setNewProductForm({ ...newProductForm, purchase_price: Number(e.target.value) })}
                placeholder="3000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newProductForm.sales_price}
                onChange={(e) => setNewProductForm({ ...newProductForm, sales_price: Number(e.target.value) })}
                placeholder="5000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Category
            </label>
            <input
              type="text"
              value={newProductForm.category}
              onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
              placeholder="Office Furniture"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-100"
            >
              Save Product & Select &rarr;
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CreateSalesOrder;
