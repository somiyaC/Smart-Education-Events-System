"use client";
import { useEffect } from "react";
import AllEvents from "./(layout)/events/eventList";
import {redirect} from "next/navigation";

const EventsPage: React.FC = () => {

  useEffect(() =>{
    redirect("/events");
  },[])

  return (
    <></>
  );
};

export default EventsPage;
