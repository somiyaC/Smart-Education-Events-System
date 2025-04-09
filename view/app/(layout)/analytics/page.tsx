"use client";
import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { Typography,
  Box,
  Card,
  CardContent,
  Stack,
 } from "@mui/material";
import GeneralAnalytics from "./GeneralAnalytics";

interface Session {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  organizer: string;
  is_virtual: boolean;
  virtual_meeting_url: string;
  capacity: number;
  venue: string;
  sessions: Session[];
  participants: string[];
}

interface AnalyticsProp {
  sales_dict: [];
  participants_dict: [];
  total_participants: number;
  total_money: number;
  total_events: number;
  participants_chart: [];
  participants_chart_names: [];
}

const AnalyticsPage = () => {
  const [eventId, setEventId] = useState("e1");
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsProp>({
    sales_dict: [],
    participants_dict: [],
    total_participants: 0,
    total_money: 0,
    total_events: 0,
    participants_chart: [],
  participants_chart_names: []
  });

  useEffect(() => {
    if (!eventId) return;

    const fetchAnalytics = async () => {
      try {
        const regRes = await fetch(`http://127.0.0.1:8000/analytics/registrations/${eventId}`);
        const regData = await regRes.json();
        setRegistrationCount(regData.registration_count);

        const fbRes = await fetch(`http://127.0.0.1:8000/analytics/feedback/${eventId}`);
        const fbData = await fbRes.json();
        setAverageRating(fbData.average_rating);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, [eventId]);

  useEffect(() => {
    const fetchEvents = async () => {
      const userId = localStorage.getItem("user_id");
      try {
        const res = await fetch('http://localhost:8000/analytics/org_events/'+userId);
        const data = await res.json();
        const eventsData = data.events;
        const analyticsData = data.analytics;
        setEvents(eventsData);
        setAnalytics(analyticsData);
        console.log("aaa")
        console.log(analyticsData.participants_chart)

      
      } catch (err){
        console.log("failed to fetch organiser events")
      }
    }

    fetchEvents();
  },[])

  useEffect(() => {},[events])

  return (
    <div className="w-full flex flex-col items-center justify-center mt-12 p-6 rounded shadow">
      
      <Typography variant="h4" color="black" gutterBottom>
        Your General Analytics
      </Typography>
      <GeneralAnalytics participants_chart_names={analytics.participants_chart_names} participants_chart={analytics.participants_chart} total_money={analytics.total_money} total_participants={analytics.total_participants} total_events={analytics.total_events} sales_dict={analytics.sales_dict} participants_dict={analytics.participants_dict} />
      <Box sx={{ p: 4 }}>

        {/* Use Stack for horizontal arrangement */}
        <Stack direction="row" spacing={4} justifyContent="space-between">
          {/* Card for Total Sales */}
          <Card sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h3" color="primary">
                ${analytics.total_money.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          {/* Card for Total Participants */}
          <Card sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Total Participants
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.total_participants}
              </Typography>
            </CardContent>
          </Card>

          {/* Card for Total Events */}
          <Card sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Total Events
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.total_events}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
      <Typography variant="h4" color="black" gutterBottom>
          Your Created Events.
        </Typography>
        <div className="w-full flex items-center justify-center">
      <div className="flex flex-row w-5/6 justify-center items-center">
      {events && events.map((event) => (
        <div
          key={event.id}
          className="w-full sm:w-1/2 md:w-1/3 flex flex-row justify-center m-4"
        >
          <EventCard
            event_name={event.name}
            event_description={event.description}
            event_id={event.id}
          />
        </div>
      ))}
      </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
