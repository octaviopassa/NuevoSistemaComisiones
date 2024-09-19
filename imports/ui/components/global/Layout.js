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
    <>
      <Aside
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Header toggleSidebar={toggleSidebar} />
      <div className={`animate__animated animate__delay-1s ${isSidebarOpen ? "home-section" : ""}`} style={{ marginLeft: isSidebarOpen ? "0" : "80px" }}>
        <Outlet />
      </div>
    </>
  );
}
