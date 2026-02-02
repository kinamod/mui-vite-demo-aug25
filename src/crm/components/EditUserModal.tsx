/**
 * EditUserModal Component
 *
 * A modal dialog for editing user information.
 * Implements PRD requirements:
 * - Uses Helvetica font for name fields (as specified in PRD section 3.1.4)
 * - Name input fields are wide enough for typical names (~300px minimum)
 * - Provides editing capability for key user fields
 * - Handles API updates and error states
 *
 * Props:
 * @param open - Controls modal visibility
 * @param user - The user object being edited
 * @param onClose - Callback when modal is closed without saving
 * @param onUserUpdated - Callback after successful user update
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
import { User, updateUser } from "../../api/usersApi";

/**
 * Props interface for EditUserModal component
 */
interface EditUserModalProps {
  /** Controls whether the modal is visible */
  open: boolean;
  /** The user object to edit */
  user: User;
  /** Callback when user closes modal without saving */
  onClose: () => void;
  /** Callback after successful user update (triggers data refresh) */
  onUserUpdated: () => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  /**
   * Form data state
   * Stores the editable fields separately from the user object
   * This allows us to track changes before submitting
   */
  const [formData, setFormData] = React.useState({
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    city: user.location.city,
    country: user.location.country,
  });

  /** Loading state during API update */
  const [loading, setLoading] = React.useState(false);

  /** Error message state for displaying API errors */
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Sync form data when user prop changes
   * This ensures the form displays the correct data when editing different users
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
    }
  }, [user]);

  /**
   * Creates a change handler for a specific form field
   * Uses currying pattern to create field-specific handlers
   *
   * @param field - The form field name to update
   * @returns Event handler function for that field
   *
   * Usage: onChange={handleChange("firstName")}
   */
  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  /**
   * Handles form submission and user update
   *
   * Process:
   * 1. Sets loading state and clears previous errors
   * 2. Constructs update payload preserving nested structure
   * 3. Calls updateUser API with user UUID
   * 4. On success: Triggers onUserUpdated callback (closes modal and refreshes data)
   * 5. On error: Displays error message to user
   *
   * Note: We preserve the full nested structure (name, location)
   * to maintain data integrity with the API
   */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct the update payload with proper nested structure
      // Preserves unchanged fields like title, coordinates, etc.
      const updateData: Partial<User> = {
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
      };

      // Call Users API to update user by UUID
      await updateUser(user.login.uuid, updateData);

      // Notify parent component of successful update
      onUserUpdated();
    } catch (err) {
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always clear loading state
      setLoading(false);
    }
  };

  return (
    /* Modal dialog container
       - maxWidth="sm" provides appropriate width for form
       - fullWidth ensures consistent sizing
       - 8px border radius for modern look */
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
      {/* Modal title
          - 20px font size with 600 weight
          - Reduced bottom padding for compact header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "20px",
          pb: 1,
        }}
      >
        Edit User
      </DialogTitle>

      <DialogContent>
        {/* Error alert - shown when API update fails */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form fields container
            - Vertical layout with consistent spacing
            - 16px gap between fields */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
          }}
        >
          {/* First Name field
              - IMPORTANT: Uses Helvetica font (PRD requirement 3.1.4)
              - Minimum 300px width to accommodate most names
              - Required field validation */}
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: "300px",
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
              },
            }}
          />

          {/* Last Name field
              - IMPORTANT: Uses Helvetica font (PRD requirement 3.1.4)
              - Minimum 300px width to accommodate most names
              - Required field validation */}
          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: "300px",
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
              },
            }}
          />

          {/* Email field
              - Type="email" provides browser validation
              - Required field */}
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            fullWidth
            required
          />

          {/* City field - optional */}
          <TextField
            label="City"
            value={formData.city}
            onChange={handleChange("city")}
            fullWidth
          />

          {/* Country field - optional */}
          <TextField
            label="Country"
            value={formData.country}
            onChange={handleChange("country")}
            fullWidth
          />
        </Box>
      </DialogContent>

      {/* Action buttons
          - Cancel: Closes modal without saving
          - Save: Submits form and updates user
          - Both disabled during loading to prevent multiple submissions */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            backgroundColor: "#05070A",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          {/* Show spinner during save, otherwise "Save" text */}
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
