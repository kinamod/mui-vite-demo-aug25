/**
 * EditUserModal Component
 *
 * A modal dialog for editing user information. Implements the PRD requirements
 * including Helvetica font for name fields and proper field width (~300px).
 * Provides form validation, error handling, and API integration.
 */

import * as React from "react";
// MUI Dialog components for modal functionality
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
// Form and UI components
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

/**
 * User interface matching the Users API response structure
 * Contains all user properties from the external API
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
  };
  dob: {
    date: string;
    age: number;
  };
}

/**
 * Props for the EditUserModal component
 */
interface EditUserModalProps {
  /** Controls whether the modal is open or closed */
  open: boolean;
  /** Callback function called when the modal should be closed */
  onClose: () => void;
  /** The user object to edit, null when no user is selected */
  user: User | null;
  /** Callback function to save user changes, returns a Promise */
  onSave: (updatedUser: Partial<User>) => Promise<void>;
}

export default function EditUserModal({
  open,
  onClose,
  user,
  onSave,
}: EditUserModalProps) {
  // Loading state for save operation
  const [loading, setLoading] = React.useState(false);
  // Error state for displaying API errors to user
  const [error, setError] = React.useState<string | null>(null);
  // Form data state - simplified structure for easier form handling
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  /**
   * Effect to populate form data when a user is selected
   * Resets error state and fills form with current user data
   */
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name.first,
        lastName: user.name.last,
        email: user.email,
        city: user.location.city,
        country: user.location.country,
      });
      // Clear any previous errors when loading new user
      setError(null);
    }
  }, [user]);

  /**
   * Higher-order function that returns a change handler for specific form fields
   * This pattern allows for cleaner event handling with field-specific updates
   */
  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  /**
   * Handles form submission and user update
   * Validates required fields, calls the onSave callback, and handles errors
   */
  const handleSubmit = async () => {
    // Early return if no user is selected
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Transform form data back to User API structure
      // Preserves existing nested structure while updating only changed fields
      await onSave({
        name: {
          ...user.name,
          first: formData.firstName,
          last: formData.lastName,
        },
        email: formData.email,
        location: {
          ...user.location,
          city: formData.city,
          country: formData.country,
        },
      });
      // Close modal on successful save
      onClose();
    } catch (err) {
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                required
                sx={{
                  "& input": {
                    fontFamily: "Helvetica, Arial, sans-serif",
                    minWidth: "300px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                required
                sx={{
                  "& input": {
                    fontFamily: "Helvetica, Arial, sans-serif",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange("city")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleChange("country")}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
