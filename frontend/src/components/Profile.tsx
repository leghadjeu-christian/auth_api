import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../auth";
import jwt_decode from "jwt-decode";
import { ProtectedService } from "../api";
import type { components } from "../api/types";

type User = components["schemas"]["User"];

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // jwt_decode(token); // Just to check validity
      ProtectedService.adminRoute()
        .then((userData: User) => {
          setUser(userData);
        })
        .catch((error) => {
          clearToken();
          navigate("/login");
        });
    } catch (error) {
      clearToken();
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <div>Email: {user.email}</div>
        <div>
          Name: {user.first_name} {user.last_name}
        </div>
        <div>Role: {user.role}</div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
