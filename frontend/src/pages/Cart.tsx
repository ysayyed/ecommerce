import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../services/api';
import type { Cart as CartType } from '../services/api';

const Cart = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      setError('');
      const updatedCart = await cartApi.updateCartItem(productId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setError('');
      const updatedCart = await cartApi.removeFromCart(productId);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
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
      <h1 style={{ marginBottom: '30px' }}>Shopping Cart</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {!cart || cart.items.length === 0 ? (
        <div className="card">
          <p>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value))}
                        style={{ width: '60px', padding: '5px' }}
                      />
                    </td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <h3>Total: ₹{cart.totalAmount.toFixed(2)}</h3>
              <button
                className="btn btn-success"
                onClick={handleCheckout}
                style={{ marginTop: '10px', padding: '12px 30px' }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;