import React from "react";
import SymptomChat from "./components/SymptomChat";
import { Box } from "@mui/material";

function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SymptomChat />
    </Box>
  );
}

export default App;