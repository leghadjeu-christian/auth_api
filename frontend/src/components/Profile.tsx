import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getToken, clearToken } from "../auth";
import type { components } from "../api/types";
import api from "../api/client";
import "../styles/auth.css";

type User = components["schemas"]["User"];

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    // Fetch user info from backend
    api
      .get<User>("profile") // Adjust endpoint as needed
      .then((res) => {
        setUser(res.data);
        setIsLoggedIn(true);
      })
      .catch(() => {
        clearToken();
        setIsLoggedIn(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;

  if (!isLoggedIn || !user) {
    return (
      <div>
        <h2>You are not logged in.</h2>
        <p>
          Please <Link to="/login">login</Link> to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <div>Email: {user.email}</div>
        <div>Name: {user.first_name} {user.last_name}</div>
        <div>Role: {user.role}</div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
