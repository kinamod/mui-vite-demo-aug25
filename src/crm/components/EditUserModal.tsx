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

/**
 * User interface representing the structure of user data from the Users API
 * This matches the API response structure from https://user-api.builder-io.workers.dev/api/users
 */
interface User {
  login: {
    uuid: string; // Unique identifier used for API operations
    username: string;
  };
  name: {
    title: string; // Mr, Mrs, Ms, etc.
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  dob: {
    age: number; // Calculated age from date of birth
  };
}

/**
 * Props for the EditUserModal component
 */
interface EditUserModalProps {
  open: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal should close
  user: User | null; // The user being edited, null if no user selected
  onUserUpdated: () => void; // Callback to refresh data after successful update
}

/**
 * EditUserModal Component
 * 
 * A modal dialog for editing user information (first and last name).
 * Per PRD requirements:
 * - Name fields use Helvetica font
 * - Input fields are ~300px wide to accommodate typical names
 * - Provides feedback for success/error states
 * - Integrates with Users API for updates
 * 
 * @param {EditUserModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog for editing user
 */
export default function EditUserModal({
  open,
  onClose,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  // Form field states - separated for granular control and validation
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  
  // UI state management
  const [loading, setLoading] = React.useState(false); // Tracks API call in progress
  const [error, setError] = React.useState<string | null>(null); // Stores error messages for display
  const [success, setSuccess] = React.useState(false); // Indicates successful save operation

  /**
   * Effect: Populate form fields when user prop changes
   * 
   * When a new user is selected for editing, this effect:
   * 1. Populates the form fields with the user's current data
   * 2. Clears any previous error or success messages
   * 
   * This ensures each edit session starts with a clean state
   */
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
      // Clear any previous alerts when opening modal with new user
      setError(null);
      setSuccess(false);
    }
  }, [user]);

  /**
   * Handles the save operation when user clicks the Save button
   * 
   * Process flow:
   * 1. Validates user exists (safety check)
   * 2. Sets loading state and clears previous alerts
   * 3. Makes PUT request to Users API with updated name data
   * 4. On success: Shows success message, triggers data refresh, auto-closes after 1s
   * 5. On error: Displays error message to user
   * 6. Always: Clears loading state when complete
   * 
   * API Endpoint: PUT /api/users/{uuid}
   * Only sends name fields as per PRD scope (not email, location, etc.)
   */
  const handleSave = async () => {
    // Guard clause: Ensure user exists before attempting save
    if (!user) return;

    // Set loading state to disable form and show progress indicator
    setLoading(true);
    
    // Clear any previous error or success messages to provide clean feedback for this operation
    setError(null);
    setSuccess(false);

    try {
      // Make PUT request to update user via Users API
      // Using user.login.uuid as the identifier for the specific user record
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // Only send name fields as per PRD - other fields remain unchanged
          body: JSON.stringify({
            name: {
              first: firstName,
              last: lastName,
            },
          }),
        }
      );

      // Check if API returned an error status
      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update was successful - show success message
      setSuccess(true);
      
      // Notify parent component to refresh the user list
      // This ensures the table shows the updated data
      onUserUpdated();

      // Auto-close modal after 1 second to let user see success message
      // Using setTimeout allows user to see confirmation before modal disappears
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      // Handle any errors during the API call
      // Display user-friendly error message in the modal
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always clear loading state, whether success or failure
      // This re-enables the form and hides the progress indicator
      setLoading(false);
    }
  };

  /**
   * Handles modal close requests
   * 
   * Prevents closing the modal while a save operation is in progress
   * to avoid data inconsistency and user confusion
   */
  const handleClose = () => {
    // Only allow closing if not currently saving
    // This prevents accidental data loss during API operations
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Error Alert - Only shown when error state is not null */}
          {error && <Alert severity="error">{error}</Alert>}
          
          {/* Success Alert - Only shown after successful save */}
          {success && (
            <Alert severity="success">User updated successfully!</Alert>
          )}
          
          {/* First Name Input Field
              - Uses Helvetica font per PRD requirement
              - Minimum 300px width to accommodate typical names per PRD
              - Disabled during loading to prevent edits during save
          */}
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            disabled={loading}
            inputProps={{
              // Helvetica font family as specified in PRD section 3.1.4
              style: { fontFamily: "Helvetica, Arial, sans-serif" },
            }}
            sx={{ minWidth: "300px" }} // Per PRD: wide enough for typical names
          />
          
          {/* Last Name Input Field
              - Same styling and behavior as First Name
              - Separated to allow independent validation if needed in future
          */}
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            disabled={loading}
            inputProps={{
              // Helvetica font family as specified in PRD section 3.1.4
              style: { fontFamily: "Helvetica, Arial, sans-serif" },
            }}
            sx={{ minWidth: "300px" }} // Per PRD: wide enough for typical names
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {/* Cancel Button - Disabled during save to prevent modal closure during API call */}
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        
        {/* Save Button
            - Shows loading spinner during save operation
            - Disabled when:
              1. Save is in progress (loading)
              2. First name is empty or only whitespace
              3. Last name is empty or only whitespace
            This prevents saving invalid or incomplete data
        */}
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !firstName.trim() || !lastName.trim()}
        >
          {/* Show spinner during save, otherwise show "Save" text */}
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
