import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h1>PaintBall Faks</h1>
          <h2>Prijavite se</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="vaš@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lozinka:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Unesite lozinku"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Prijavljujem..." : "Prijavite se"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Nemate račun?{" "}
            <Link to="/register" className="auth-link">
              Registrirajte se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
