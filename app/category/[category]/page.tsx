// import React from "react";
// import Navbar from "@/app/components/NavBar";
// import Link from "next/link";
// import SearchBar from "@/app/components/SearchBar"; // Retained as a static UI element
// import Footer from "@/app/components/Footer";
// import {
//   FaCalendarAlt,
//   FaUsers,
//   FaTicketAlt,
//   FaMapMarkerAlt,
//   FaClock,
//   FaUser,
// } from "react-icons/fa";

// const EventsPage = async () => {
//   // Fetch events from the backend (no location filtering)
//   const backend_url = process.env.NEXT_PUBLIC_BACKEND;
//   const res = await fetch(`${backend_url}`);
//   const events = await res.json();

//   if (!res.ok) {
//     return (
//       <div className="text-center py-16">
//         <h1 className="text-3xl font-bold">Error</h1>
//         <p className="text-gray-600 mt-4">Failed to load events.</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="max-w-screen-xl w-full my-0 mx-auto mb-8">
//         <Navbar />

//         {/* Static SearchBar (no functionality) */}
//         <SearchBar />

//         {/* Breadcrumb */}
//         <p className="text-gray-500 text-sm mt-4 mb-4">
//           <Link href={"/"}>Home</Link> &gt; <Link href={"/"}>Category</Link>
//         </p>

//         <h1 className="text-3xl font-bold mb-4">All Events</h1>

//         {/* Event Tiles */}
//         <div className="flex-1 grid grid-cols-1 gap-6 max-w-[800px]">
//           {events.length > 0 ? (
//             events.map((event: any) => (
//               <Link href={`/events/${event.id}`} key={event.id}>
//                 <div className="flex bg-[#F5F5F5] rounded-3xl overflow-hidden">
//                   <img
//                     src={event.image}
//                     alt={event.title}
//                     className="w-1/3 object-cover"
//                   />
//                   <div className="p-4 flex flex-col justify-between flex-1">
//                     <h3 className="font-bold text-2xl text-gray-900 mb-2">
//                       {event.title}
//                     </h3>

//                     <div className="text-sm text-gray-600 flex items-center gap-2 mb-[1px]">
//                       <FaCalendarAlt />
//                       <span>{event.date}</span>
//                     </div>
//                     <div className="text-sm text-gray-600 flex items-center gap-2 mb-[1px]">
//                       <FaClock />
//                       <span>{event.time}</span>
//                     </div>
//                     <div className="text-sm text-gray-600 flex items-center gap-2 mb-[1px]">
//                       <FaUsers />
//                       <span>{event.attendees} Attending</span>
//                     </div>
//                     <div className="text-sm text-gray-600 flex items-center gap-2 mb-[1px]">
//                       <FaUser />
//                       <span>Hosted By: {event.host}</span>
//                     </div>
//                     <div className="text-sm text-gray-600 flex items-center gap-2 mb-[1px]">
//                       <FaTicketAlt />
//                       <span>{event.price}</span>
//                     </div>
//                     <div className="text-sm text-gray-600 flex items-center gap-2 mb-[1px]">
//                       <FaMapMarkerAlt />
//                       <span>{event.location}</span>
//                     </div>
//                   </div>
//                   <div className="content-end mr-8">
//                     <button className="bg-orange-500 text-white rounded-full py-2 px-8 mb-4 hover:bg-orange-600">
//                       Attend
//                     </button>
//                   </div>
//                 </div>
//               </Link>
//             ))
//           ) : (
//             <p>No events found.</p>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default EventsPage;
