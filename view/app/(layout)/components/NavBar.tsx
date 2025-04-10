"use client";

import Link from "next/link";
import { AppBar, Toolbar, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

// ✅ Extend the Window interface
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

interface ConnectionRequest {
  _id: string;
  sender_id: string;
  status: "pending" | "accepted" | "rejected";
  sender_email?: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const checkLoginStatus = () => {
    const userId = localStorage.getItem("user_id");
    const storedEmail = localStorage.getItem("email");
    if (userId) {
      setIsLoggedIn(true);
      setEmail(storedEmail || "");
    } else {
      setIsLoggedIn(false);
      setEmail("");
    }
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("authStateChanged", checkLoginStatus);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("authStateChanged", checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8000/networking_engagement/connections/received?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setRequests(data.requests || []);
        })
        .catch((err) => console.error("Error fetching connection requests:", err));
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setEmail("");
    window.dispatchEvent(new Event("authStateChanged"));
    router.push("/login");
  };

  const handleConnectionAction = async (id: string, action: "accept" | "reject") => {
    try {
      await fetch(`http://localhost:8000/networking_engagement/connections/${id}/${action}`, {
        method: "POST",
      });
      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };

  useEffect(() => {
    const addTranslateScript = () => {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,es,ar,pt,de,zh-CN",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    if (!window.google?.translate) {
      addTranslateScript();
    } else {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <AppBar position="sticky" className="bg-orange-500 py-3" elevation={0}>
      <Toolbar className="flex justify-between items-center py-2">
        <Container className="flex items-center">
          <Link href="/">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-white">SEES</div>
            </div>
          </Link>
          <div className="hidden md:block ml-8 text-3xl font-medium text-white">
            Smart Education Events System
          </div>
        </Container>

        <div className="flex items-center space-x-4 relative">
          <div id="google_translate_element" className="mr-4" />

          {isLoggedIn && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <Bell />
                  {requests.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full px-1">
                      {requests.length}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-10 bg-white border shadow-xl rounded-lg w-80 z-50">
                    <div className="p-3 text-sm font-semibold border-b bg-orange-50">
                      Incoming Connection Requests
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {requests.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">No requests</p>
                      ) : (
                        requests.map((req) => (
                          <div key={req._id} className="p-3 border-b text-sm">
                            <div className="font-medium mb-1">
                              {req.sender_email || req.sender_id}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleConnectionAction(req._id, "accept")}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleConnectionAction(req._id, "reject")}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-white hidden sm:inline-block">
                Welcome <span className="font-semibold">{email}</span>!
              </p>
              <button
                onClick={handleLogout}
                className="bg-white text-orange-500 rounded-full px-4 py-2 text-sm font-medium hover:bg-orange-100 transition min-w-[100px]"
              >
                Log Out
              </button>
            </>
          )}

          {!isLoggedIn && (
            <div className="flex space-x-4">
              <Link href="/login" passHref>
                <button className="bg-white text-orange-500 rounded-full px-4 py-2 text-sm font-medium hover:bg-orange-100 transition min-w-[100px]">
                  Log in
                </button>
              </Link>
              <Link href="/signup" passHref>
                <button className="bg-orange-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-orange-700 transition min-w-[100px]">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
