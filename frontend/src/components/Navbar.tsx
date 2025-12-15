import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        E-Commerce Store
      </Link>
      <ul className="navbar-nav">
        {!isAuthenticated ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/admin/login">Admin Login</Link></li>
          </>
        ) : (
          <>
            <li><span>Welcome, {user?.name}</span></li>
            {!isAdmin ? (
              <>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
              </>
            ) : (
              <li><Link to="/admin/dashboard">Dashboard</Link></li>
            )}
            <li><button onClick={handleLogout} className="btn btn-secondary">Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;