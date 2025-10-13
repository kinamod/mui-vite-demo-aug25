import * as React from "react";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { usersApiService, User, UserUpdateRequest } from "../services/usersApi";

/**
 * Props interface for the EditUserModal component
 *
 * @interface EditUserModalProps
 * @property {boolean} open - Controls the visibility of the modal dialog
 * @property {User | null} user - The user object to be edited, null when no user is selected
 * @property {() => void} onClose - Callback function triggered when the modal should be closed
 * @property {() => void} onUserUpdated - Callback function triggered after a successful user update to refresh parent data
 */
interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

/**
 * EditUserModal Component
 *
 * A modal dialog component that allows users to edit customer information in the CRM system.
 * This component provides a form interface for updating user details such as name, email,
 * and location information. It integrates with the Users API for data persistence.
 *
 * Key Features:
 * - Form validation for required fields (first name, last name)
 * - Real-time error handling and user feedback
 * - Loading states during API operations
 * - Custom styling with specific font requirements for name fields
 * - Responsive layout with proper spacing and alignment
 *
 * @param {EditUserModalProps} props - Component props containing modal state and callbacks
 * @returns {JSX.Element} A Material-UI Dialog component with form fields for user editing
 */
export default function EditUserModal({ open, user, onClose, onUserUpdated }: EditUserModalProps) {
  // Form field state variables - stores the current values of all editable user fields
  const [firstName, setFirstName] = useState(""); // User's first name - required field with Helvetica font
  const [lastName, setLastName] = useState("");   // User's last name - required field with Helvetica font
  const [email, setEmail] = useState("");         // User's email address - optional field
  const [city, setCity] = useState("");           // User's city location - optional field
  const [country, setCountry] = useState("");     // User's country location - optional field

  // UI state management
  const [loading, setLoading] = useState(false);      // Controls loading spinner and disabled states during API calls
  const [error, setError] = useState<string | null>(null); // Stores error messages to display to the user

  /**
   * Effect hook that populates form fields when a user is selected for editing
   *
   * This effect runs whenever the 'user' prop changes and is responsible for:
   * - Populating all form fields with the selected user's current data
   * - Handling cases where user data might be incomplete (using fallback empty strings)
   * - Clearing any existing error messages when a new user is loaded
   * - Ensuring the form is ready for editing with the latest user information
   */
  useEffect(() => {
    if (user) {
      // Populate form fields with user data, using fallback empty strings for missing values
      setFirstName(user.name.first || "");
      setLastName(user.name.last || "");
      setEmail(user.email || "");
      setCity(user.location.city || "");
      setCountry(user.location.country || "");
      // Clear any previous error messages when loading new user data
      setError(null);
    }
  }, [user]);

  /**
   * Handler for closing the modal dialog
   *
   * This function performs cleanup operations before closing:
   * - Clears any error messages to ensure a clean state for next opening
   * - Calls the parent's onClose callback to update the modal visibility state
   */
  const handleClose = () => {
    setError(null);
    onClose();
  };

  /**
   * Handler for saving user changes to the backend
   *
   * This async function manages the complete save operation including:
   * - Form validation for required fields (first name and last name)
   * - Data preparation and sanitization (trimming whitespace)
   * - API communication with proper error handling
   * - UI state management (loading states, error messages)
   * - Success callbacks and modal cleanup
   *
   * The function ensures data integrity by validating required fields before
   * making API calls and provides user feedback throughout the process.
   */
  const handleSave = async () => {
    // Early return if no user is selected (safety check)
    if (!user) return;

    // Validate required fields - first name and last name must not be empty
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    // Start loading state to disable form and show progress indicator
    setLoading(true);
    setError(null);

    try {
      // Prepare update data object with trimmed values to remove unnecessary whitespace
      const updateData: UserUpdateRequest = {
        name: {
          first: firstName.trim(),
          last: lastName.trim(),
        },
        email: email.trim(),
        location: {
          city: city.trim(),
          country: country.trim(),
        },
      };

      // Make API call to update user data using the user's UUID as identifier
      await usersApiService.updateUser(user.login.uuid, updateData);

      // Notify parent component that user has been updated (triggers data refresh)
      onUserUpdated();

      // Close modal on successful update
      handleClose();
    } catch (err) {
      // Handle API errors by displaying user-friendly error messages
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      // Always stop loading state regardless of success or failure
      setLoading(false);
    }
  };

  return (
    /*
     * Main Dialog Component Configuration
     *
     * The dialog is configured with specific styling requirements:
     * - maxWidth="sm" provides appropriate sizing for the form content
     * - fullWidth ensures the dialog utilizes available horizontal space
     * - Custom PaperProps override default Material-UI styling for visual consistency
     * - borderRadius of 10px creates a modern, rounded appearance
     * - minWidth of 500px ensures adequate space for form fields and prevents cramping
     */
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "10px",
          minWidth: '500px',
        }
      }}
    >
      {/*
       * Dialog Title with Custom Typography
       *
       * Styled to match the application's design system:
       * - fontSize: 24px provides prominent header sizing
       * - fontWeight: 600 (semi-bold) ensures good hierarchy
       * - fontFamily: Inter for consistency with the overall application
       * - color: #000 for high contrast and readability
       */}
      <DialogTitle sx={{
        fontSize: '24px',
        fontWeight: 600,
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        color: '#000'
      }}>
        Edit User
      </DialogTitle>
      
      {/*
       * Dialog Content Container
       *
       * Configured with a flexible column layout to accommodate form fields:
       * - display: flex with flexDirection: column creates vertical stacking
       * - gap: 3 provides consistent spacing between form elements (24px)
       * - width: 100% ensures full utilization of dialog width
       * - pt: 2 adds top padding for visual separation from the title
       */}
      <DialogContent sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
        pt: 2
      }}>
        {/*
         * Error Alert Display
         *
         * Conditionally rendered error message that appears at the top of the form
         * when validation fails or API errors occur. Uses Material-UI's Alert
         * component with 'error' severity for appropriate styling and iconography.
         */}
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/*
         * Name Fields Row Container
         *
         * Groups first and last name fields in a horizontal layout using flexbox.
         * The gap property ensures consistent spacing between the two fields.
         * This layout optimizes screen space usage and creates a natural flow
         * for name entry.
         */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/*
           * First Name Input Field
           *
           * IMPORTANT STYLING REQUIREMENTS:
           * - fontFamily: 'Helvetica, Arial, sans-serif' - Specific font requirement for name fields
           * - width/maxWidth: '300px' - Exact width requirement for name input fields
           * - fontSize: '16px' - Standard text size for optimal readability
           *
           * The field includes:
           * - Required validation (shown with asterisk in label)
           * - Disabled state during loading to prevent concurrent edits
           * - Custom styling that overrides Material-UI defaults
           * - Separate font family for label vs input (Inter for label, Helvetica for input)
           */}
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            variant="outlined"
            fullWidth
            required
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'Helvetica, Arial, sans-serif', // PRD requirement: Helvetica for name fields
                fontSize: '16px',
                width: '300px',     // PRD requirement: ~300px width for name fields
                maxWidth: '300px',  // Prevent expansion beyond required width
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif', // Consistent with app theme
              },
            }}
          />

          {/*
           * Last Name Input Field
           *
           * Mirrors the first name field configuration with identical styling requirements.
           * Both name fields must maintain the same visual consistency and meet the
           * specific PRD requirements for font family and field width.
           */}
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            variant="outlined"
            fullWidth
            required
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'Helvetica, Arial, sans-serif', // PRD requirement: Helvetica for name fields
                fontSize: '16px',
                width: '300px',     // PRD requirement: ~300px width for name fields
                maxWidth: '300px',  // Prevent expansion beyond required width
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif', // Consistent with app theme
              },
            }}
          />
        </Box>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          fullWidth
          disabled={loading}
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '16px',
            },
            '& .MuiInputLabel-root': {
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            variant="outlined"
            fullWidth
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '16px',
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              },
            }}
          />
          
          <TextField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            variant="outlined"
            fullWidth
            disabled={loading}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '16px',
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              },
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        pb: 3, 
        px: 3, 
        gap: 2 
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#05070A',
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#0B0E14',
            },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
