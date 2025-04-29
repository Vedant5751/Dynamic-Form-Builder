import React, { useState } from "react";
import { UserData } from "../types/form";
import { createUser } from "../services/api";

interface LoginProps {
  onLogin: (rollNumber: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<UserData>({
    rollNumber: "",
    name: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUser(formData);
      onLogin(formData.rollNumber);
    } catch (err) {
      setError("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-testid="login-container">
      <h2 data-testid="login-title">Login</h2>
      <form onSubmit={handleSubmit} data-testid="login-form">
        <div className="form-group" data-testid="roll-number-group">
          <label htmlFor="rollNumber" data-testid="roll-number-label">Roll Number</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
            data-testid="roll-number-input"
          />
        </div>
        <div className="form-group" data-testid="name-group">
          <label htmlFor="name" data-testid="name-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            data-testid="name-input"
          />
        </div>
        {error && (
          <div className="error-message" data-testid="login-error">
            {error}
          </div>
        )}
        <button 
          type="submit" 
          disabled={loading} 
          data-testid="login-button"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
