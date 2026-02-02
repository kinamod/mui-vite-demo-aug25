import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { User, updateUser } from "../../api/usersApi";

interface EditUserModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [formData, setFormData] = React.useState({
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    city: user.location.city,
    country: user.location.country,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name.first,
        lastName: user.name.last,
        email: user.email,
        city: user.location.city,
        country: user.location.country,
      });
    }
  }, [user]);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const updateData: Partial<User> = {
        name: {
          ...user.name,
          first: formData.firstName,
          last: formData.lastName,
        },
        email: formData.email,
        location: {
          ...user.location,
          city: formData.city,
          country: formData.country,
        },
      };

      await updateUser(user.login.uuid, updateData);
      onUserUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
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
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "20px",
          pb: 1,
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
          }}
        >
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: "300px",
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
            value={formData.lastName}
            onChange={handleChange("lastName")}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: "300px",
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
            value={formData.email}
            onChange={handleChange("email")}
            fullWidth
            required
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={handleChange("city")}
            fullWidth
          />
          <TextField
            label="Country"
            value={formData.country}
            onChange={handleChange("country")}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
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
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
