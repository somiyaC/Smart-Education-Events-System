"use client";

import { useState } from "react";

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    email: "",
    password: "",
    role: "attendee", // Valid default role
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleCreateUser = async () => {
    setError(null);

    if (!newUser.email || !newUser.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/auth/admin/create_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_user_id: localStorage.getItem("user_id"), // admin verification
            new_user: {
              email: newUser.email,
              password: newUser.password,
              role: newUser.role,
            },
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("User created successfully!");
        setError(null); // clear previous error
        setNewUser({
          email: "",
          password: "",
          role: "attendee",
        });
      } else {
        setError(
          data.detail || "Failed to create user. Please check form inputs."
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
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

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
            className="mt-1 block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            required
          />
        </div>

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
            className="mt-1 block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
            required
          />
        </div>

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
            className="mt-1 block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
          >
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
            <option value="speaker">Speaker</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleCreateUser}
            className="bg-orange-400 text-white text-sm rounded-3xl px-4 py-2 mt-4 cursor-pointer active:bg-orange-300"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
