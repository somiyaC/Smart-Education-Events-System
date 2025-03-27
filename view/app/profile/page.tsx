"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  password: string;
  // Add other fields here as necessary
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // Default to null, as we haven't fetched the user yet
  const [editedUser, setEditedUser] = useState<User | null>(null); // For editing the user info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch(`http://localhost:8000/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data: User) => {
        setUser(data);
        setEditedUser(data);
      })
      .catch((error) => console.error("Error fetching user:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prevUser) =>
      prevUser ? { ...prevUser, [name]: value } : null
    );
  };

  const handleSaveChanges = async () => {
    if (!editedUser) return;

    try {
      const response = await fetch(
        `http://localhost:8000/users/${editedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: editedUser.email,
            password: editedUser.password,
            // Add other fields as necessary
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUser(data); // Update the user state with the saved data
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <p>No user found. Please log in to view your profile.</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
        Profile
      </h2>
      <div className="space-y-4">
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
            value={editedUser?.email || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
            value={editedUser?.password || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white text-sm rounded-3xl px-4 py-2 mt-4 hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
