"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAppContext } from '../StateContext';
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { userId, setUserId } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Prevent default form submission

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("token", data.token); 
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id)
        localStorage.setItem("email",data.email)
        console.log("user_id", data.user_id)
        setUserId(data.user_id)
        console.log("user",data.user_id)

        // Redirect based on role
        if (data.role === "admin") {
          router.push("/admin-dashboard");
        } else {
          router.push("/"); 
        }
      } else {
        setError(data.detail || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Check console for details.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      <div className="flex flex-col justify-center px-8 lg:px-24 bg-white">
        <h1 className="text-3xl mb-4 text-gray-900">Sign In</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            className="block w-full p-3 border border-gray-300 rounded-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="block w-full p-3 border border-gray-300 rounded-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-700"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>Don't have an account? <Link href="/signup" className="text-orange-500">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
