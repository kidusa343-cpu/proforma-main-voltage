"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";

// Define protected routes
const protectedRoutes = ['/', '/view-proformas'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the current route is a protected route
        const isProtectedPath = protectedRoutes.some((route) =>
          pathname === route || pathname.startsWith(route)
        );

        console.log('Path:', pathname);
        console.log('Is Protected Path:', isProtectedPath);

        if (isProtectedPath) {
          // Retrieve the token using window.electronAPI.getAuthToken
          const token = await window.electronAPI.getAuthToken();
          console.log('Token retrieved:', token);

          if (!token) {
            console.log('Redirecting unauthenticated user to /auth/login');
            toast.error("Please log in to access this page.", {
              style: {
                backgroundColor: "#ff4444",
                color: "#ffffff",
                border: "none",
              },
            });
            router.push("/auth/login");
          }
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
        toast.error("Authentication failed. Please log in again.", {
          style: {
            backgroundColor: "#ff4444",
            color: "#ffffff",
            border: "none",
          },
        });
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [pathname, router]);

  return (
    <div>
      <div className="fixed flex justify-between w-full">
        <Sidebar />
        <Navbar />
      </div>
      <div className="pl-[275px] pt-8 text-balance">{children}</div>
    </div>
  );
}