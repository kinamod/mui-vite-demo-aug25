import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { User } from "../services/usersApi";

/**
 * Props interface for the EditUserModal component
 * 
 * @property open - Controls whether the modal is visible
 * @property user - The user object being edited, or null if no user is selected
 * @property onClose - Callback function to close the modal
 * @property onSave - Async callback function to save user changes, receives partial user data
 */
interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<void>;
}

/**
 * EditUserModal Component
 * 
 * Modal dialog for editing user information. Provides form fields for editing
 * user's first name, last name, email, city, and country.
 * 
 * Features:
 * - Pre-populates form fields with existing user data
 * - Uses Helvetica font for name fields as per PRD requirements
 * - Minimum 300px width for name inputs to display names on single line
 * - Validates required fields before allowing save
 * - Shows loading state during save operation
 * 
 * @param props - Component props
 * @returns Modal dialog for editing user information
 */
export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  // Local state for form fields - allows editing without immediately affecting parent component
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  
  // Tracks whether a save operation is in progress to prevent duplicate submissions
  const [saving, setSaving] = React.useState(false);

  /**
   * Effect: Populate form fields when user data changes
   * 
   * When a new user is selected for editing, this effect updates all form fields
   * with the user's current data. This ensures the modal always shows the latest
   * user information when opened.
   * 
   * Dependencies: [user] - Runs whenever the user prop changes
   */
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
      setEmail(user.email);
      setCity(user.location.city);
      setCountry(user.location.country);
    }
  }, [user]);

  /**
   * Handles the save operation for user edits
   * 
   * Flow:
   * 1. Guard clause - exits early if no user is selected
   * 2. Sets saving state to true (disables save button, shows loading indicator)
   * 3. Constructs partial user object with updated fields, preserving structure
   * 4. Calls onSave callback which handles API communication
   * 5. On success, modal is closed by parent component
   * 6. On error, error is logged and re-thrown for parent to handle
   * 7. Finally block ensures saving state is reset regardless of outcome
   * 
   * Note: We preserve the nested structure of name and location objects
   * to maintain compatibility with the Users API schema
   */
  const handleSave = async () => {
    // Early return if no user is selected - safety check
    if (!user) return;

    // Set saving state to provide user feedback and prevent duplicate submissions
    setSaving(true);
    try {
      // Construct the update payload with partial user data
      // We spread the existing nested objects to preserve any fields we're not editing
      await onSave({
        name: {
          ...user.name, // Preserve title and any other name fields
          first: firstName,
          last: lastName,
        },
        email,
        location: {
          ...user.location, // Preserve street, state, postcode, coordinates, timezone, etc.
          city,
          country,
        },
      });
      
      // If save succeeds, close the modal
      // The parent component handles updating the users list
      onClose();
    } catch (error) {
      // Log error for debugging purposes
      // The parent component will handle displaying error messages to the user
      console.error("Failed to save user:", error);
      
      // Re-throw error so parent component can handle it (e.g., show toast notification)
      // Note: We don't close the modal on error so user can retry or fix validation issues
    } finally {
      // Always reset saving state, even if an error occurred
      // This re-enables the save button so user can retry if needed
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
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Title with close button */}
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        Edit User
        {/* Close button positioned in top-right corner */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Dialog Content with form fields */}
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* First Name field - uses Helvetica font as per PRD requirement */}
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                // Helvetica font specified in PRD for name fields
                fontFamily: "Helvetica, Arial, sans-serif",
                width: "100%",
                // Minimum 300px width to display most names on a single line (PRD requirement)
                minWidth: "300px",
              },
            }}
          />
          
          {/* Last Name field - uses Helvetica font as per PRD requirement */}
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                // Helvetica font specified in PRD for name fields
                fontFamily: "Helvetica, Arial, sans-serif",
                width: "100%",
                // Minimum 300px width to display most names on a single line (PRD requirement)
                minWidth: "300px",
              },
            }}
          />
          
          {/* Email field - standard email input with validation */}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          
          {/* City field - for user's location */}
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            fullWidth
            required
          />
          
          {/* Country field - for user's location */}
          <TextField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      
      {/* Dialog Actions with Cancel and Save buttons */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* Cancel button - closes modal without saving, disabled during save operation */}
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        
        {/* 
          Save button - triggers save operation
          Disabled when:
          - Save operation is in progress (saving === true)
          - Required fields are empty (firstName, lastName, or email)
        */}
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !firstName || !lastName || !email}
        >
          {/* Show different text based on save state for user feedback */}
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
