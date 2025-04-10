"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAppContext } from "../../StateContext";
import Link from "next/link";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
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

// Make sure the component is declared as a function
const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { userId, setUserId, userRole, setUserRole } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("email", data.email);

        // Update context
        setUserId(data.user_id);
        setUserRole(data.role);

        window.dispatchEvent(new Event("authStateChanged"));

        // Redirect to home page for all users
        router.push("/events");

        console.log(
          "Login successful, redirecting to home with role:",
          data.role
        );
        console.log("Setting role in context:", data.role);
        console.log("Role from localStorage:", localStorage.getItem("role"));
      } else {
        setError(data.detail || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Check console for details.");
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
      {/* Left Side: Login Form */}
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
          variant="h1" // Use h1 for large text size
          component="div" // Optional: can be used to change the HTML tag (e.g., h1, div)
          sx={{
            fontWeight: "bold", // Ensures the text is bold
            fontSize: "4rem", // Large font size, you can adjust as needed
            color: "black", // Adjust text color if needed
            textAlign: "center", // Center the text if needed
            margin: "20px 0", // Adjust margin as needed
          }}
        >
          Smart Education Events System
        </Typography>
        <Typography variant="h4" color="black" gutterBottom>
          Login to your account!
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            className="w-4/6"
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500">{error}</p>}
          <a href="/signup">Dont have an account? Register here!</a>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            color="primary"
            sx={{
              marginTop: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
              color: "white",
              fontWeight: "bold",
            }}
          >
            Login
          </Button>

          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Dont have an account?{" "}
              <Link
                href="/signup"
                style={{ color: "black", fontWeight: "bold" }}
              >
                Sign up
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

// Make sure we're properly exporting the component
export default Login;
