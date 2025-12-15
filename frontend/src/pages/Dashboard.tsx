import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import type { Order } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getUserOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalSavings = orders.reduce((sum, order) => sum + order.discountAmount, 0);

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
      totalSavings,
    };
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = calculateStats();
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="container">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '10px' }}>
          {getGreeting()}, {user?.name}! 👋
        </h1>
        <p style={{ color: '#808080', fontSize: '18px' }}>
          Welcome back to your dashboard
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
            {stats.totalOrders}
          </div>
          <div style={{ color: '#808080', fontSize: '14px' }}>Total Orders</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
            ₹{stats.totalSpent.toFixed(2)}
          </div>
          <div style={{ color: '#808080', fontSize: '14px' }}>Total Spent</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107', marginBottom: '10px' }}>
            {stats.completedOrders}
          </div>
          <div style={{ color: '#808080', fontSize: '14px' }}>Completed Orders</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>
            {stats.pendingOrders}
          </div>
          <div style={{ color: '#808080', fontSize: '12px' }}>Pending Orders</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8', marginBottom: '5px' }}>
            ₹{stats.totalSavings.toFixed(2)}
          </div>
          <div style={{ color: '#808080', fontSize: '12px' }}>Total Savings</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d', marginBottom: '5px' }}>
            {stats.totalOrders > 0 ? `₹${(stats.totalSpent / stats.totalOrders).toFixed(2)}` : '₹0.00'}
          </div>
          <div style={{ color: '#808080', fontSize: '12px' }}>Avg Order Value</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
        <div className="grid grid-3">
          <Link to="/products" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛍️</div>
            <h3>Browse Products</h3>
            <p style={{ color: '#808080', fontSize: '14px' }}>Explore our collection</p>
          </Link>

          <Link to="/cart" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</div>
            <h3>View Cart</h3>
            <p style={{ color: '#808080', fontSize: '14px' }}>Check your items</p>
          </Link>

          <Link to="/orders" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
            <h3>My Orders</h3>
            <p style={{ color: '#808080', fontSize: '14px' }}>Track your orders</p>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Recent Orders</h2>
            <Link to="/orders" style={{ color: '#007bff', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <div>
            {recentOrders.map((order) => (
              <div key={order._id} className="card" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ marginBottom: '5px' }}>Order #{order.orderNumber}</h4>
                    <p style={{ color: '#808080', fontSize: '14px', margin: 0 }}>
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                      ₹{order.finalAmount.toFixed(2)}
                    </div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: order.status === 'completed' ? '#28a745' : '#ffc107',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛍️</div>
          <h3 style={{ marginBottom: '10px' }}>No orders yet</h3>
          <p style={{ color: '#808080', marginBottom: '20px' }}>
            Start shopping to see your order history here
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;