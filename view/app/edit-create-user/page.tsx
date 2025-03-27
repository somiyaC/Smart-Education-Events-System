"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditCreateUser() {

  const router = useRouter();

  useEffect(() => {
    let role = localStorage.getItem("role");
    if (role !== "organizer") {
      alert("Unauthorized");
      router.push("/")
      return;
    }


  },[])

  return <div className="p-6 text-xl">Edit or Create Users</div>;
}
