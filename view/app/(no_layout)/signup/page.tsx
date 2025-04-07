"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";
import { useAppContext } from "../../StateContext";
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
} from '@mui/material';

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("attendee");
  const [error, setError] = useState("");
  const { userId, setUserId } = useAppContext();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: role, // Change role if needed
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.status === true) {
        setUserId(data.user_id);
        console.log("stored id", data.user_id);
        window.dispatchEvent(new Event("authStateChanged"));
        alert("Signup successful!");
        router.push("/login");
      } else {
        alert(`Signup failed: ${data.detail}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Check console for details.");
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '100vh',
      }}
    >
      {/* Left: Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          px: { xs: 4, md: 12 },
          py: 8,
        }}
      >
        <Container maxWidth="sm">
          <Typography
                variant="h1" // Use h1 for large text size
                component="div" // Optional: can be used to change the HTML tag (e.g., h1, div)
                sx={{
                  fontWeight: 'bold', // Ensures the text is bold
                  fontSize: '4rem', // Large font size, you can adjust as needed
                  color: 'black', // Adjust text color if needed
                  textAlign: 'center', // Center the text if needed
                  margin: '20px 0', // Adjust margin as needed
                }}
              >
                Smart Education Event System
              </Typography>
          <Typography variant="h4" gutterBottom>
            Create an account
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSignup} noValidate>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Select
              fullWidth
              value={role}
              onChange={(e: SelectChangeEvent) => setRole(e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="attendee">Attendee</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
              <MenuItem value="speaker">Speaker</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                backgroundColor: 'orange',
                ':hover': { backgroundColor: 'darkorange' },
                borderRadius: 5,
                p: 1.5,
              }}
            >
              Sign Up
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link href="/login" passHref>
              <Typography component="span" sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'black' }}>
                Log in
              </Typography>
            </Link>
          </Typography>
        </Container>
      </Box>

      {/* Right: Image */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <img
          src="/images/signup.jpg"
          alt="Signup Illustration"
          style={{ objectFit: 'cover' }}
        />
      </Box>
    </Box>
  );
};

export default Signup;
