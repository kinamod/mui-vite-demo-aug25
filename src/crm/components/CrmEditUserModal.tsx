/**
 * CrmEditUserModal Component
 * 
 * Modal dialog for editing user information.
 * Implements PRD requirements:
 * - Uses Helvetica font for name fields (as specified in PRD)
 * - Name fields are wide enough to display typical names (~300px)
 * - Provides validation and error handling
 * - Updates user data via PUT request to Users API
 */

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

/**
 * User interface matching the Users API structure
 * Same as in CrmUsersTable for consistency
 */
interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  dob: {
    age: number;
  };
}

/**
 * Props for the CrmEditUserModal component
 */
interface CrmEditUserModalProps {
  user: User; // The user object being edited
  open: boolean; // Whether the modal is visible
  onClose: () => void; // Callback when modal is closed without saving
  onUserUpdated: (user: User) => void; // Callback when user is successfully updated
}

/**
 * API base URL - uses Vite proxy to avoid CORS issues
 * Proxied from https://user-api.builder-io.workers.dev/api
 */
const API_BASE_URL = "/api";

export default function CrmEditUserModal({
  user,
  open,
  onClose,
  onUserUpdated,
}: CrmEditUserModalProps) {
  // Form state - separate state for each editable field
  const [firstName, setFirstName] = React.useState(user.name.first);
  const [lastName, setLastName] = React.useState(user.name.last);
  const [email, setEmail] = React.useState(user.email);
  const [city, setCity] = React.useState(user.location.city);
  const [country, setCountry] = React.useState(user.location.country);
  
  // UI state
  const [loading, setLoading] = React.useState(false); // Loading state during API call
  const [error, setError] = React.useState<string | null>(null); // Error message if update fails

  /**
   * Reset form fields when the user prop changes
   * Ensures the form displays the correct user data when modal opens
   */
  React.useEffect(() => {
    setFirstName(user.name.first);
    setLastName(user.name.last);
    setEmail(user.email);
    setCity(user.location.city);
    setCountry(user.location.country);
    setError(null);
  }, [user]);

  /**
   * Handles form submission and API update
   * 
   * Process:
   * 1. Sends PUT request to update user data
   * 2. On success: creates updated user object and calls onUserUpdated
   * 3. On error: displays error message
   * 
   * Note: Only sends fields that can be edited, preserves unchanged fields
   */
  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send PUT request to update user
      const response = await fetch(
        `${API_BASE_URL}/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: firstName,
              last: lastName,
              title: user.name.title, // Preserve existing title
            },
            email: email,
            location: {
              city: city,
              country: country,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Create updated user object with new values
      const updatedUser: User = {
        ...user,
        name: {
          ...user.name,
          first: firstName,
          last: lastName,
        },
        email: email,
        location: {
          ...user.location,
          city: city,
          country: country,
        },
      };

      // Notify parent component of successful update
      onUserUpdated(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
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
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle sx={{ fontSize: "20px", fontWeight: 600 }}>
        Edit User
      </DialogTitle>
      <DialogContent>
        {/* Error Alert - displays if update fails */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* First and Last Name - side by side layout */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* 
              First Name Field
              Uses Helvetica font as required by PRD
              Minimum width of 300px to display most names on single line
            */}
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
            {/* 
              Last Name Field
              Uses Helvetica font as required by PRD
              Minimum width of 300px to display most names on single line
            */}
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
          </Box>
          {/* Email Field - full width */}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          {/* City and Country - side by side layout */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
            />
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {/* Cancel Button - closes modal without saving */}
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {/* 
          Save Button - submits form and updates user
          Disabled if required fields are empty or during loading
        */}
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !firstName || !lastName || !email}
        >
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
