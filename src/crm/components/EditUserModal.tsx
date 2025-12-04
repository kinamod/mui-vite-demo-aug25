import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { User } from "../services/usersApi";

/**
 * Props interface for the EditUserModal component
 * Defines the contract for controlling the modal's behavior and data
 */
interface EditUserModalProps {
  /** Controls whether the modal is visible or hidden */
  open: boolean;
  /** The user object to edit, or null if no user is selected */
  user: User | null;
  /** Callback function triggered when the modal should close */
  onClose: () => void;
  /** Callback function triggered when the user clicks Save, receives userId and updated names */
  onSave: (userId: string, firstName: string, lastName: string) => void;
}

/**
 * EditUserModal Component
 *
 * A modal dialog for editing user information. Currently supports editing
 * first and last names. Per PRD requirements:
 * - Uses Helvetica font for name input fields
 * - Input fields are wide enough to display most names on a single line (~300px)
 * - Provides Save and Cancel actions
 *
 * @param props - EditUserModalProps containing modal state and callbacks
 */
export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  // Local state for managing form inputs
  // These are controlled components that sync with the user prop via useEffect
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  /**
   * Synchronize form fields with the selected user
   * When a new user is selected, populate the form with their current data
   */
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
    }
  }, [user]);

  /**
   * Handle the Save button click
   * Validates that a user is selected, then calls the parent's onSave callback
   * with the user's UUID and the updated name values
   */
  const handleSave = () => {
    if (user) {
      onSave(user.login.uuid, firstName, lastName);
    }
  };

  // Guard clause: don't render anything if no user is selected
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Modal header with title */}
      <DialogTitle>Edit User</DialogTitle>

      {/* Main content area containing the form fields */}
      <DialogContent>
        {/*
          First Name input field
          - Uses Helvetica font as specified in PRD section 3.1.4
          - Has minWidth of 300px to display most names on a single line
          - AutoFocus for better UX when modal opens
        */}
        <TextField
          autoFocus
          margin="dense"
          label="First Name"
          type="text"
          fullWidth
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={{
            mb: 2,
            mt: 1,
            "& input": {
              fontFamily: "Helvetica, Arial, sans-serif",
              minWidth: "300px",
            },
          }}
        />

        {/*
          Last Name input field
          - Uses Helvetica font as specified in PRD section 3.1.4
          - Has minWidth of 300px to display most names on a single line
        */}
        <TextField
          margin="dense"
          label="Last Name"
          type="text"
          fullWidth
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={{
            "& input": {
              fontFamily: "Helvetica, Arial, sans-serif",
              minWidth: "300px",
            },
          }}
        />
      </DialogContent>

      {/* Action buttons: Cancel and Save */}
      <DialogActions>
        {/* Cancel button - closes modal without saving */}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        {/* Save button - triggers the save callback with updated data */}
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
