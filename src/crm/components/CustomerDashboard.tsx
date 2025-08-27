import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CustomerDataGrid from "./CustomerDataGrid";
import CustomerEditModal from "./CustomerEditModal";

// User interface (same as in other components)
interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

export default function CustomerDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle opening edit modal for existing customer
  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setIsCreateMode(false);
    setModalOpen(true);
  };

  // Handle opening modal for new customer
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCreateMode(true);
    setModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
    setIsCreateMode(false);
  };

  // Handle saving customer (both create and update)
  const handleSaveCustomer = async (customer: User) => {
    try {
      if (isCreateMode) {
        setSnackbarMessage("Customer created successfully!");
      } else {
        setSnackbarMessage("Customer updated successfully!");
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      // Refresh the data grid by incrementing the refresh key
      setRefreshKey(prev => prev + 1);
      
      handleCloseModal();
    } catch (error) {
      setSnackbarMessage(
        `Failed to ${isCreateMode ? "create" : "update"} customer. Please try again.`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Customer Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your customer database with search, filtering, and editing capabilities.
          Data is synchronized with the USERS API.
        </Typography>
      </Box>

      {/* Customer Data Grid */}
      <CustomerDataGrid
        key={refreshKey} // Force re-render when refreshKey changes
        onEditCustomer={handleEditCustomer}
        onAddCustomer={handleAddCustomer}
      />

      {/* Customer Edit Modal */}
      <CustomerEditModal
        open={modalOpen}
        customer={selectedCustomer}
        isCreate={isCreateMode}
        onClose={handleCloseModal}
        onSave={handleSaveCustomer}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
