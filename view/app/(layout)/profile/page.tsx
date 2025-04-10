"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  password: string;
  interests?: string[];
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
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [connections, setConnections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/networking_engagement/user_connections?user_id=${userId}`);
      const data = await res.json();
      const uniqueConnections: string[] = [...new Set((data.connections || []) as string[])];
      setConnections(uniqueConnections);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch("http://localhost:8000/auth/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data: any) => {
        setUser(data.user);
        setUserInterests(data.user?.interests || []);
        fetchConnections(userId);
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
    setError(null);

    if (!passwordUpdate.currentPassword || !passwordUpdate.newPassword) {
      setError("Both current and new password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/update_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: passwordUpdate.currentPassword,
          new_password: passwordUpdate.newPassword,
          user_id: localStorage.getItem("user_id"),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordUpdate({ currentPassword: "", newPassword: "" });
        alert("Password updated successfully!");
      } else {
        setError(data.message || "Failed to update password. Please check your current password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setError("An error occurred while updating your password");
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim() || !user) return;

    const updated = [...userInterests, newInterest.trim()];
    setUserInterests(updated);
    setNewInterest("");

    await fetch("http://localhost:8000/auth/update_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        interests: updated,
      }),
    });
  };

  if (loading) return <p>Loading your profile...</p>;
  if (!user) return <p>Sign in to manage your account</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-black mb-8">Update Password</h2>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordUpdate.currentPassword}
            onChange={handleInputChange}
            className="block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordUpdate.newPassword}
            onChange={handleInputChange}
            className="block w-full border border-orange-400 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handlePasswordUpdate}
            className="bg-orange-400 text-white text-sm rounded-3xl px-6 py-2 mt-2 cursor-pointer active:bg-orange-300"
          >
            Update Password
          </button>
        </div>
      </div>

      <hr className="my-10 border-gray-300" />

      <div>
        <h3 className="text-xl font-bold text-center mb-4">Your Interests</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Add a new interest"
            className="flex-grow border border-blue-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
          />
          <button
            onClick={handleAddInterest}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Add
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {userInterests.map((interest, idx) => (
            <li
              key={idx}
              className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-md shadow-sm"
            >
              {interest}
            </li>
          ))}
        </ul>
      </div>

      <hr className="my-10 border-gray-300" />

      <div>
        <h3 className="text-xl font-bold text-center mb-4">Your Connections</h3>
        <ul className="space-y-2">
          {connections.length > 0 ? (
            connections.map((email, idx) => (
              <li
                key={idx}
                className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-md shadow-sm"
              >
                {email}
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500">No connections yet</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
