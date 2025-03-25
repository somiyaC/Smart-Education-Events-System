"use client";

type User = {
  email: string;
  full_name: string;
  password: string;
};

interface ProfilePageProps {
  user: User | null;
}

export default function ProfilePage({ user }: ProfilePageProps) {
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
