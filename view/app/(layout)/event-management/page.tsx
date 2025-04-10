"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Modal,
  TextField,
  IconButton,
} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from "@mui/icons-material/Close";

interface Event {
  id: string;
  name: string;
  description: string;
  participants_email?: string[];
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [materialText, setMaterialText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8000/events/organizer_event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organizer_id: userId }),
        });

        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch organizer events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const toggleAttendees = (eventId: string) => {
    setExpandedEventId((prev) => (prev === eventId ? null : eventId));
  };

  const handleSubmitMaterial = () => {
    console.log("Submitting material:", materialText, "for event:", selectedEventId);
    // TODO: POST to backend
    setMaterialModalOpen(false);
    setMaterialText("");
    setSelectedEventId(null);
  };

  return (
    <Box sx={{ p: 4, maxWidth: "800px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        My Organized Events
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Typography>No events found.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {events.map((event) => (
            <Card key={event.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {event.description}
                </Typography>

                {expandedEventId === event.id && (
                  <>
                    <Typography variant="subtitle1">Attendees:</Typography>
                    {event.participants_email && event.participants_email.length > 0 ? (
                      <List dense>
                        {event.participants_email.map((email, idx) => (
                          <ListItem key={idx} disablePadding>
                            <ListItemText primary={email} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No attendees registered yet.
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => toggleAttendees(event.id)}>
                  {expandedEventId === event.id ? "Hide" : "View"} Attendees
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setMaterialModalOpen(true);
                  }}
                >
                  Add Material
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal for adding material */}
      <Modal
        open={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        aria-labelledby="add-material-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <div className="flex flex-col"> 
              <Typography id="add-material-title" variant="h6">
                Add Material
              </Typography>
              <Typography id="add-title" variant="body2" fontWeight="normal" color="text.secondary">                Material will be shared with attendees
              </Typography>
            </div>
           
            <IconButton onClick={() => setMaterialModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Material (e.g. URL, notes)"
            value={materialText}
            onChange={(e) => setMaterialText(e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
          />
          <Typography variant="h6" gutterBottom>
        Upload Materials
      </Typography>

      <input
        accept="*"
        style={{ display: 'none' }}
        id="upload-button-file"
        multiple
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="upload-button-file" className="mr-4">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadFileIcon />}
        >
          Upload File(s)
        </Button>
      </label>

      {files.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1">Selected Files:</Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitMaterial}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
