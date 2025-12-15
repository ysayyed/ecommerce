import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { adminApi, discountApi } from "../services/api";
import type { Analytics, Order, Product, DiscountCode } from "../services/api";

type TabType = "overview" | "products" | "users" | "orders" | "discounts";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  totalOrders: number;
  createdAt: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsData] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getNthOrderValue(),
      ]);
      setAnalytics(analyticsData);

      if (activeTab === "products") {
        const productsData = await adminApi.getAllProducts();
        setProducts(productsData);
      } else if (activeTab === "users") {
        const usersData = await adminApi.getAllUsers();
        setUsers(usersData);
      } else if (activeTab === "orders") {
        const ordersData = await adminApi.getAllOrders();
        setOrders(ordersData);
      } else if (activeTab === "discounts") {
        const discountsData = await discountApi.getAllDiscountCodes();
        setDiscounts(discountsData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const renderSidebar = () => (
    <div
      style={{
        width: "250px",
        backgroundColor: "#2c3e50",
        minHeight: "calc(100vh - 60px)",
        padding: "20px 0",
        position: "fixed",
        left: 0,
        top: "60px",
        overflowY: "auto",
      }}
    >
      <nav>
        {[
          { id: "overview", icon: LayoutDashboard, label: "Overview" },
          { id: "products", icon: Package, label: "Products" },
          { id: "users", icon: Users, label: "Users" },
          { id: "orders", icon: ShoppingCart, label: "Orders" },
          { id: "discounts", icon: Ticket, label: "Discount Codes" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            style={{
              width: "100%",
              padding: "15px 20px",
              backgroundColor: activeTab === id ? "#34495e" : "transparent",
              color: "#fff",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "16px",
              borderLeft:
                activeTab === id
                  ? "4px solid #3498db"
                  : "4px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== id) {
                e.currentTarget.style.backgroundColor = "#34495e50";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== id) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderOverview = () => (
    <>
      <h1 style={{ marginBottom: "30px" }}>Dashboard Overview</h1>
      {analytics && (
        <>
          <div className="grid grid-4" style={{ marginBottom: "30px" }}>
            <div className="card" style={{ textAlign: "center" }}>
              <h3
                style={{
                  color: "#808080",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                Total Orders
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                {analytics.totalOrders}
              </p>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <h3
                style={{
                  color: "#808080",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                Items Purchased
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                {analytics.totalItemsPurchased}
              </p>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <h3
                style={{
                  color: "#808080",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                Total Revenue
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>
                ₹{analytics.totalPurchaseAmount.toFixed(2)}
              </p>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <h3
                style={{
                  color: "#808080",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                Total Discounts
              </h3>
              <p
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#28a745",
                }}
              >
                ₹{analytics.totalDiscountAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: "20px" }}>Recent Discount Codes</h2>
            {analytics.discountCodes.length === 0 ? (
              <p>No discount codes generated yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>User</th>
                    <th>Discount</th>
                    <th>Order #</th>
                    <th>Status</th>
                    <th>Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.discountCodes.slice(0, 5).map((code: any) => (
                    <tr key={code.code}>
                      <td>
                        <strong>{code.code}</strong>
                      </td>
                      <td>{code.userName || "N/A"}</td>
                      <td>{code.discountPercentage}%</td>
                      <td>#{code.generatedForOrderNumber}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            backgroundColor: code.isUsed
                              ? "#28a745"
                              : "#ffc107",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {code.isUsed ? (
                            <>
                              <CheckCircle size={14} /> Used
                            </>
                          ) : (
                            <>
                              <Clock size={14} /> Available
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        {code.usedAt
                          ? new Date(code.usedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );

  const renderProducts = () => (
    <>
      <h1 style={{ marginBottom: "30px" }}>Products Management</h1>
      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>
          All Products ({products.length})
        </h2>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.description}</td>
                  <td>₹{product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          product.stock > 0 ? "#28a745" : "#dc3545",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {product.stock > 0 ? (
                        <>
                          <CheckCircle size={14} /> In Stock
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Out of Stock
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderUsers = () => (
    <>
      <h1 style={{ marginBottom: "30px" }}>Users Management</h1>
      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>All Users ({users.length})</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Total Orders</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          user.role === "admin" ? "#6f42c1" : "#007bff",
                        color: "#fff",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.totalOrders}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: user.isActive ? "#28a745" : "#dc3545",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle size={14} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderOrders = () => (
    <>
      <h1 style={{ marginBottom: "30px" }}>Orders Management</h1>
      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>All Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>User</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Discount</th>
                <th>Final Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>#{order.orderNumber}</strong>
                  </td>
                  <td>{(order as any).userId?.name || "N/A"}</td>
                  <td>{order.items.length}</td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td>
                    {order.discountAmount > 0 ? (
                      <span style={{ color: "#28a745" }}>
                        -₹{order.discountAmount.toFixed(2)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <strong>₹{order.finalAmount.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          order.status === "completed"
                            ? "#28a745"
                            : order.status === "pending"
                            ? "#ffc107"
                            : "#dc3545",
                        color: "#fff",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderDiscounts = () => (
    <>
      <h1 style={{ marginBottom: "30px" }}>Discount Codes Management</h1>
      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>
          All Discount Codes ({discounts.length})
        </h2>
        {discounts.length === 0 ? (
          <p>No discount codes found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>User Name</th>
                <th>Discount %</th>
                <th>Order #</th>
                <th>Status</th>
                <th>Used At</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount: any) => (
                <tr key={discount._id}>
                  <td>
                    <strong>{discount.code}</strong>
                  </td>
                  <td>{discount.userId?.name || "N/A"}</td>
                  <td>{discount.discountPercentage}%</td>
                  <td>#{discount.generatedForOrderNumber}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: discount.isUsed
                          ? "#28a745"
                          : "#ffc107",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {discount.isUsed ? (
                        <>
                          <CheckCircle size={14} /> Used
                        </>
                      ) : (
                        <>
                          <Clock size={14} /> Available
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    {discount.usedAt
                      ? new Date(discount.usedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{new Date(discount.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  if (loading && !analytics) {
    return (
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        {renderSidebar()}
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
      {renderSidebar()}
      <div
        style={{
          marginLeft: "250px",
          padding: "20px",
          width: "calc(100% - 250px)",
          flex: 1,
        }}
      >
        {error && <div className="alert alert-error">{error}</div>}

        {activeTab === "overview" && renderOverview()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "discounts" && renderDiscounts()}
      </div>
    </div>
  );
};

export default AdminDashboard;
