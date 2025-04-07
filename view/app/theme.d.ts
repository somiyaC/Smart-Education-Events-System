// theme.ts
import { createTheme } from '@mui/material/styles';

// Customize the primary color here
const theme = createTheme({
  palette: {
    primary: {
      main: '#f17126', // Set your primary color (e.g., #f17126)
    },
    secondary: {
      main: '#1976d2', // Optional: Customize the secondary color as well
    },
  },
});

export default theme;
