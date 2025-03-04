"use client";
import Navbar from "@/app/components/NavBar";
import SearchBar from "@/app/components/SearchBar";
import Body from "@/app/components/Body";
import Footer from "@/app/components/Footer";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [events, setEvents] = useState([]);
  const backend_url = process.env.NEXT_PUBLIC_BACKEND;
  useEffect(() => {
    const fetchEvents = async () => {
      console.log("ENV: ", backend_url);
      try {
        const response = await axios.get(`${backend_url}`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      console.log("data: ", events);
    };

    fetchEvents();
  }, []);

  return (
    <>
      <Navbar />
      <SearchBar />
      <Body />
      <Footer />
    </>
  );
}
