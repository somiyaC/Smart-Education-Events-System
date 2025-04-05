"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";
import { useAppContext } from "../StateContext";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("attendee");
  const [error, setError] = useState("");
  const { userId, setUserId } = useAppContext();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: role, // Change role if needed
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.status === true) {
        setUserId(data.user_id);
        console.log("stored id", data.user_id);
        window.dispatchEvent(new Event("authStateChanged"));
        alert("Signup successful!");
        router.push("/login");
      } else {
        alert(`Signup failed: ${data.detail}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Check console for details.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      <div className="flex flex-col justify-start items-center px-8 lg:px-24 bg-white">
        <h1 className="text-3xl mb-4 text-gray-900">Create an account</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form className="space-y-4" onSubmit={handleSignup}>
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
          <select
            className="block w-full p-3 border border-gray-300 rounded-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
            <option value="speaker">Speaker</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full p-3 bg-orange-500 text-white rounded-full font-medium cursor-pointer active:bg-orange-600"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-bold hover:underline">
            Log in
          </Link>
        </p>
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

export default Signup;
