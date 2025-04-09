"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  password: string;
  // Add other fields here as necessary
}

interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordUpdate, setPasswordUpdate] = useState<PasswordUpdate>({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch("http://localhost:8000/auth/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: localStorage.getItem("user_id"),
      }),
    })
      .then((res) => res.json())
      .then((data: User) => {
        setUser(data);
      })
      .catch((error) => console.error("Error fetching user:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async () => {
    // Reset any previous errors
    setError(null);

    // Basic validation
    if (!passwordUpdate.currentPassword || !passwordUpdate.newPassword) {
      setError("Both current and new password are required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/auth/update_password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: passwordUpdate.currentPassword,
            new_password: passwordUpdate.newPassword,
            user_id: localStorage.getItem("user_id"),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Clear the password fields
        setPasswordUpdate({
          currentPassword: "",
          newPassword: "",
        });
        alert("Password updated successfully!");
      } else {
        setError(
          data.message ||
            "Failed to update password. Please check your current password."
        );
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setError("An error occurred while updating your password");
    }
  };

  if (loading) return <p>Loading your profile...</p>;

  if (!user) {
    return <p>Sign in to manage your account</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-black mb-6">
        Update Password
      </h2>

      <div className="space-y-4">
        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordUpdate.currentPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordUpdate.newPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Update Password Button */}
        <div className="flex justify-center">
          <button
            onClick={handlePasswordUpdate}
            className="bg-orange-400 text-white text-sm rounded-3xl px-4 py-2 mt-4 cursor-pointer active:bg-orange-300"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
