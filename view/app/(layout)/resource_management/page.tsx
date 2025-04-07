"use client";
import React, { useState } from "react";
import { useAppContext } from "../../StateContext";

const UploadResource = () => {
  const { userId } = useAppContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [eventId, setEventId] = useState(""); // or prefill if known
  const [visibility, setVisibility] = useState("registered-only");

  const handleSubmit = async () => {
    const resource = {
      id: "",
      event_id: eventId,
      session_id: null,
      uploader_id: userId,
      title,
      description,
      file_url: fileUrl, // use file upload API if needed
      uploaded_at: new Date().toISOString(),
      visibility,
    };

    const res = await fetch("http://127.0.0.1:8000/resource_management/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resource),
    });

    const data = await res.json();
    alert(data.msg);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Upload Resource</h2>
      <input className="w-full p-2 border rounded" placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
      <input className="w-full p-2 border rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full p-2 border rounded" placeholder="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
      <select className="w-full p-2 border rounded" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="registered-only">Registered Only</option>
      </select>
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Upload</button>
    </div>
  );
};

export default UploadResource;
