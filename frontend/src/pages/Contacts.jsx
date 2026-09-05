import React, { useState, useEffect } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "CUSTOMER",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/contacts");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []);
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/contacts", formData);
      setIsModalOpen(false);
      setFormData({
        name: "",
        type: "CUSTOMER",
        email: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
      fetchContacts();
    } catch (err) {
      console.error("Error creating contact:", err);
      setError(err.response?.data?.message || "Failed to create contact");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Contact Name",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm block">{row.name}</span>
          <span className="font-mono text-[10px] text-slate-400 font-semibold">{row.id ? row.id.substring(0, 8) : "—"}</span>
        </div>
      ),
    },
    {
      header: "Party Type",
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            row.type === "CUSTOMER"
              ? "bg-blue-100 text-blue-900 border border-blue-200"
              : row.type === "VENDOR"
              ? "bg-slate-100 text-slate-800 border border-slate-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {row.type}
        </span>
      ),
    },
    { header: "Email Address", accessor: (row) => row.email || "—" },
    { header: "Mobile Phone", accessor: (row) => row.mobile || "—" },
    { header: "Street Address", accessor: (row) => row.address || "—" },
    { header: "City", accessor: (row) => row.city || "—" },
    { header: "State", accessor: (row) => row.state || "—" },
    { header: "Pincode", accessor: (row) => row.pincode || "—" },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${row.is_active !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
          {row.is_active !== false ? "✓ ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
    {
      header: "Record ID",
      accessor: (row) => <span className="font-mono text-xs font-semibold text-slate-500">{row.id || "—"}</span>,
    },
  ];

  if (loading) return <Loading text="Loading Customer & Vendor master directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts Master Directory"
        subtitle="Customers, Vendors, and Supplier partner records"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add New Contact</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {contacts.length === 0 ? (
        <EmptyState
          icon="fa-address-book"
          title="No Contacts Created"
          description="Add customer and vendor contacts to begin creating Sales and Purchase Orders."
          actionLabel="Add Contact"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={contacts} emptyMessage="No contacts found." />
      )}

      {/* Add Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Customer or Vendor Contact"
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Contact / Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Azure Furniture, Nimesh Pathak"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Contact Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="CUSTOMER">CUSTOMER (Buyers)</option>
              <option value="VENDOR">VENDOR (Suppliers)</option>
              <option value="BOTH">BOTH (Customer & Vendor)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all"
            >
              {submitting ? "Saving Contact..." : "Save Contact"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contacts;
