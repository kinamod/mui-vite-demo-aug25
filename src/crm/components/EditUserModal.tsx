/**
 * EditUserModal Component
 *
 * A modal dialog for editing user information.
 * Features:
 * - Editable fields for first name, last name, and email
 * - Uses Helvetica font as specified in PRD
 * - Field width ~300px to accommodate typical names
 * - PUT request to Users API for updates
 * - Error handling and loading states
 * - Form validation
 *
 * @see PRD Section 3.1.4: Edit User Modal
 */
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Base URL for the Users API
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * Interface representing a user's location information
 */
interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string | number;
}

/**
 * Interface representing a user's name
 * Used for displaying and editing first/last names
 */
interface UserName {
  title: string;
  first: string;
  last: string;
}

/**
 * Complete User interface matching API structure
 */
interface User {
  login: {
    uuid: string; // Used as identifier for API updates
    username: string;
  };
  name: UserName;
  email: string;
  location: UserLocation;
  dob: {
    date: string;
    age: number;
  };
  gender: string;
}

/**
 * Props for the EditUserModal component
 */
interface EditUserModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** The user to edit (null when modal is closed) */
  user: User | null;
  /** Callback fired when modal should close */
  onClose: () => void;
  /** Callback fired when user is successfully updated */
  onUserUpdated: (user: User) => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  /** Controlled input for user's first name */
  const [firstName, setFirstName] = React.useState("");

  /** Controlled input for user's last name */
  const [lastName, setLastName] = React.useState("");

  /** Controlled input for user's email address */
  const [email, setEmail] = React.useState("");

  /** Loading state during API update request */
  const [saving, setSaving] = React.useState(false);

  /** Error message if save operation fails */
  const [error, setError] = React.useState<string | null>(null);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Effect: Populate form fields when user prop changes
   * Resets form with user data when modal opens with a new user
   */
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
      setEmail(user.email);
      setError(null); // Clear any previous errors
    }
  }, [user]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles save button click
   * Sends PUT request to Users API to update user information
   */
  const handleSave = async () => {
    if (!user) return; // Guard clause: no user selected

    try {
      setSaving(true);
      setError(null);

      // Make PUT request to update user
      const response = await fetch(`${API_BASE_URL}/users/${user.login.uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: {
            first: firstName,
            last: lastName,
          },
          email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      // Create updated user object with new values
      const updatedUser: User = {
        ...user,
        name: {
          ...user.name,
          first: firstName,
          last: lastName,
        },
        email,
      };

      // Notify parent component of successful update
      onUserUpdated(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles modal close
   * Prevents closing while save operation is in progress
   */
  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
        Edit User
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: 300,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
              },
            }}
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: 300,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
              },
            }}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: 300,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !firstName || !lastName || !email}
          sx={{
            backgroundColor: "#05070A",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          {saving ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
