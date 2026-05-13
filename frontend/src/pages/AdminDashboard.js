import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productsAPI, categoriesAPI, usersAPI } from "../services/api";
import { useAuthStore } from "../context/store";
import "../styles/AdminDashboard.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  discount: "",
  category: "Phones",
  stock: "",
  imageUrl: "",
  brand: "",
  color: "",
  warranty: "",
  material: "",
};

const fallbackCategories = [
  "Phones",
  "Laptops",
  "Electronics",
  "Groceries",
  "Clothing",
  "Books",
  "Home & Kitchen",
  "Sports",
  "Beauty",
  "Other",
];

const toForm = (product) => ({
  name: product.name || "",
  description: product.description || "",
  price: product.price ?? "",
  originalPrice: product.originalPrice ?? "",
  discount: product.discount ?? "",
  category: product.category || "Phones",
  stock: product.stock ?? "",
  imageUrl: Array.isArray(product.images) ? product.images.join(", ") : "",
  brand: product.specifications?.brand || "",
  color: product.specifications?.color || "",
  warranty: product.specifications?.warranty || "",
  material: product.specifications?.material || "",
});

const AdminDashboard = () => {
  const { user, token } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categoryOptions = useMemo(() => {
    const names = categories.map((category) => category.name);
    return Array.from(new Set([...fallbackCategories, ...names]));
  }, [categories]);

  const stats = useMemo(() => {
    const stock = products.reduce((total, product) => total + Number(product.stock || 0), 0);
    const inventoryValue = products.reduce(
      (total, product) => total + Number(product.price || 0) * Number(product.stock || 0),
      0
    );

    return {
      products: products.length,
      stock,
      pendingUsers: pendingUsers.length,
      inventoryValue,
    };
  }, [products, pendingUsers]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);

      if (token) {
        try {
          const usersRes = await usersAPI.getPendingUsers("pending");
          setPendingUsers(usersRes.data || []);
        } catch {
          setPendingUsers([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
    discount: form.discount ? Number(form.discount) : 0,
    category: form.category,
    stock: Number(form.stock),
    images: form.imageUrl
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean),
    specifications: {
      brand: form.brand.trim(),
      color: form.color.trim(),
      warranty: form.warranty.trim(),
      material: form.material.trim(),
    },
  });

  const validateForm = () => {
    if (!form.name.trim() || !form.description.trim()) {
      return "Name and description are required.";
    }
    if (!form.price || Number(form.price) < 0) {
      return "Enter a valid price.";
    }
    if (!form.stock || Number(form.stock) < 0) {
      return "Enter a valid stock quantity.";
    }
    if (!form.imageUrl.trim()) {
      return "Add at least one image URL.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Please login as admin before adding or editing products.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        const response = await productsAPI.update(editingId, payload);
        setProducts((current) =>
          current.map((product) => (product._id === editingId ? response.data.product : product))
        );
        setMessage("Product updated successfully.");
      } else {
        const response = await productsAPI.create(payload);
        setProducts((current) => [response.data.product, ...current]);
        setMessage("Product added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm(toForm(product));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    if (!token) {
      setError("Please login as admin before deleting products.");
      return;
    }

    if (!window.confirm("Delete this product?")) {
      return;
    }

    setMessage("");
    setError("");
    try {
      await productsAPI.delete(productId);
      setProducts((current) => current.filter((product) => product._id !== productId));
      setMessage("Product deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete product.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-eyebrow">ShopKaro</p>
          <h2>Admin Dashboard</h2>
        </div>
        <nav>
          <a href="#products">Products</a>
          <a href="#product-form">Add Product</a>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/verification">User Verification</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Inventory Control</p>
            <h1>Products Dashboard</h1>
          </div>
          <button type="button" className="secondary-btn" onClick={fetchDashboard}>
            Refresh
          </button>
        </div>

        {!isAdmin && (
          <div className="admin-warning">
            Login with the admin account to add, edit, or delete products.
            <strong> Email:</strong> seller@shopkaro.com <strong>Password:</strong> seller123
          </div>
        )}

        <section className="admin-stats">
          <div className="stat-card">
            <span>Total Products</span>
            <strong>{stats.products}</strong>
          </div>
          <div className="stat-card">
            <span>Total Stock</span>
            <strong>{stats.stock}</strong>
          </div>
          <div className="stat-card">
            <span>Inventory Value</span>
            <strong>Rs {stats.inventoryValue.toLocaleString("en-IN")}</strong>
          </div>
          <div className="stat-card">
            <span>Pending Users</span>
            <strong>{stats.pendingUsers}</strong>
          </div>
        </section>

        {(message || error) && (
          <div className={error ? "admin-alert error" : "admin-alert success"}>
            {error || message}
          </div>
        )}

        <section id="product-form" className="admin-panel">
          <div className="panel-header">
            <div>
              <p className="admin-eyebrow">Product CRUD</p>
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
            </div>
            {editingId && (
              <button type="button" className="secondary-btn" onClick={cancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>

          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Product Name
              <input name="name" value={form.name} onChange={handleChange} placeholder="Coffee Maker" />
            </label>

            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} />
            </label>

            <label>
              Original Price
              <input name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={handleChange} />
            </label>

            <label>
              Discount %
              <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} />
            </label>

            <label>
              Stock
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
            </label>

            <label className="span-2">
              Image URL
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            </label>

            <label className="span-2">
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
            </label>

            <label>
              Brand
              <input name="brand" value={form.brand} onChange={handleChange} />
            </label>

            <label>
              Color
              <input name="color" value={form.color} onChange={handleChange} />
            </label>

            <label>
              Warranty
              <input name="warranty" value={form.warranty} onChange={handleChange} />
            </label>

            <label>
              Material
              <input name="material" value={form.material} onChange={handleChange} />
            </label>

            <div className="form-actions span-2">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
              <button type="button" className="secondary-btn" onClick={cancelEdit}>
                Clear
              </button>
            </div>
          </form>
        </section>

        <section id="products" className="admin-panel">
          <div className="panel-header">
            <div>
              <p className="admin-eyebrow">Catalog</p>
              <h2>Product List</h2>
            </div>
            <span>{products.length} products</span>
          </div>

          {loading ? (
            <div className="admin-loading">Loading dashboard...</div>
          ) : (
            <div className="product-table-wrap">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="table-product">
                          <img src={product.images?.[0]} alt={product.name} />
                          <div>
                            <strong>{product.name}</strong>
                            <span>{product.description}</span>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>Rs {Number(product.price || 0).toLocaleString("en-IN")}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="secondary-btn" onClick={() => handleEdit(product)}>
                            Edit
                          </button>
                          <button type="button" className="danger-btn" onClick={() => handleDelete(product._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
