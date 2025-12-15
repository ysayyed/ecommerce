import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productApi, cartApi } from "../services/api";
import type { Product } from "../services/api";

const Products = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await cartApi.addToCart({ productId, quantity: 1 });
      setSuccess("Product added to cart!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
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
      <h1 style={{ marginBottom: "30px" }}>Available Products</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {products.length === 0 ? (
        <div className="card">
          <p>No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {products.map((product) => (
            <div key={product._id} className="card">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    backgroundColor: "#fff",
                    padding: "10px",
                  }}
                />
              )}
              <h3>{product.name}</h3>
              <p style={{ color: "#808080", marginBottom: "10px" }}>
                {product.description}
              </p>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                ₹{product.price.toFixed(2)}
              </p>
              <p
                style={{
                  color: product.stock > 0 ? "#28a745" : "#dc3545",
                  marginBottom: "15px",
                }}
              >
                {product.stock > 0
                  ? `In Stock: ${product.stock}`
                  : "Out of Stock"}
              </p>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => handleAddToCart(product._id!)}
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
