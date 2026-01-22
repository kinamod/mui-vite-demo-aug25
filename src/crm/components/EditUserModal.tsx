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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedData: Partial<User> = {
        name: {
          title: user.name.title,
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

      await updateUser(user.login.uuid, updatedData);

      setSuccess(true);

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onUserUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update user",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="edit-user-dialog-title"
    >
      <DialogTitle id="edit-user-dialog-title">Edit User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && (
              <Alert severity="success">User updated successfully!</Alert>
            )}

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

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading}
            />

            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              disabled={loading}
            />

            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
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
