"use client";

import React, { useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";

const Signup = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      {/* Left Section - Form */}
      <div className="flex flex-col justify-center px-8 lg:px-24 bg-white">
        <div className="mb-6">
          <Link href={"/"}>
            <div className="text-5xl font-semibold text-gray-800">
              Smart Education Events System
            </div>
          </Link>
        </div>
        <h1 className="text-3xl mb-4 text-gray-900">Create an account</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="block w-full p-3 border border-gray-300 rounded-full"
          />
          <input
            type="password"
            placeholder="Password"
            className="block w-full p-3 border border-gray-300 rounded-full"
          />
          <button
            type="submit"
            className="w-full p-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-700"
          >
            <Link href="/">Continue</Link>
          </button>
        </form>
        <div className="my-4 text-center text-gray-500">or</div>
        <button
          type="button"
          className="w-full p-3 mb-4 bg-white border border-gray-300 text-gray-800 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <FaGoogle className="text-lg" />
          <Link href="/">Sign In with Google</Link>
        </button>
        <div className="text-center text-gray-500 mb-4">
          Other sign up methods
        </div>
        <button
          type="button"
          className="w-full p-3 bg-blue-600 text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <FaFacebook className="text-lg" />
          <Link href="/">Sign In with Facebook</Link>
        </button>
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block">
        <img
          src="/signup.jpeg"
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Signup;
