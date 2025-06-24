import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../api";
import type { components } from "../api/types";
import api from "../api/client";
import "../styles/auth.css";

type RegisterRequest = components["schemas"]["RegisterRequest"];

export default function Register() {
  const [form, setForm] = useState<RegisterRequest>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("register", form);
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError("Registration failed");
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleRegister}>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <div className="form-group">
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
        </div>
        <div className="form-group">
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
        </div>
        <div className="form-group">
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">Register</button>
        <div className="auth-links">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}
