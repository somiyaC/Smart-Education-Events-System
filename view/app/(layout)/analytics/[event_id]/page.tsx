"use client";

import { useParams } from 'next/navigation';

export default function EventAnalyticsPage() {
  const params = useParams();
  const event_id = params.event_id;

  return (
    <div>
      <h1>Analytics for Event: {event_id}</h1>
    </div>
  );
}
