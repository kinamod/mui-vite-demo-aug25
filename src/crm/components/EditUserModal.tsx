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
import Stack from "@mui/material/Stack";
import { User, updateUser } from "../services/usersApi";

/**
 * Props interface for the EditUserModal component
 *
 * @interface EditUserModalProps
 * @property {boolean} open - Controls the visibility of the modal dialog
 * @property {function} onClose - Callback function invoked when the modal should be closed
 * @property {User | null} user - The user object to be edited. Null if no user is selected.
 * @property {function} onUserUpdated - Callback function invoked after a user is successfully updated
 */
interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

/**
 * EditUserModal Component
 *
 * A modal dialog component for editing user information. Displays a form with
 * editable fields for the user's first name, last name, email, city, and country.
 *
 * Features:
 * - Form validation (required fields for name and email)
 * - Loading state during API calls
 * - Error and success message display
 * - Automatic form population when user prop changes
 * - Name fields use Helvetica font as per PRD requirements
 * - Auto-closes modal after successful update
 *
 * @component
 * @param {EditUserModalProps} props - Component props
 * @returns {JSX.Element | null} The modal component or null if no user is selected
 */
export default function EditUserModal({
  open,
  onClose,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  // Loading state to disable form during API calls
  const [loading, setLoading] = React.useState(false);

  // Error state to display error messages from failed API calls
  const [error, setError] = React.useState<string | null>(null);

  // Success state to display success message after user update
  const [success, setSuccess] = React.useState(false);

  // Form state - stores the editable user information
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");

  /**
   * Effect: Initialize form fields when user prop changes
   *
   * Populates the form fields with the current user's data whenever
   * a new user is selected for editing. This ensures the form always
   * displays the most up-to-date user information.
   */
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first || "");
      setLastName(user.name.last || "");
      setEmail(user.email || "");
      setCity(user.location.city || "");
      setCountry(user.location.country || "");
    }
  }, [user]);

  /**
   * Effect: Reset error and success states when modal closes
   *
   * Clears any error or success messages when the modal is closed
   * to ensure a clean state when the modal is reopened.
   */
  React.useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  /**
   * Handles form submission for updating user information
   *
   * Process:
   * 1. Prevents default form submission behavior
   * 2. Validates that a user is selected
   * 3. Sets loading state and clears previous errors/success messages
   * 4. Constructs updated user data object with form values
   * 5. Calls the updateUser API function
   * 6. On success: displays success message and closes modal after 1 second
   * 7. On error: displays error message
   * 8. Finally: clears loading state
   *
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission that would reload the page
    e.preventDefault();

    // Safety check: ensure a user is selected
    if (!user) return;

    // Set loading state and reset error/success states
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Construct the updated user data object
      // Only includes fields that can be edited in this form
      const updatedData: Partial<User> = {
        name: {
          title: user.name.title, // Preserve the original title
          first: firstName,
          last: lastName,
        },
        email,
        location: {
          ...user.location, // Preserve other location fields (street, postcode, etc.)
          city,
          country,
        },
      };

      // Call the API to update the user
      await updateUser(user.login.uuid, updatedData);

      // Show success message
      setSuccess(true);

      // Close modal after a short delay to allow user to see the success message
      setTimeout(() => {
        onUserUpdated(); // Notify parent component to refresh user list
        onClose(); // Close the modal
      }, 1000);
    } catch (err) {
      // Display error message if the update fails
      setError(
        err instanceof Error ? err.message : "Failed to update user",
      );
    } finally {
      // Always clear loading state, whether successful or not
      setLoading(false);
    }
  };

  // Don't render the modal if no user is selected
  if (!user) return null;

  // Render the modal dialog with form
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="edit-user-dialog-title"
    >
      {/* Modal title */}
      <DialogTitle id="edit-user-dialog-title">Edit User</DialogTitle>

      {/* Form wrapped around dialog content for proper submission handling */}
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Stack component for vertical spacing between form elements */}
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Error alert - only shown when there's an error */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Success alert - only shown after successful update */}
            {success && (
              <Alert severity="success">User updated successfully!</Alert>
            )}

            {/*
              First Name field
              - Required field as per PRD
              - Uses Helvetica font as specified in PRD section 3.1.4
              - Minimum width of 300px to display most names on a single line
            */}
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              disabled={loading}
              inputProps={{
                style: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  minWidth: "300px",
                },
              }}
            />

            {/*
              Last Name field
              - Required field as per PRD
              - Uses Helvetica font as specified in PRD section 3.1.4
              - Minimum width of 300px to display most names on a single line
            */}
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
              disabled={loading}
              inputProps={{
                style: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  minWidth: "300px",
                },
              }}
            />

            {/*
              Email field
              - Required field as per PRD
              - Type="email" provides browser-level validation
            */}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading}
            />

            {/* City field - Optional field */}
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              disabled={loading}
            />

            {/* Country field - Optional field */}
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              disabled={loading}
            />
          </Stack>
        </DialogContent>

        {/* Dialog action buttons - Cancel and Save */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {/* Cancel button - closes modal without saving */}
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          {/*
            Save button
            - Submits the form (type="submit")
            - Shows loading spinner when API call is in progress
            - Disabled during loading to prevent duplicate submissions
          */}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
