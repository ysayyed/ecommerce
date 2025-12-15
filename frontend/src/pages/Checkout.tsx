import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartApi, orderApi } from '../services/api';
import type { Cart, DiscountCode } from '../services/api';

const Checkout = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [availableDiscount, setAvailableDiscount] = useState<DiscountCode | null>(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cartData = await cartApi.getCart();
      
      if (cartData.items.length === 0) {
        navigate('/cart');
        return;
      }
      
      setCart(cartData);
      
      // Try to fetch available discount, but don't fail if it errors
      try {
        const discountData = await orderApi.getAvailableDiscount();
        setAvailableDiscount(discountData);
      } catch (discountErr) {
        // Silently ignore discount fetch errors
        console.log('No available discount');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = () => {
    setDiscountApplied(true);
    setSuccess('Discount applied successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRemoveDiscount = () => {
    setDiscountApplied(false);
  };

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    setProcessing(true);

    try {
      // Apply discount only if user clicked the apply button
      const discountCode = discountApplied && availableDiscount ? availableDiscount.code : undefined;
      const order = await orderApi.checkout(discountCode);
      setSuccess(`Order placed successfully! Order #${order.orderNumber}`);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    if (discountApplied && availableDiscount) {
      const discount = (cart.totalAmount * availableDiscount.discountPercentage) / 100;
      return cart.totalAmount - discount;
    }
    return cart.totalAmount;
  };

  const getDiscountAmount = () => {
    if (!cart || !availableDiscount || !discountApplied) return 0;
    return (cart.totalAmount * availableDiscount.discountPercentage) / 100;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '30px' }}>Checkout</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
        
        {cart.items.map((item) => (
          <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ color: '#808080', margin: '5px 0' }}>Quantity: {item.quantity}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal:</span>
            <span>₹{cart.totalAmount.toFixed(2)}</span>
          </div>
          
          {discountApplied && availableDiscount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#28a745' }}>
              <span>Discount ({availableDiscount.discountPercentage}%):</span>
              <span>-₹{getDiscountAmount().toFixed(2)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #000' }}>
            <span>Total:</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {availableDiscount && (
        <div className="card">
          <div style={{
            padding: '20px',
            backgroundColor: discountApplied ? '#d4edda' : '#fff3cd',
            border: `2px solid ${discountApplied ? '#c3e6cb' : '#ffc107'}`,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {discountApplied ? '✅' : '🎉'}
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: discountApplied ? '#155724' : '#856404' }}>
              {discountApplied ? `Discount Applied!` : `Congratulations, ${user?.name}!`}
            </h3>
            <p style={{ margin: '5px 0', color: discountApplied ? '#155724' : '#856404', fontSize: '16px' }}>
              {discountApplied
                ? 'Your discount has been applied to this order'
                : 'You have an automatic discount available!'}
            </p>
            <div style={{
              margin: '15px 0',
              padding: '10px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              border: `1px dashed ${discountApplied ? '#28a745' : '#ffc107'}`
            }}>
              <p style={{ margin: '5px 0', color: discountApplied ? '#155724' : '#856404', fontWeight: 'bold', fontSize: '18px' }}>
                {availableDiscount.discountPercentage}% OFF
              </p>
              <p style={{ margin: '5px 0', color: '#808080', fontSize: '12px' }}>
                Code: {availableDiscount.code}
              </p>
            </div>
            
            {!discountApplied ? (
              <button
                className="btn btn-success"
                onClick={handleApplyDiscount}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Apply Discount
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={handleRemoveDiscount}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Remove Discount
              </button>
            )}
          </div>
        </div>
      )}

      <button
        className="btn btn-success"
        style={{ width: '100%', padding: '15px', fontSize: '16px' }}
        onClick={handleCheckout}
        disabled={processing}
      >
        {processing ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout;