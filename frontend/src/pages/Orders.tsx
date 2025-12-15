import { useState, useEffect } from "react";
import { orderApi } from "../services/api";
import type { Order } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getUserOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px" }}>My Orders</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order._id}
              className="card"
              style={{ marginBottom: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <div>
                  <h3>Order #{order.orderNumber}</h3>
                  <p style={{ color: "#808080", margin: "5px 0" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "4px",
                      backgroundColor:
                        order.status === "completed" ? "#28a745" : "#ffc107",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                {order.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                    <strong>{item.name}</strong> - Qty: {item.quantity} - $
                    {(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>Subtotal:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                        color: "#28a745",
                      }}
                    >
                      <span>Discount ({order.discountCode}):</span>
                      <span>-₹{order.discountAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  <span>Total:</span>
                  <span>₹{order.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
