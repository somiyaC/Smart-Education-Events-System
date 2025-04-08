"use client";
import React from "react";
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

interface Attendee {
  id: string;
  name: string;
  email: string;
}

interface EventAnalyticsProps {
  eventName: string;
  description: string;
  createdAt: string;
  location: string;
  organizer: string;
  attendeeList: Attendee[];
  totalCheckIns: number;
  engagementRate: number;
}

export default function EventAnalyticsPage ({
  eventName,
  description,
  createdAt,
  location,
  organizer,
  attendeeList,
  totalCheckIns,
  engagementRate,
}: EventAnalyticsProps) {

  const params = useParams();
  const event_id = params.event_id;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Event Analytics Dashboard
      </Typography>

      <Stack spacing={3} direction={{ xs: "column", md: "row" }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {eventName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Organized by: {organizer}
            </Typography>
            <Typography variant="body1" paragraph>
              {description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Location: {location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created At: {new Date(createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Engagement Metrics</Typography>
            <Typography variant="body1">Total Check-ins: {totalCheckIns}</Typography>
            <Typography variant="body1">
              Engagement Rate: {engagementRate}%
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      
    </Box>
  );
};
