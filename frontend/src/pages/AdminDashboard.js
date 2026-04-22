import React, { useEffect, useState } from "react";
import { productsAPI, categoriesAPI } from "../services/api";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const p = await productsAPI.getAll();
      const c = await categoriesAPI.getAll();
      const u = await window.usersAPI?.getPendingUsers?.("pending");

      setProducts(p.data || []);
      setCategories(c.data || []);
      setPendingUsers(u?.data || []);
    } catch (err) {
      console.error("Admin fetch error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await productsAPI.delete(id);
    fetchAll();
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete category?")) return;
    await categoriesAPI.delete(id);
    fetchAll();
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <button onClick={() => setActiveTab("products")}>Products</button>
        <button onClick={() => setActiveTab("categories")}>Categories</button>
        <button onClick={() => setActiveTab("users")}>Users</button>
      </aside>

      {/* MAIN PANEL */}
      <main className="admin-main">

        <h1>Dashboard</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* PRODUCTS PANEL */}
            {activeTab === "products" && (
              <div className="panel">
                <h2>Product Management</h2>
                <div className="grid">
                  {products.map((p) => (
                    <div key={p._id} className="card">
                      <img src={p.image || "/default-product.png"} alt="" />
                      <h4>{p.name}</h4>
                      <p>₹{p.price}</p>
                      <button onClick={() => deleteProduct(p._id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORY PANEL */}
            {activeTab === "categories" && (
              <div className="panel">
                <h2>Category Management</h2>
                {categories.map((c) => (
                  <div key={c._id} className="card-row">
                    <h4>{c.icon} {c.name}</h4>
                    <p>{c.subcategories.join(", ")}</p>
                    <button onClick={() => deleteCategory(c._id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* USERS PANEL */}
            {activeTab === "users" && (
              <div className="panel">
                <h2>Pending Users</h2>
                {pendingUsers.length === 0 ? (
                  <p>No pending users</p>
                ) : (
                  pendingUsers.map((u) => (
                    <div key={u._id} className="card-row">
                      <strong>{u.name}</strong> ({u.email})
                      <span>Pending</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
