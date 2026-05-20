import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { productsAPI, categoriesAPI, usersAPI } from "../services/api";
import { useAuthStore } from "../context/store";
import { money, page, panel } from "../utils/ui";

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
      setMessage("Dashboard refreshed.");
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
    <div className={page}>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${panel} h-max p-5 lg:sticky lg:top-32`}>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">ShopCart</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Admin Dashboard</h2>
          </div>
          <nav className="mt-6 grid gap-2 text-sm font-semibold">
            <a className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50" href="#products">Products</a>
            <a className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50" href="#product-form">Add Product</a>
            <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50" to="/admin/orders">Orders</Link>
            <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50" to="/admin/verification">User Verification</Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Inventory Control</p>
              <h1 className="text-3xl font-black text-slate-950">Products Dashboard</h1>
            </div>
            <Button variant="outlined" color="success" onClick={fetchDashboard} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

        {!isAdmin && (
          <Alert severity="warning" className="!mt-5">
            Login with the admin account to add, edit, or delete products.
            <strong> Email:</strong> seller@shopkaro.com <strong>Password:</strong> seller123
          </Alert>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Products", stats.products],
            ["Total Stock", stats.stock],
            ["Inventory Value", money(stats.inventoryValue)],
            ["Pending Users", stats.pendingUsers],
          ].map(([label, value]) => (
            <div key={label} className={`${panel} p-5`}>
              <span className="text-sm text-slate-500">{label}</span>
              <strong className="mt-2 block text-3xl text-slate-950">{value}</strong>
            </div>
          ))}
        </section>

        {(message || error) && (
          <Alert severity={error ? "error" : "success"} className="!mt-5">
            {error || message}
          </Alert>
        )}

        <section id="product-form" className={`${panel} mt-6 p-5`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Product CRUD</p>
              <h2 className="text-2xl font-black text-slate-950">{editingId ? "Edit Product" : "Add New Product"}</h2>
            </div>
            {editingId && (
              <Button type="button" variant="outlined" onClick={cancelEdit}>
                Cancel Edit
              </Button>
            )}
          </div>

          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <TextField label="Product Name" name="name" value={form.name} onChange={handleChange} placeholder="Coffee Maker" />
            <TextField select label="Category" name="category" value={form.category} onChange={handleChange}>
              {categoryOptions.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
            </TextField>
            <TextField label="Price" name="price" type="number" inputProps={{ min: 0 }} value={form.price} onChange={handleChange} />
            <TextField label="Original Price" name="originalPrice" type="number" inputProps={{ min: 0 }} value={form.originalPrice} onChange={handleChange} />
            <TextField label="Discount %" name="discount" type="number" inputProps={{ min: 0, max: 100 }} value={form.discount} onChange={handleChange} />
            <TextField label="Stock" name="stock" type="number" inputProps={{ min: 0 }} value={form.stock} onChange={handleChange} />
            <TextField className="sm:col-span-2" label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            <TextField className="sm:col-span-2" label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={4} />
            <TextField label="Brand" name="brand" value={form.brand} onChange={handleChange} />
            <TextField label="Color" name="color" value={form.color} onChange={handleChange} />
            <TextField label="Warranty" name="warranty" value={form.warranty} onChange={handleChange} />
            <TextField label="Material" name="material" value={form.material} onChange={handleChange} />

            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" variant="contained" color="success" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </Button>
              <Button type="button" variant="outlined" onClick={cancelEdit}>
                Clear
              </Button>
            </div>
          </form>
        </section>

        <section id="products" className={`${panel} mt-6 overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Catalog</p>
              <h2 className="text-2xl font-black text-slate-950">Product List</h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">{products.length} products</span>
          </div>

          {loading ? (
            <div className="grid min-h-56 place-items-center"><CircularProgress color="success" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-4">
                        <div className="flex min-w-80 items-center gap-3">
                          <img src={product.images?.[0]} alt={product.name} className="h-14 w-14 rounded-md bg-slate-100 object-cover" />
                          <div>
                            <strong className="block text-slate-950">{product.name}</strong>
                            <span className="line-clamp-1 text-slate-500">{product.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{product.category}</td>
                      <td className="px-4 py-4 font-bold">{money(product.price)}</td>
                      <td className="px-4 py-4">{product.stock}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button type="button" size="small" variant="outlined" onClick={() => handleEdit(product)}>
                            Edit
                          </Button>
                          <Button type="button" size="small" color="error" onClick={() => handleDelete(product._id)}>
                            Delete
                          </Button>
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
    </div>
  );
};

export default AdminDashboard;
