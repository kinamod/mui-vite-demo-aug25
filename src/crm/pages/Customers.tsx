import * as React from "react";
import Box from "@mui/material/Box";
import CrmUsersTable from "../components/CrmUsersTable";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <CrmUsersTable />
    </Box>
  );
}
