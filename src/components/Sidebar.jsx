import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { auth } from "../firebase";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Interviews", path: "/interviews" },
  { label: "Create Interview", path: "/create" },
];

export default function Sidebar() {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || "");
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-title">InterviewAdmin</div>
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link${location.pathname === item.path ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="avatar" />
        <div>
          <div className="user-name">Admin User</div>
          <div className="user-email">{userEmail || "admin@company.com"}</div>
        </div>
      </div>
    </aside>
  );
} 