import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, CircularProgress, FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import { FaBell, FaBoxOpen, FaCheckCircle, FaUserShield } from "react-icons/fa";
import { productsAPI, categoriesAPI, usersAPI, heroSlidesAPI, ordersAPI } from "../services/api";
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

const emptyHeroForm = {
  title: "",
  subtitle: "",
  badge: "Canteen Specials",
  ctaText: "Shop Now",
  ctaLink: "/",
  imageUrl: "",
  gradientFrom: "#064e3b",
  gradientTo: "#020617",
  sortOrder: 0,
  isActive: true,
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

const toHeroForm = (slide) => ({
  title: slide.title || "",
  subtitle: slide.subtitle || "",
  badge: slide.badge || "Canteen Specials",
  ctaText: slide.ctaText || "Shop Now",
  ctaLink: slide.ctaLink || "/",
  imageUrl: slide.imageUrl || "",
  gradientFrom: slide.gradientFrom || "#064e3b",
  gradientTo: slide.gradientTo || "#020617",
  sortOrder: slide.sortOrder ?? 0,
  isActive: slide.isActive !== false,
});

const AdminDashboard = () => {
  const { user, token } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [heroForm, setHeroForm] = useState(emptyHeroForm);
  const [editingId, setEditingId] = useState(null);
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [activeSection, setActiveSection] = useState("products");
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
    const pendingOrders = orders.filter((order) => order.orderStatus === "pending").length;
    const confirmedOrders = orders.filter((order) => order.orderStatus === "confirmed").length;
    const orderRevenue = orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);

    return {
      products: products.length,
      stock,
      pendingUsers: pendingUsers.length,
      pendingOrders,
      confirmedOrders,
      orders: orders.length,
      orderRevenue,
      inventoryValue,
    };
  }, [products, pendingUsers, orders]);

  const notifications = useMemo(() => {
    const recentPendingOrders = orders
      .filter((order) => order.orderStatus === "pending")
      .slice(0, 3)
      .map((order) => ({
        id: `order-${order._id}`,
        title: `Order ${order.orderNumber}`,
        detail: `${order.user?.name || "Customer"} placed ${money(order.totalAmount)}`,
        to: "/admin/orders",
        type: "order",
      }));

    const recentPendingUsers = pendingUsers.slice(0, 3).map((pendingUser) => ({
      id: `user-${pendingUser._id}`,
      title: pendingUser.name,
      detail: `${pendingUser.rank || "User"} waiting for verification`,
      to: "/admin/verification",
      type: "user",
    }));

    return [...recentPendingOrders, ...recentPendingUsers].slice(0, 5);
  }, [orders, pendingUsers]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes, heroSlidesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        heroSlidesAPI.getAll({ includeInactive: true }),
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setHeroSlides(heroSlidesRes.data || []);

      if (token) {
        try {
          const [usersRes, ordersRes] = await Promise.all([
            usersAPI.getPendingUsers("pending"),
            ordersAPI.getAll(),
          ]);
          setPendingUsers(usersRes.data || []);
          setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        } catch {
          setPendingUsers([]);
          setOrders([]);
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

  const handleHeroChange = (event) => {
    const { name, value, checked, type } = event.target;
    setHeroForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
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

  const buildHeroPayload = () => ({
    title: heroForm.title.trim(),
    subtitle: heroForm.subtitle.trim(),
    badge: heroForm.badge.trim(),
    ctaText: heroForm.ctaText.trim() || "Shop Now",
    ctaLink: heroForm.ctaLink.trim() || "/",
    imageUrl: heroForm.imageUrl.trim(),
    gradientFrom: heroForm.gradientFrom || "#064e3b",
    gradientTo: heroForm.gradientTo || "#020617",
    sortOrder: Number(heroForm.sortOrder || 0),
    isActive: Boolean(heroForm.isActive),
  });

  const validateHeroForm = () => {
    if (!heroForm.title.trim() || !heroForm.subtitle.trim()) {
      return "Hero title and subtitle are required.";
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

  const handleHeroSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isAdmin) {
      setError("Please login as admin before editing hero slides.");
      return;
    }

    const validationError = validateHeroForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = buildHeroPayload();
      if (editingHeroId) {
        const response = await heroSlidesAPI.update(editingHeroId, payload);
        setHeroSlides((current) =>
          current.map((slide) => (slide._id === editingHeroId ? response.data.slide : slide))
        );
        setMessage("Hero slide updated successfully.");
      } else {
        const response = await heroSlidesAPI.create(payload);
        setHeroSlides((current) => [...current, response.data.slide].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)));
        setMessage("Hero slide added successfully.");
      }

      setHeroForm(emptyHeroForm);
      setEditingHeroId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save hero slide.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm(toForm(product));
    setMessage("");
    setError("");
    setActiveSection("product-form");
    document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleHeroEdit = (slide) => {
    setEditingHeroId(slide._id);
    setHeroForm(toHeroForm(slide));
    setMessage("");
    setError("");
    setActiveSection("hero-slider");
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const handleHeroDelete = async (slideId) => {
    if (!isAdmin) {
      setError("Please login as admin before deleting hero slides.");
      return;
    }

    if (!window.confirm("Delete this hero slide?")) {
      return;
    }

    setMessage("");
    setError("");
    try {
      await heroSlidesAPI.delete(slideId);
      setHeroSlides((current) => current.filter((slide) => slide._id !== slideId));
      setMessage("Hero slide deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete hero slide.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const cancelHeroEdit = () => {
    setEditingHeroId(null);
    setHeroForm(emptyHeroForm);
    setError("");
    setMessage("");
  };

  const isAdmin = user?.role === "admin";
  const navButtonClass = (section) => (
    activeSection === section
      ? "rounded-md bg-emerald-50 px-3 py-2 text-left text-emerald-800"
      : "rounded-md px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
  );

  return (
    <div className={page}>
      <div className="grid gap-3 sm:gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${panel} h-max p-4 sm:p-5 lg:sticky lg:top-32`}>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">ShopCart</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Admin Dashboard</h2>
          </div>
          <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto text-sm font-semibold sm:mt-6 sm:grid">
            <button type="button" className={navButtonClass("products")} onClick={() => setActiveSection("products")}>Products</button>
            <button type="button" className={navButtonClass("product-form")} onClick={() => setActiveSection("product-form")}>Add Product</button>
            <button type="button" className={navButtonClass("hero-slider")} onClick={() => setActiveSection("hero-slider")}>Hero Slider</button>
            <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50" to="/admin/orders">Orders</Link>
            <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50" to="/admin/verification">User Verification</Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <section className="overflow-hidden rounded-lg border border-emerald-900/10 bg-emerald-950 text-white shadow-sm">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Admin Control Room</p>
                <h1 className="mt-2 text-2xl font-black sm:text-4xl">Dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-emerald-50/80">
                  Orders, inventory, homepage banners, and user verification are organized from the menu.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-300 text-emerald-950">
                    <FaBell />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-50">Needs Attention</p>
                    <strong className="text-3xl">{stats.pendingOrders + stats.pendingUsers}</strong>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-white/10 p-3 text-white">
                    <span className="block text-2xl font-black">{stats.pendingOrders}</span>
                    <span className="text-emerald-50/80">Pending orders</span>
                  </div>
                  <div className="rounded-md bg-white/10 p-3 text-white">
                    <span className="block text-2xl font-black">{stats.pendingUsers}</span>
                    <span className="text-emerald-50/80">New users</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 flex justify-end">
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

        <section className="mt-3 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4 xl:grid-cols-4">
          {[
            ["Total Products", stats.products],
            ["Total Orders", stats.orders],
            ["Pending Orders", stats.pendingOrders],
            ["Pending Users", stats.pendingUsers],
            ["Total Stock", stats.stock],
            ["Inventory Value", money(stats.inventoryValue)],
            ["Order Revenue", money(stats.orderRevenue)],
            ["Hero Slides", heroSlides.length],
          ].map(([label, value]) => (
            <div key={label} className={`${panel} p-3 sm:p-5`}>
              <span className="text-sm text-slate-500">{label}</span>
              <strong className="mt-1 block text-xl text-slate-950 sm:mt-2 sm:text-3xl">{value}</strong>
            </div>
          ))}
        </section>

        <section className="mt-3 sm:mt-6">
          <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Notifications</p>
                <h2 className="text-2xl font-black text-slate-950">Admin Alerts</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <FaBell />
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {notifications.length > 0 ? notifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-900"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={item.type === "order" ? "grid h-9 w-9 place-items-center rounded-md bg-amber-100 text-amber-700" : "grid h-9 w-9 place-items-center rounded-md bg-emerald-100 text-emerald-700"}>
                      {item.type === "order" ? <FaBoxOpen /> : <FaUserShield />}
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-sm">{item.title}</strong>
                      <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                    </span>
                  </span>
                </div>
              )) : (
                <div className="flex items-center gap-3 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
                  <FaCheckCircle />
                  <span>No pending order or user verification notifications.</span>
                </div>
              )}
            </div>
          </div>

        </section>

        {(message || error) && (
          <Alert severity={error ? "error" : "success"} className="!mt-5">
            {error || message}
          </Alert>
        )}

        {activeSection === "hero-slider" && (
        <section id="hero-form" className={`${panel} mt-3 p-4 sm:mt-6 sm:p-5`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Homepage Banner</p>
              <h2 className="text-2xl font-black text-slate-950">{editingHeroId ? "Edit Hero Slide" : "Add Hero Slide"}</h2>
            </div>
            {editingHeroId && (
              <Button type="button" variant="outlined" onClick={cancelHeroEdit}>
                Cancel Edit
              </Button>
            )}
          </div>

          <form className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4" onSubmit={handleHeroSubmit}>
            <TextField label="Slide Title" name="title" value={heroForm.title} onChange={handleHeroChange} placeholder="ShopCart Canteen Specials" />
            <TextField label="Badge" name="badge" value={heroForm.badge} onChange={handleHeroChange} placeholder="Canteen Specials" />
            <TextField className="sm:col-span-2" label="Subtitle" name="subtitle" value={heroForm.subtitle} onChange={handleHeroChange} placeholder="Exclusive deals for personnel" />
            <TextField label="Button Text" name="ctaText" value={heroForm.ctaText} onChange={handleHeroChange} placeholder="Shop Now" />
            <TextField label="Button Link" name="ctaLink" value={heroForm.ctaLink} onChange={handleHeroChange} placeholder="/?category=Electronics" />
            <TextField className="sm:col-span-2" label="Background Image URL" name="imageUrl" value={heroForm.imageUrl} onChange={handleHeroChange} placeholder="https://example.com/banner.jpg" />
            <TextField label="Gradient From" name="gradientFrom" type="color" value={heroForm.gradientFrom} onChange={handleHeroChange} />
            <TextField label="Gradient To" name="gradientTo" type="color" value={heroForm.gradientTo} onChange={handleHeroChange} />
            <TextField label="Sort Order" name="sortOrder" type="number" value={heroForm.sortOrder} onChange={handleHeroChange} />
            <FormControlLabel
              control={<Switch name="isActive" checked={heroForm.isActive} onChange={handleHeroChange} color="success" />}
              label="Active slide"
            />

            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" variant="contained" color="success" disabled={saving}>
                {saving ? "Saving..." : editingHeroId ? "Update Slide" : "Add Slide"}
              </Button>
              <Button type="button" variant="outlined" onClick={cancelHeroEdit}>
                Clear
              </Button>
            </div>
          </form>

          <div className="mt-6 grid gap-3">
            {heroSlides.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                No editable hero slides yet. The homepage will use built-in fallback slides until you add one.
              </div>
            ) : (
              heroSlides.map((slide) => (
                <article key={slide._id} className="grid gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-950">{slide.title}</strong>
                      <span className={slide.isActive ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500"}>
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Order {slide.sortOrder || 0}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{slide.subtitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="small" variant="outlined" onClick={() => handleHeroEdit(slide)}>
                      Edit
                    </Button>
                    <Button type="button" size="small" color="error" onClick={() => handleHeroDelete(slide._id)}>
                      Delete
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
        )}

        {activeSection === "product-form" && (
        <section id="product-form" className={`${panel} mt-3 p-4 sm:mt-6 sm:p-5`}>
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

          <form className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4" onSubmit={handleSubmit}>
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
        )}

        {activeSection === "products" && (
        <section id="products" className={`${panel} mt-3 overflow-hidden sm:mt-6`}>
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
        )}
      </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
