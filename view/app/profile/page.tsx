"use client";

import { useAppContext } from "../StateContext"; // Adjust the import path as needed
import { useState, useEffect } from "react";

type User = {
  email: string;
  full_name: string;
  password: string;
};

export default function ProfilePage() {
  const { userId } = useAppContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<User, "password">>({
    email: "",
    full_name: "",
  });

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    async function fetchUserData() {
      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Replace with your actual API endpoint to fetch user data
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);
        setFormData({
          email: userData.email,
          full_name: userData.full_name,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert("You must be logged in to update profile");
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Log In to edit your profile!</p>;
  }

  return (
    <div className="flex justify-center items-center ">
      <div className="w-full max-w-lg ml-1">
        <h1 className="text-3xl font-bold mb-4">Edit Your Profile</h1>
        <form action="/profile/update" method="POST" className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              name="name"
              defaultValue={user.full_name}
              className="w-full p-3 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 "
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              className="w-full p-3 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              name="password"
              defaultValue={user.password}
              className="w-full p-3 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

//for testing with fake data

// "use client";

// type User = {
//   email: string;
//   full_name: string;
//   password: string;
// };

// interface ProfilePageProps {
//   user: User | null;
// }

// export default function ProfilePage({ user }: ProfilePageProps) {
//   // Fake data for testing
//   const fakeUser: User = {
//     email: "john.doe@example.com",
//     full_name: "John Doe",
//     password: "password123", // In a real app, you'd never prefill the password
//   };

//   // Use fake data if the user is null
//   const userData = user || fakeUser;

//   return (
//     <div className="flex justify-center items-center ">
//       <div className="w-full max-w-lg ml-1">
//         <h1 className="text-3xl font-bold mb-4">Edit Your Profile</h1>
//         <form action="/profile/update" method="POST" className="space-y-4">
//           <div>
//             <label className="block text-lg font-medium text-gray-700">
//               Name:
//             </label>
//             <input
//               type="text"
//               name="name"
//               defaultValue={userData.full_name}
//               className="w-full p-3 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 "
//             />
//           </div>
//           <div>
//             <label className="block text-lg font-medium text-gray-700">
//               Email:
//             </label>
//             <input
//               type="email"
//               name="email"
//               defaultValue={userData.email}
//               className="w-full p-3 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>
//           <div>
//             <label className="block text-lg font-medium text-gray-700">
//               Password:
//             </label>
//             <input
//               type="password"
//               name="password"
//               defaultValue={userData.password}
//               className="w-full p-3 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Save Changes
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
