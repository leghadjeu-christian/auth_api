import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api";
import { saveToken } from "../auth";
import type { components } from "../api/types";
import api from "../api/client";


type LoginRequest = components["schemas"]["LoginRequest"];

export default function Login() {
  const [form, setForm] = useState<LoginRequest>({
    email: "",
    password: "",
    role: "User", // Default role
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("login", form);
        navigate("/profile");
      
    } catch (err: any) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>
        <div className="form-group">
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit">Login</button>
        <div className="auth-links">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
}
