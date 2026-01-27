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
import { User, usersApi } from "../../services/usersApi";

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [firstName, setFirstName] = React.useState<string>("");
  const [lastName, setLastName] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [city, setCity] = React.useState<string>("");
  const [country, setCountry] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);

  // Populate form when user changes
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first || "");
      setLastName(user.name.last || "");
      setTitle(user.name.title || "");
      setEmail(user.email || "");
      setCity(user.location.city || "");
      setCountry(user.location.country || "");
      setPhone(user.phone || "");
      setError(null);
      setSuccess(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await usersApi.updateUser(user.login.uuid, {
        name: {
          first: firstName,
          last: lastName,
          title: title,
        },
        email: email,
        location: {
          city: city,
          country: country,
        },
        phone: phone,
      });

      setSuccess(true);
      
      // Close modal and refresh data after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
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
      <DialogTitle 
        sx={{ 
          fontWeight: 600,
          fontSize: "20px",
          pb: 2,
        }}
      >
        Edit User
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            User updated successfully!
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
            sx={{
              "& input": {
                fontFamily: "Helvetica, Inter, -apple-system, Roboto, sans-serif",
              },
            }}
          />

          {/* First Name - Using Helvetica font as per PRD */}
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
            size="small"
            sx={{
              "& input": {
                fontFamily: "Helvetica, Inter, -apple-system, Roboto, sans-serif",
                minWidth: "300px",
              },
            }}
          />

          {/* Last Name - Using Helvetica font as per PRD */}
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            fullWidth
            size="small"
            sx={{
              "& input": {
                fontFamily: "Helvetica, Inter, -apple-system, Roboto, sans-serif",
                minWidth: "300px",
              },
            }}
          />

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />

          {/* City */}
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            fullWidth
            size="small"
          />

          {/* Country */}
          <TextField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            fullWidth
            size="small"
          />

          {/* Phone */}
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            backgroundColor: "#05070A",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
