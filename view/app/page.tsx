"use client";
import Navbar from "@/app/components/NavBar";
import SearchBar from "@/app/components/SearchBar";
import SideBarNavBar from "@/app/components/SideBarNavBar";
import Body from "@/app/components/Body";
import Footer from "@/app/components/Footer";
import React, { useEffect, useState } from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      <SearchBar />
      <div className="flex flex-grow">
        <SideBarNavBar />
        <Body />
      </div>
      <Footer />
    </>
  );
}
