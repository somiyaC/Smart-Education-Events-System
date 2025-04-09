"use client";
import React, { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Paper,
  Stack
} from "@mui/material";
import { PieChart } from '@mui/x-charts/PieChart';
import { Checkbox, FormControlLabel } from "@mui/material";

interface EventDataProp {
  name: string;
  description: string;
  location: string;
  is_virtual: boolean;
  total_check_in: number;
  event_type: string;
  created_at: string;
  capacity: number;
}

export default function EventAnalyticsPage () {

  const params = useParams();
  const email = localStorage.getItem("email");
  const event_id = params.event_id;
  const [eventData, setEventData] = useState<EventDataProp>({
    name: "",
    event_type: "Conference",
    description: "",
    location: "",
    is_virtual: false,
    total_check_in: 0,
    created_at: "",
    capacity: 100
  });

  useEffect(() => {
    const fetchEventData = async () => {
      const res = await fetch("http://localhost:8000/analytics/event_data/"+event_id);
      const data = await res.json();
      setEventData({
        name: data.name,
        description: data.description,
        event_type: data.event_type,
        location: data.location,
        is_virtual: data.is_virtual,
        total_check_in: data.total_check_in,
        created_at: data.create_at,
        capacity: data.capacity
      });
    }

    fetchEventData();
  },[])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Event Analytics Dashboard
      </Typography>

      <Stack spacing={3} direction={{ xs: "column", md: "row" }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {eventData.name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Organized by: {email}
            </Typography>
            <Typography variant="body1" paragraph>
              {eventData.description}
            </Typography>
            <Typography variant="body1" paragraph>
              {eventData.event_type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Location: {eventData.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created At: {eventData.created_at}
            </Typography>
            <div className="flex flex-row items-center">
              <Typography className="mr-2" variant="body2" color="text.secondary">
                Is Virtual:
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={eventData.is_virtual} disabled />}
                label=""
              />
            </div>
            
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Engagement Metrics</Typography>
            <Typography variant="body1">Total Check-ins: {eventData.total_check_in}</Typography>
            <Typography variant="body1">
              Engagement Rate: {eventData.total_check_in/eventData.capacity}%
            </Typography>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: eventData.total_check_in, label: 'Engaged' },
                    { id: 1, value: eventData.capacity - eventData.total_check_in, label: 'Not Engaged' },
                  ],
                },
              ]}
              colors={['orange', 'gray']}
              width={400}
              height={200}
            />
          </CardContent>
        </Card>
      </Stack>

      
    </Box>
  );
};
