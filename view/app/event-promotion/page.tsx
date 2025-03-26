"use client";

import { useState } from 'react';
import EventList, {Event} from '../event-promotion/EventList';
import PromotionSection from '../event-promotion/PromotionSection';

export default function EventPromotionPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold">Event Promotion Dashboard</h1>
      {!selectedEvent ? (
        <EventList onSelectEvent={(event) => setSelectedEvent(event)} />
      ) : (
        <PromotionSection event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}