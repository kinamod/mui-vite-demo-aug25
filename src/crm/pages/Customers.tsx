import * as React from "react";
import Box from "@mui/material/Box";
import UsersTable from "../components/UsersTable";

export default function Customers() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { sm: "100%", md: "1700px" },
        backgroundColor: "#FCFCFC",
        p: 0,
      }}
    >
      <UsersTable />
    </Box>
  );
}
