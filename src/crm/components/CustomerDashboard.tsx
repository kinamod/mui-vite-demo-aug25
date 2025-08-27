import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CustomerDataGrid from "./CustomerDataGrid";
import CustomerEditModal from "./CustomerEditModal";

/**
 * User interface definition that matches the structure returned by the USERS API.
 * This interface represents a complete customer record with all nested objects
 * including login credentials, personal information, location data, and profile pictures.
 *
 * The structure follows the random user API format but is used for our
 * customer management system with full CRUD operations support.
 */
interface User {
  /** Login credentials and unique identifier */
  login: {
    uuid: string;        // Unique identifier for the user
    username: string;    // User's login username
    password: string;    // User's password (should be hashed in production)
  };
  /** Personal name information with title */
  name: {
    title: string;       // Title (Mr, Mrs, Ms, Dr, etc.)
    first: string;       // First name
    last: string;        // Last name
  };
  /** Gender identification */
  gender: string;        // Gender (male/female)
  /** Complete address and location information */
  location: {
    /** Street address details */
    street: {
      number: number;    // Street number
      name: string;      // Street name
    };
    city: string;        // City name
    state: string;       // State/province
    country: string;     // Country name
    postcode: string;    // Postal/ZIP code
    /** Geographic coordinates */
    coordinates: {
      latitude: number;  // Latitude coordinate
      longitude: number; // Longitude coordinate
    };
    /** Timezone information */
    timezone: {
      offset: string;          // UTC offset (e.g., "-05:00")
      description: string;     // Timezone description
    };
  };
  /** Contact information */
  email: string;         // Primary email address
  /** Date of birth and age information */
  dob: {
    date: string;        // Birth date in ISO format
    age: number;         // Current age in years
  };
  /** Registration information */
  registered: {
    date: string;        // Registration date in ISO format
    age: number;         // Years since registration
  };
  /** Phone numbers */
  phone: string;         // Primary phone number
  cell: string;          // Mobile/cell phone number
  /** Profile pictures in different sizes */
  picture: {
    large: string;       // Large profile picture URL
    medium: string;      // Medium profile picture URL
    thumbnail: string;   // Thumbnail profile picture URL
  };
  /** Nationality code */
  nat: string;           // Nationality code (e.g., "US", "CA")
}

/**
 * CustomerDashboard - Main container component for customer management functionality.
 *
 * This component orchestrates the customer management workflow by:
 * - Displaying a searchable data grid of customers
 * - Managing modal state for creating/editing customers
 * - Handling success/error notifications via snackbars
 * - Coordinating data refresh between components
 *
 * Features:
 * - View customers in a paginated, searchable table
 * - Create new customers via modal form
 * - Edit existing customers via modal form
 * - Real-time data synchronization with USERS API
 * - User feedback through success/error notifications
 */
export default function CustomerDashboard() {
  // Modal state management for customer creation/editing
  const [modalOpen, setModalOpen] = useState(false);                                    // Controls visibility of the edit/create modal
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);         // Stores the customer being edited (null for new customer)
  const [isCreateMode, setIsCreateMode] = useState(false);                             // Determines if modal is in create (true) or edit (false) mode

  // Snackbar state management for user feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);                             // Controls visibility of success/error notifications
  const [snackbarMessage, setSnackbarMessage] = useState("");                          // Message to display in the snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success"); // Severity level for styling (success = green, error = red)

  // Data refresh mechanism - incrementing this key forces CustomerDataGrid to re-fetch data
  const [refreshKey, setRefreshKey] = useState(0);                                     // Used as React key to trigger data grid refresh

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
