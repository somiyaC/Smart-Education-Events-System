"use client";
import React, { useEffect, useState } from 'react';
import { Event } from './types';
import {
  Card, CardContent, Typography, Grid, Box, CardActionArea
} from '@mui/material';
import { redirect } from 'next/navigation';
import { useAppContext } from '@/app/StateContext';


export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);

  const handleEventClick = (eventId: string) => {
    redirect(`/event-management/${eventId}`);
  };

  useEffect(() => {
    
    fetch("http://localhost:8000/events/organizer_event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ organizer_id: localStorage.getItem("user_id") }),
    })
      .then((res) => res.json())
      .then((data) => setEvents(data.events))
      .catch(console.error);
  }, []);

  return (
    <Box padding={4}>
      <Typography variant="h4" gutterBottom>
        My Events
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <CardActionArea onClick={() => handleEventClick(event.id)}>
                <CardContent>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(event.date).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {event.location}
                  </Typography>
                  {event.description && (
                    <Typography variant="body2" mt={1}>
                      {event.description.slice(0, 60)}...
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
