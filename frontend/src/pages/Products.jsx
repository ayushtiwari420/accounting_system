import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "GOODS",
    sales_price: 0,
    purchase_price: 0,
    category: "Office Furniture",
    description: "",
    is_active: true,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      type: "GOODS",
      sales_price: 0,
      purchase_price: 0,
      category: "Office Furniture",
      description: "",
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      type: product.type || "GOODS",
      sales_price: Number(product.sales_price || product.price || 0),
      purchase_price: Number(product.purchase_price || product.cost || 0),
      category: product.category || "Office Furniture",
      description: product.description || "",
      is_active: product.is_active !== false,
    });
    setIsEditModalOpen(true);
  };

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
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setSubmitting(true);
      setError(null);
      await api.put(`/products/${editingProduct.id}`, {
        ...formData,
        sales_price: Number(formData.sales_price),
        purchase_price: Number(formData.purchase_price),
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDeactivate = async (product) => {
    const actionText = product.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionText} "${product.name}"?`)) return;
    try {
      if (product.is_active) {
        await api.delete(`/products/${product.id}`);
      } else {
        await api.put(`/products/${product.id}`, { is_active: true });
      }
      fetchProducts();
    } catch (err) {
      console.error("Error toggling product status:", err);
      alert(err.response?.data?.message || "Failed to update product status");
    }
  };

  // Filter products
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      header: "Product / Furniture Name",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm block">{row.name}</span>
          <span className="text-xs text-slate-500 line-clamp-1">{row.description || "Urban Furniture Item"}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (row) => (
        <span className="text-xs font-bold text-[#1E3A8A] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
          {row.category || "General"}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: (row) => (
        <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
          {row.type || "GOODS"}
        </span>
      ),
    },
    {
      header: "Sales Price (₹)",
      align: "right",
      accessor: (row) => (
        <CurrencyDisplay amount={row.sales_price ?? row.price} size="sm" color="default" />
      ),
    },
    {
      header: "Purchase Cost (₹)",
      align: "right",
      accessor: (row) => (
        <CurrencyDisplay amount={row.purchase_price ?? row.cost} size="sm" color="default" />
      ),
    },
    {
      header: "Estimated Margin",
      align: "right",
      accessor: (row) => {
        const sales = Number(row.sales_price ?? row.price ?? 0);
        const cost = Number(row.purchase_price ?? row.cost ?? 0);
        const margin = sales - cost;
        return <CurrencyDisplay amount={margin} size="sm" color="default" />;
      },
    },
    {
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
            row.is_active !== false
              ? "bg-[#1E3A8A] text-white"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {row.is_active !== false ? "✓ AVAILABLE" : "DISCONTINUED"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="text-xs font-bold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white bg-slate-50 px-2.5 py-1 rounded transition-colors border border-slate-200"
          >
            <i className="fa-solid fa-pen-to-square mr-1"></i>
            Edit
          </button>

          <Link
            to={`/sales-orders/new?product_id=${row.id}`}
            className="text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#152e70] px-2.5 py-1 rounded transition-colors shadow-xs"
          >
            <i className="fa-solid fa-cart-plus mr-1"></i>
            Order
          </Link>

          <button
            type="button"
            onClick={() => handleToggleDeactivate(row)}
            className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${
              row.is_active !== false
                ? "text-slate-600 hover:bg-slate-200 border-slate-300"
                : "text-[#1E3A8A] bg-slate-100 hover:bg-slate-200 border-slate-300"
            }`}
            title={row.is_active !== false ? "Deactivate product" : "Activate product"}
          >
            {row.is_active !== false ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading text="Loading Furniture Products Master..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Services Master"
        subtitle="Furniture catalog items, selling prices, purchase costs, and category management"
        actions={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add New Furniture Item</span>
          </button>
        }
      />

      {error && (
        <div className="bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Search & Category Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A] w-full sm:w-auto"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="fa-couch"
          title="No Products Found"
          description={searchQuery ? "No products match your search filter." : "Add furniture items to your product master catalog."}
          actionLabel="Add Furniture Item"
          onAction={handleOpenAddModal}
        />
      ) : (
        <DataTable columns={columns} data={filteredProducts} emptyMessage="No products found." />
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Furniture Product / Service"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              placeholder="e.g. Executive Wooden Desk, Ergonomic Chair"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="GOODS">GOODS (Physical Furniture)</option>
                <option value="SERVICE">SERVICE (Assembly, Delivery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Office Furniture"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Sales Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.sales_price}
                onChange={(e) => setFormData({ ...formData, sales_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Cost (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed item specs or materials..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm"
            >
              {submitting ? "Saving Product..." : "Save Product Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Product: ${editingProduct?.name || ""}`}
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="GOODS">GOODS (Physical Furniture)</option>
                <option value="SERVICE">SERVICE (Assembly, Delivery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Sales Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.sales_price}
                onChange={(e) => setFormData({ ...formData, sales_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Cost (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm"
            >
              {submitting ? "Updating..." : "Update Product Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
