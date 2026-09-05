import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import FinancialSummary from "../components/FinancialSummary";
import CurrencyDisplay from "../components/CurrencyDisplay";
import Modal from "../components/Modal";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Quick Vendor Modal state
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [newVendorForm, setNewVendorForm] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "VENDOR",
  });

  const [formData, setFormData] = useState({
    vendor_id: "",
    order_date: new Date().toISOString().split("T")[0],
    payment_terms: "Net 30",
    autoBill: true,
  });

  const [lines, setLines] = useState([
    { product_id: "", quantity: 1, unit_price: 0 },
  ]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const [contactsRes, productsRes] = await Promise.all([
        api.get("/contacts"),
        api.get("/products"),
      ]);

      const allContacts = contactsRes.data.data || [];
      setVendors(allContacts);

      const prodList = productsRes.data.data || [];
      setProducts(prodList);

      const firstVendor =
        allContacts.find((c) => c.type === "VENDOR" || c.type === "BUSINESSMAN") || allContacts[0];
      if (firstVendor) {
        setFormData((prev) => ({ ...prev, vendor_id: firstVendor.id }));
      }
    } catch (err) {
      console.error("Error loading purchase order masters:", err);
      setError("Failed to load vendor or product master data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  const handleQuickAddVendor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/contacts", newVendorForm);
      const createdVendor = res.data?.data || res.data;
      if (createdVendor?.id) {
        setVendors((prev) => [createdVendor, ...prev]);
        setFormData((prev) => ({ ...prev, vendor_id: createdVendor.id }));
        setShowVendorModal(false);
        setNewVendorForm({ name: "", email: "", mobile: "", type: "VENDOR" });
      }
    } catch (err) {
      console.error("Error creating vendor:", err);
      alert(err.response?.data?.message || "Failed to create new vendor");
    }
  };

  const handleProductSelect = (index, productId) => {
    const prod = products.find((p) => p.id === productId);
    const newLines = [...lines];
    newLines[index].product_id = productId;
    if (prod) {
      newLines[index].unit_price = Number(prod.cost || prod.purchase_price || prod.price || 0);
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
      { product_id: "", quantity: 1, unit_price: 0 },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor_id) {
      setError("Please select a vendor.");
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
        vendor_id: formData.vendor_id,
        order_date: formData.order_date,
        items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
        })),
      };

      const res = await api.post("/purchase-orders", payload);
      const createdId = res.data?.data?.id || res.data?.id;

      if (createdId && formData.autoBill) {
        try {
          const billRes = await api.post(`/bills/from-purchase-order/${createdId}`, {
            due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          });
          const billId = billRes.data?.data?.id || billRes.data?.id;
          if (billId) {
            navigate(`/bills/${billId}`);
            return;
          }
        } catch (billErr) {
          console.warn("Auto-bill generation error:", billErr);
        }
      }

      if (createdId) {
        navigate(`/purchase-orders/${createdId}`);
      } else {
        navigate("/purchase-orders");
      }
    } catch (err) {
      console.error("Error creating purchase order:", err);
      setError(err.response?.data?.message || "Failed to create Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading vendor catalog..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="New Purchase Order"
        subtitle="Supplier purchase procurement document"
        breadcrumbs={[
          { label: "Purchase Orders", path: "/purchase-orders" },
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
                Vendor / Supplier *
              </label>
              <button
                type="button"
                onClick={() => setShowVendorModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
              >
                + Add New Vendor
              </button>
            </div>
            <select
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Vendor / Supplier...</option>
              <optgroup label="🏢 Registered Vendors & Suppliers">
                {vendors
                  .filter((v) => v.type === "VENDOR" || v.type === "BUSINESSMAN")
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      🏢 {v.name} ({v.type}) — {v.email || "No Email"}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="👤 Other Business Contacts & Customers">
                {vendors
                  .filter((v) => v.type !== "VENDOR" && v.type !== "BUSINESSMAN")
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      👤 {v.name} ({v.type}) — {v.email || "No Email"}
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
              placeholder="e.g. Net 30, Immediate"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto-Issue Vendor Bill Option Banner */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoBill"
              checked={formData.autoBill}
              onChange={(e) => setFormData({ ...formData, autoBill: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="autoBill" className="text-xs font-extrabold text-amber-950 cursor-pointer">
              Auto-Issue Vendor Bill & Post GL Journal Entry (Updates Expense & P&L Immediately)
            </label>
          </div>
          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 uppercase">
            Recommended
          </span>
        </div>

        {/* Dynamic Items Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Procurement Items</h3>
            <button
              type="button"
              onClick={addLine}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
            >
              + Add Item Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 w-1/3">Product / Material *</th>
                  <th className="pb-3 text-right w-24">Qty *</th>
                  <th className="pb-3 text-right w-36">Unit Cost (₹)</th>
                  <th className="pb-3 text-right w-36">Subtotal (₹)</th>
                  <th className="pb-3 w-10"></th>
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
                              {p.name} ({p.sku || "PROD"}) — Cost: ₹{Number(p.cost || p.purchase_price || p.price || 0).toFixed(2)}
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
        <FinancialSummary subtotal={subtotal} totalAmount={subtotal} />

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <Link
            to="/purchase-orders"
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100 transition-all"
          >
            {submitting ? "Creating Purchase Order..." : "Create Purchase Order"}
          </button>
        </div>
      </form>

      {/* Quick Add Vendor Modal */}
      <Modal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        title="Add New Vendor / Supplier"
      >
        <form onSubmit={handleQuickAddVendor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Vendor Company Name *
            </label>
            <input
              type="text"
              required
              value={newVendorForm.name}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
              placeholder="e.g. Royal Wood Suppliers"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contact Type
            </label>
            <select
              value={newVendorForm.type}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="VENDOR">VENDOR (Supplier)</option>
              <option value="BUSINESSMAN">BUSINESSMAN (Commercial Entity)</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={newVendorForm.email}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })}
              placeholder="vendor@company.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phone / Mobile
            </label>
            <input
              type="text"
              value={newVendorForm.mobile}
              onChange={(e) => setNewVendorForm({ ...newVendorForm, mobile: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowVendorModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-100"
            >
              Save Vendor & Select &rarr;
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CreatePurchaseOrder;
