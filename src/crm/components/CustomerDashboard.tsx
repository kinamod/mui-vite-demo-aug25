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

  /**
   * Handles opening the edit modal for an existing customer.
   * This function is called when a user clicks the edit button in the data grid.
   *
   * @param customer - The customer object to be edited
   *
   * Workflow:
   * 1. Sets the selected customer to be edited
   * 2. Switches modal to edit mode (not create mode)
   * 3. Opens the modal dialog
   */
  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);     // Store the customer data for editing
    setIsCreateMode(false);           // Set to edit mode (not create)
    setModalOpen(true);               // Open the modal dialog
  };

  /**
   * Handles opening the modal for creating a new customer.
   * This function is called when a user clicks the "Add Customer" button.
   *
   * Workflow:
   * 1. Clears any previously selected customer
   * 2. Switches modal to create mode
   * 3. Opens the modal dialog with empty form
   */
  const handleAddCustomer = () => {
    setSelectedCustomer(null);        // Clear any previously selected customer
    setIsCreateMode(true);            // Set to create mode
    setModalOpen(true);               // Open the modal dialog
  };

  /**
   * Handles closing the customer edit/create modal.
   * This function resets all modal-related state to clean up after modal closure.
   *
   * Workflow:
   * 1. Closes the modal dialog
   * 2. Clears the selected customer
   * 3. Resets the create mode flag
   */
  const handleCloseModal = () => {
    setModalOpen(false);              // Close the modal dialog
    setSelectedCustomer(null);        // Clear selected customer data
    setIsCreateMode(false);           // Reset create mode flag
  };

  /**
   * Handles saving customer data (both create and update operations).
   * This function is called when the user submits the customer form modal.
   * The actual API calls are handled within the CustomerEditModal component.
   *
   * @param customer - The customer data to be saved
   *
   * Workflow:
   * 1. Determines the appropriate success message based on operation type
   * 2. Shows success notification to user
   * 3. Triggers data grid refresh to show updated data
   * 4. Closes the modal dialog
   * 5. Handles any errors by showing error notification
   */
  const handleSaveCustomer = async (customer: User) => {
    try {
      // Set appropriate success message based on operation type
      if (isCreateMode) {
        setSnackbarMessage("Customer created successfully!");
      } else {
        setSnackbarMessage("Customer updated successfully!");
      }
      setSnackbarSeverity("success");     // Set notification to success (green)
      setSnackbarOpen(true);              // Show the success notification

      // Force data grid to refresh by incrementing the refresh key
      // This triggers a re-render of CustomerDataGrid component with fresh data
      setRefreshKey(prev => prev + 1);

      // Close the modal after successful operation
      handleCloseModal();
    } catch (error) {
      // Handle any errors during the save operation
      setSnackbarMessage(
        `Failed to ${isCreateMode ? "create" : "update"} customer. Please try again.`
      );
      setSnackbarSeverity("error");       // Set notification to error (red)
      setSnackbarOpen(true);              // Show the error notification
    }
  };

  /**
   * Handles closing the success/error notification snackbar.
   * This function is called when the user dismisses the notification
   * or when the auto-hide duration expires.
   */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);             // Hide the notification snackbar
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
