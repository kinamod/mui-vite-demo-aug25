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

  useEffect(() => {
    if (user) {
      setFirstName(user.name.first || "");
      setLastName(user.name.last || "");
      setEmail(user.email || "");
      setCity(user.location.city || "");
      setCountry(user.location.country || "");
      setError(null);
    }
  }, [user]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!user) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      await usersApiService.updateUser(user.login.uuid, updateData);
      onUserUpdated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
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
          borderRadius: "10px",
          minWidth: '500px',
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: '24px',
        fontWeight: 600,
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        color: '#000'
      }}>
        Edit User
      </DialogTitle>
      
      <DialogContent sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 3, 
        width: "100%",
        pt: 2
      }}>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
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
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '16px',
                width: '300px',
                maxWidth: '300px',
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              },
            }}
          />
          
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
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '16px',
                width: '300px',
                maxWidth: '300px',
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
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
