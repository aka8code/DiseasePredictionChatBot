import React from "react";
import SymptomInput from "./components/SymptomChat";
import { Box } from "@mui/material";

function App() {
  return (
    <Box
      minHeight="100vh"
      bgcolor="#f9fafb" // Tailwind gray-50 equivalent
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={3} // padding-left/right like p-6
      py={4} // padding-top/bottom
    >
      <SymptomInput />
    </Box>
  );
}

export default App;
