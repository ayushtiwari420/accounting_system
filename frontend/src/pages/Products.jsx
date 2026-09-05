import React, { useState, useEffect } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import CurrencyDisplay from "../components/CurrencyDisplay";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "GOODS",
    sales_price: 0,
    purchase_price: 0,
    category: "Office Furniture",
    description: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products master catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/products", {
        ...formData,
        sales_price: Number(formData.sales_price),
        purchase_price: Number(formData.purchase_price),
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        type: "GOODS",
        sales_price: 0,
        purchase_price: 0,
        category: "Office Furniture",
        description: "",
      });
      fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Product / Furniture Name",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm block">{row.name}</span>
          <span className="font-mono text-[10px] text-slate-400 font-semibold">{row.sku || row.id?.substring(0, 8) || "—"}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (row) => row.category || "Office Furniture",
    },
    {
      header: "Product Type",
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            row.type === "GOODS" || row.type === "CONSUMABLE"
              ? "bg-blue-100 text-blue-900 border border-blue-200"
              : "bg-slate-100 text-slate-800 border border-slate-200"
          }`}
        >
          {row.type || "GOODS"}
        </span>
      ),
    },
    {
      header: "Sales Price",
      align: "right",
      accessor: (row) => (
        <CurrencyDisplay amount={row.price || row.sales_price} size="sm" color="success" />
      ),
    },
    {
      header: "Purchase Cost",
      align: "right",
      accessor: (row) => (
        <CurrencyDisplay amount={row.cost || row.purchase_price} size="sm" color="default" />
      ),
    },
    {
      header: "Estimated Margin",
      align: "right",
      accessor: (row) => {
        const sales = Number(row.sales_price || row.price || 0);
        const cost = Number(row.purchase_price || row.cost || 0);
        const margin = sales - cost;
        return <CurrencyDisplay amount={margin} size="sm" color={margin >= 0 ? "blue" : "danger"} />;
      },
    },
    {
      header: "Description",
      accessor: (row) => <span className="text-xs text-slate-600 truncate max-w-xs block">{row.description || "Urban Furniture Item"}</span>,
    },
    {
      header: "SKU Code",
      accessor: (row) => <span className="font-mono text-xs font-bold text-blue-950">{row.sku || `PROD-${row.id?.substring(0, 4)}`}</span>,
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${row.is_active !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
          {row.is_active !== false ? "✓ AVAILABLE" : "DISCONTINUED"}
        </span>
      ),
    },
    {
      header: "Quick Action",
      accessor: (row) => (
        <Link
          to={`/sales-orders/new?product_id=${row.id}`}
          className="inline-flex items-center space-x-1 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition-all border border-blue-500"
        >
          <i className="fa-solid fa-cart-plus text-[10px]"></i>
          <span>Order Item &rarr;</span>
        </Link>
      ),
    },
    {
      header: "Record ID",
      accessor: (row) => <span className="font-mono text-xs font-semibold text-slate-500">{row.id || "—"}</span>,
    },
  ];

  if (loading) return <Loading text="Loading Furniture Products Master..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Services Catalog"
        subtitle="Urban furniture inventory items, sales prices, and purchase costs"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add New Furniture Item</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon="fa-couch"
          title="No Products in Catalog"
          description="Add furniture items to your product master catalog to populate Sales and Purchase order lines."
          actionLabel="Add Furniture Item"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={products} emptyMessage="No products found." />
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Furniture Product / Service"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Ergonomic Executive Desk, Wooden Chair"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="GOODS">GOODS (Physical Product)</option>
                <option value="SERVICE">SERVICE (Assembly, Delivery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Sales Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.sales_price}
                onChange={(e) => setFormData({ ...formData, sales_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Purchase Cost (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            ></textarea>
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
              {submitting ? "Saving Product..." : "Save Furniture Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
