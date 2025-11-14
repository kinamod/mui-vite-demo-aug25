import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import Alert from "@mui/material/Alert";

/**
 * Base URL for the Users API
 * This API provides endpoints for fetching and updating user data
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * User interface representing the structure of user data
 * Matches the API response format from the Users API
 */
interface User {
  login: {
    uuid: string; // Unique identifier for the user
    username: string; // User's login username
  };
  name: {
    title: string; // Title (Mr, Mrs, Ms, etc.)
    first: string; // First name
    last: string; // Last name
  };
  email: string; // User's email address
  location: {
    city: string; // City where user is located
    country: string; // Country where user is located
  };
  dob: {
    age: number; // User's age
  };
}

/**
 * Props for the EditUserModal component
 */
interface EditUserModalProps {
  open: boolean; // Controls whether the modal is visible
  user: User; // The user object to be edited
  onClose: () => void; // Callback function when modal is closed
  onUpdate: (user: User) => void; // Callback function when user is successfully updated
}

/**
 * EditUserModal Component
 * 
 * A modal dialog that allows editing user information including:
 * - First and last name
 * - Email address
 * - City and country
 * 
 * Features:
 * - Form validation (required fields)
 * - API integration with PUT endpoint
 * - Error handling and display
 * - Loading states during save operation
 * - Uses Helvetica font for input fields as per PRD requirements
 * 
 * @param {EditUserModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with user edit form
 */
export default function EditUserModal({
  open,
  user,
  onClose,
  onUpdate,
}: EditUserModalProps) {
  // Local state for form fields - initialized with current user data
  const [firstName, setFirstName] = useState(user.name.first);
  const [lastName, setLastName] = useState(user.name.last);
  const [email, setEmail] = useState(user.email);
  const [city, setCity] = useState(user.location.city);
  const [country, setCountry] = useState(user.location.country);
  
  // UI state management
  const [saving, setSaving] = useState(false); // Tracks whether save operation is in progress
  const [error, setError] = useState<string | null>(null); // Stores error messages if save fails

  /**
   * Handles the save operation when user clicks "Save Changes"
   * 
   * Process:
   * 1. Sets loading state and clears any previous errors
   * 2. Sends PUT request to Users API with updated data
   * 3. On success: updates parent component state and closes modal
   * 4. On failure: displays error message to user
   * 5. Always resets loading state in finally block
   */
  const handleSave = async () => {
    // Start loading state and clear any previous errors
    setSaving(true);
    setError(null);

    try {
      // Send PUT request to update user data
      // Uses user's UUID to identify which user to update
      const response = await fetch(
        `${API_BASE_URL}/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // Only send the fields that can be edited
          body: JSON.stringify({
            name: {
              first: firstName,
              last: lastName,
            },
            email,
            location: {
              city,
              country,
            },
          }),
        }
      );

      // Check if the API request was successful
      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Create updated user object by merging original user data
      // with the updated fields to maintain data integrity
      const updatedUser = {
        ...user,
        name: {
          ...user.name,
          first: firstName,
          last: lastName,
        },
        email,
        location: {
          ...user.location,
          city,
          country,
        },
      };

      // Notify parent component of the update so it can refresh the table
      onUpdate(updatedUser);
      
      // Close the modal after successful save
      onClose();
    } catch (err) {
      // Handle any errors during the save operation
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always reset loading state, whether save succeeded or failed
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px", // Rounded corners for modern look
        },
      }}
    >
      {/* Modal header with title */}
      <DialogTitle
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
        }}
      >
        Edit User
      </DialogTitle>
      
      {/* Modal content area with form fields */}
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Error alert - only displayed if there's an error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* First name and last name fields - side by side */}
          <Stack direction="row" spacing={2}>
            {/* First Name field - required */}
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              InputProps={{
                sx: {
                  // Uses Helvetica font as specified in PRD requirements
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            
            {/* Last Name field - required */}
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              InputProps={{
                sx: {
                  // Uses Helvetica font as specified in PRD requirements
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
          </Stack>

          {/* Email field - full width, required */}
          <TextField
            label="Email"
            type="email" // Provides email validation and appropriate mobile keyboard
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              },
            }}
          />

          {/* City and country fields - side by side */}
          <Stack direction="row" spacing={2}>
            {/* City field - optional */}
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            
            {/* Country field - optional */}
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      
      {/* Modal footer with action buttons */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {/* Cancel button - closes modal without saving */}
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          }}
        >
          Cancel
        </Button>
        
        {/* Save button - submits the form */}
        {/* Disabled when:
            - Save operation is in progress (saving === true)
            - Required fields are empty (!firstName || !lastName || !email)
        */}
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !firstName || !lastName || !email}
          sx={{
            textTransform: "none",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            backgroundColor: "#05070A",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          {/* Button text changes based on saving state */}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
