"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAppContext } from "../../StateContext";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { createTheme, PaletteColorOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface CustomPalette {
    sees: PaletteColorOptions;
  }
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    sees: true;
  }
}

const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor: string) =>
  augmentColor({ color: { main: mainColor } });
const theme = createTheme({
  palette: {
    sees: createColor("#f17126"),
  },
});

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
          role: role,
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
        setError(`Signup failed: ${data.detail}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Signup failed. Check console for details.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      {/* Left Side: Signup Form */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "50%",
          padding: 3,
        }}
      >
        <Typography
          variant="h1"
          component="div"
          sx={{
            fontWeight: "bold",
            fontSize: "4rem",
            color: "black",
            textAlign: "center",
            margin: "20px 0",
          }}
        >
          Smart Education Events System
        </Typography>
        <Typography variant="h4" color="black" gutterBottom>
          Create an account
        </Typography>
        <form onSubmit={handleSignup}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="attendee">Attendee</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
              <MenuItem value="speaker">Speaker</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            color="primary"
            sx={{
              marginTop: 2,
              input: {
                color: "white",
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ color: "black", fontWeight: "bold" }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>

      {/* Right Side: Image */}
      <Box
        sx={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="/images/signup.jpg"
          alt="Signup Illustration"
          className="w-full h-full p-10 object-cover rounded-3xl"
        />
      </Box>
    </Box>
  );
};

export default Signup;
