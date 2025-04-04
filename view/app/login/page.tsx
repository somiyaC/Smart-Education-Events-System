"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAppContext } from "../StateContext";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { userId, setUserId, userRole, setUserRole } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("email", data.email);

        // Update context
        setUserId(data.user_id);
        setUserRole(data.role);

        window.dispatchEvent(new Event("authStateChanged"));

        // Redirect to home page for all users
        router.push("/");

        console.log(
          "Login successful, redirecting to home with role:",
          data.role
        );
        console.log("Setting role in context:", data.role);
        console.log("Role from localStorage:", localStorage.getItem("role"));
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
      <div className="flex flex-col justify-start items-center px-4 lg:px-24 bg-white">
        <h1 className="text-3xl mb-4 text-gray-900">Log In</h1>
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
            className="w-full p-3 bg-orange-500 text-white rounded-full font-medium cursor-pointer active:bg-orange-600"
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-orange-500">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block">
        <img
          src="/images/signup.jpg"
          alt="Signup Illustration"
          className="w-full max-h-[400px] object-cover rounded-3xl"
        />
      </div>
    </div>
  );
};

export default Login;
