/**
 * EditUserModal Component
 * 
 * A modal dialog for editing user information in the CRM system.
 * This component provides a form interface for updating user details
 * and integrates with the Users API to persist changes.
 * 
 * Features:
 * - Editable fields: First Name, Last Name, Email, City
 * - Uses Helvetica font for name fields (as per PRD requirement)
 * - Input field width of ~300px for names (PRD specification)
 * - Form validation (required fields)
 * - Loading states during API calls
 * - Success/error notifications
 * - Prevents closing during save operation
 * 
 * @see PRD: Section 3.1.4 Edit User Modal
 */

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

/**
 * User interface definition matching the Users API structure
 * Represents a user with all their personal and location information
 */
interface User {
  login: {
    uuid: string; // Unique identifier for API calls
    username: string; // User's login username
  };
  name: {
    title: string; // Title (Mr., Ms., etc.)
    first: string; // First name
    last: string; // Last name
  };
  email: string; // User's email address
  location: {
    city: string; // City of residence
    country: string; // Country of residence
    street?: {
      number: number;
      name: string;
    };
    state?: string;
    postcode?: string;
  };
  dob: {
    age: number; // User's age
  };
}

/**
 * Props interface for EditUserModal component
 */
interface EditUserModalProps {
  open: boolean; // Controls modal visibility
  user: User | null; // User object to edit (null when modal is closed)
  onClose: () => void; // Callback when modal should close
  onUserUpdated: () => void; // Callback after successful user update (triggers data refresh)
}

/**
 * EditUserModal Component
 * 
 * Provides a form interface for editing user information within a modal dialog.
 * Manages form state, API interactions, and user feedback (success/error messages).
 * 
 * @param {EditUserModalProps} props - Component props
 * @returns {JSX.Element} Rendered modal dialog
 */
export default function EditUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  // Form State: Individual fields for controlled inputs
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  
  // UI State: Loading indicator during API calls
  const [loading, setLoading] = React.useState(false);
  
  // UI State: Error message to display when save fails
  const [error, setError] = React.useState("");
  
  // UI State: Success message to display after successful save
  const [successMessage, setSuccessMessage] = React.useState("");

  /**
   * Effect: Populate form fields when user prop changes
   * Updates all form fields with the selected user's data
   * Runs whenever a new user is selected for editing
   */
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
      setEmail(user.email);
      setCity(user.location.city);
    }
  }, [user]);

  /**
   * Handles the save action when user clicks the Save button
   * 
   * This function:
   * 1. Validates that a user is selected
   * 2. Sends a PUT request to the Users API
   * 3. Updates the UI based on success or failure
   * 4. Triggers data refresh on success
   * 5. Auto-closes modal after successful save
   * 
   * @async
   */
  const handleSave = async () => {
    // Guard: Ensure user is selected before attempting save
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Send PUT request to update user data
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: firstName,
              last: lastName,
            },
            email: email,
            location: {
              city: city,
            },
          }),
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Show success message to user
      setSuccessMessage("User updated successfully!");
      
      // Trigger parent component to refresh the user list
      onUserUpdated();
      
      // Auto-close modal after 1 second to allow user to see success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      // Handle and display error message
      setError(
        err instanceof Error ? err.message : "Failed to update user. Please try again."
      );
    } finally {
      // Always reset loading state when request completes
      setLoading(false);
    }
  };

  /**
   * Handles modal close action
   * Prevents closing during save operation and clears messages
   */
  const handleClose = () => {
    // Prevent closing modal while save is in progress
    if (!loading) {
      setError("");
      setSuccessMessage("");
      onClose();
    }
  };

  return (
    <>
      {/* Main Modal Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            padding: 1,
          },
        }}
      >
        {/* Modal Title */}
        <DialogTitle
          sx={{
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Edit User
        </DialogTitle>
        
        {/* Modal Content: Form fields */}
        <DialogContent>
          {/* Error Alert: Displayed at top of form when save fails */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Form Fields Container */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* First Name Field */}
            {/* PRD Requirement: Uses Helvetica font and ~300px width */}
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              disabled={loading}
              sx={{
                "& input": {
                  fontFamily: "Helvetica, Arial, sans-serif", // PRD: Helvetica font
                  fontSize: "16px",
                  width: "300px", // PRD: ~300px width
                },
              }}
            />
            
            {/* Last Name Field */}
            {/* PRD Requirement: Uses Helvetica font and ~300px width */}
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              disabled={loading}
              sx={{
                "& input": {
                  fontFamily: "Helvetica, Arial, sans-serif", // PRD: Helvetica font
                  fontSize: "16px",
                  width: "300px", // PRD: ~300px width
                },
              }}
            />
            
            {/* Email Field */}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
            
            {/* City Field */}
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              disabled={loading}
            />
          </Box>
        </DialogContent>
        
        {/* Modal Actions: Cancel and Save buttons */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {/* Cancel Button: Closes modal without saving */}
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          
          {/* Save Button: Triggers save action */}
          {/* Disabled during loading or when required fields are empty */}
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !firstName || !lastName || !email}
            sx={{
              minWidth: "100px",
            }}
          >
            {/* Show loading spinner during save, otherwise show "Save" text */}
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar: Displays success message at bottom of screen */}
      {/* Auto-hides after 3 seconds */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
