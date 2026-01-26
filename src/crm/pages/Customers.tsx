import * as React from "react";
import Box from "@mui/material/Box";
import CustomersDashboard from "../components/CustomersDashboard";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <CustomersDashboard />
    </Box>
  );
}
