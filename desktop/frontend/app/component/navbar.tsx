// app/components/Navbar.tsx
"use client";

import {  LogOut } from "lucide-react";
import { logout } from "@/lib/electronUtils";
import { toast } from "sonner";

const Navbar = () => {
    const handleLogout = async () => {
        try {
            const result = await logout();
      if (result.success) {
        toast.success("Logged out successfully!", {
          style: {
            backgroundColor: "#00cc00",
            color: "#ffffff",
            border: "none",
          },
        });
        // Force a full page refresh to reset app state
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.", {
        style: {
          backgroundColor: "#ff4444",
          color: "#ffffff",
          border: "none",
        },
      });
    }}
    return (
        <div className="flex justify-end align-middle m-2">
            {/* <ModeToggle /> */}
            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="rounded-lg flex gap-2 items-center align-middle font-semibold h-8 dark:bg-gray-900 text-start bg-Sidebar text-sideBarBtnColor px-2 font-sans hover:bg-red-700 hover:text-white m-1 transition-all duration-300 delay-200"
            >
                Logout<LogOut className="dark:text-slate-200"/>
            </button>
        </div>
    );
};

export default Navbar;