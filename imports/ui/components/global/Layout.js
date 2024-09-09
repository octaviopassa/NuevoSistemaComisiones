import React, { useState } from "react";
import { Aside } from "./Aside";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: "flex" }}>
      <Aside isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`home-section ${isSidebarOpen ? "" : "full-width"}`}>
        <Header toggleSidebar={toggleSidebar} />
        <Outlet />
      </div>
    </div>
  );
}
