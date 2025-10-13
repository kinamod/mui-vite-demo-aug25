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

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function EditUserModal({ open, user, onClose, onUserUpdated }: EditUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
