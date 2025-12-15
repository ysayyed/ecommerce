import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Products from "./Products";

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <div
        className="container"
        style={{
          textAlign: "center",
          paddingTop: "60px",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
          Welcome to E-Commerce Store
        </h1>
        <p style={{ fontSize: "20px", color: "#808080" }}>
          Your one-stop shop for all your needs
        </p>
      </div>

      {/* Products Section */}
      <Products />
    </div>
  );
};

export default Landing;
