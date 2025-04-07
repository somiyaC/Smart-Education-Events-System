"use client";

import { useState } from "react";

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  // Add other fields here as necessary
}

const ProfilePage: React.FC = () => {
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    email: "",
    password: "",
    role: "user", // Default role
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleCreateUser = async () => {
    // Reset any previous errors
    setError(null);

    // Basic validation
    if (!newUser.email || !newUser.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/create_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          admin_id: localStorage.getItem("user_id"), // For verification
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("User created successfully!");
        // Reset the form
        setNewUser({
          email: "",
          password: "",
          role: "user",
        });
      } else {
        setError(
          data.message || "Failed to create user. Please check the form inputs."
        );
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("An error occurred while creating the user.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-black mb-6">
        Create New User
      </h2>
      <div className="space-y-4">
        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Role Selection */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            User Role
          </label>
          <select
            id="role"
            name="role"
            value={newUser.role}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="user">Attendee</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Create User Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCreateUser}
            className="bg-orange-400 text-white text-sm rounded-3xl px-4 py-2 mt-4 cursor-pointer active:bg-orange-400"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
