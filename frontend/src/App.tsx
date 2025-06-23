import React, { JSX, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import { getToken, isSessionValid, clearToken } from "./auth";
import "./index.css";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || !isSessionValid()) {
      clearToken();
      navigate("/login");
    }

    const timeout = setTimeout(() => {
      clearToken();
      navigate("/login");
    }, 10 * 60 * 1000); // 10 min

    return () => clearTimeout(timeout);
  }, [navigate]);

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
