/**
 * EditUserModal Component
 *
 * A modal dialog for editing user information in the Customer Dashboard.
 * This component allows users to update customer details including name, email, and location.
 *
 * Features:
 * - Editable fields for first name, last name, email, and city
 * - Real-time validation (prevents saving if required fields are empty)
 * - Loading states during API calls
 * - Error handling with user-friendly error messages
 * - Uses Helvetica font for name fields as per PRD requirements
 * - Field width optimized for typical name lengths (~300px for first name)
 */
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { User, updateUser } from '../../api/usersApi';

/**
 * Props for the EditUserModal component
 */
interface EditUserModalProps {
  /** Controls whether the modal is visible */
  open: boolean;
  /** The user object to edit, or null if no user is selected */
  user: User | null;
  /** Callback function invoked when the modal should be closed */
  onClose: () => void;
  /** Callback function invoked when user data is successfully saved */
  onSave: (updatedUser: User) => void;
}

/**
 * EditUserModal - A dialog component for editing customer information
 *
 * This component provides a form interface for updating user details.
 * It communicates with the Users API to persist changes and provides
 * feedback to the user during the save operation.
 *
 * @param {EditUserModalProps} props - Component props
 * @returns {JSX.Element} The rendered modal dialog
 */
export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  // Form field states - track the current values of each editable field
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [city, setCity] = React.useState('');

  // UI state management
  const [loading, setLoading] = React.useState(false); // Tracks API call in progress
  const [error, setError] = React.useState<string | null>(null); // Stores error messages for display

  /**
   * Effect: Populate form fields when user data changes
   *
   * This effect runs whenever the modal opens or the user object changes.
   * It initializes the form fields with the current user's data and clears
   * any previous error messages.
   */
  React.useEffect(() => {
    if (user) {
      // Populate form fields with current user data
      setFirstName(user.name.first);
      setLastName(user.name.last);
      setEmail(user.email);
      setCity(user.location.city);

      // Clear any previous error messages when loading new user data
      setError(null);
    }
  }, [user, open]);

  /**
   * Handles the save operation for user updates
   *
   * This async function performs the following steps:
   * 1. Validates that a user is selected
   * 2. Constructs the update payload with modified fields
   * 3. Calls the Users API to persist changes
   * 4. Updates the local state with the new user data
   * 5. Notifies the parent component of the successful save
   * 6. Handles any errors that occur during the process
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    // Guard clause: ensure a user is selected before attempting to save
    if (!user) return;

    // Set loading state and clear any previous errors
    setLoading(true);
    setError(null);

    try {
      // Construct the update payload
      // Note: We preserve the user's title and other location data that aren't editable
      const updateData = {
        name: {
          first: firstName,
          last: lastName,
          title: user.name.title, // Preserve existing title
        },
        email,
        location: {
          ...user.location, // Preserve all other location fields (coordinates, timezone, etc.)
          city, // Only update the city field
        },
      };

      // Call the Users API to persist the changes
      await updateUser(user.login.uuid, updateData);

      // Construct the updated user object for local state management
      // This ensures the UI updates immediately without needing to refetch
      const updatedUser: User = {
        ...user,
        name: updateData.name,
        email: updateData.email,
        location: updateData.location,
      };

      // Notify parent component of successful save
      onSave(updatedUser);

      // Close the modal
      onClose();
    } catch (err) {
      // Handle any errors that occur during the API call
      // Display a user-friendly error message
      setError(
        err instanceof Error ? err.message : 'Failed to update user'
      );
    } finally {
      // Always reset loading state, regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'Helvetica, Arial, sans-serif',
                minWidth: '300px',
              },
            }}
          />

          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'Helvetica, Arial, sans-serif',
              },
            }}
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
          />

          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !firstName || !lastName}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
