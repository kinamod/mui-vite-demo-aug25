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

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  dob: {
    age: number;
  };
}

interface CrmEditUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

const API_BASE_URL = "/api";

export default function CrmEditUserModal({
  user,
  open,
  onClose,
  onUserUpdated,
}: CrmEditUserModalProps) {
  const [firstName, setFirstName] = React.useState(user.name.first);
  const [lastName, setLastName] = React.useState(user.name.last);
  const [email, setEmail] = React.useState(user.email);
  const [city, setCity] = React.useState(user.location.city);
  const [country, setCountry] = React.useState(user.location.country);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFirstName(user.name.first);
    setLastName(user.name.last);
    setEmail(user.email);
    setCity(user.location.city);
    setCountry(user.location.country);
    setError(null);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: firstName,
              last: lastName,
              title: user.name.title,
            },
            email: email,
            location: {
              city: city,
              country: country,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser: User = {
        ...user,
        name: {
          ...user.name,
          first: firstName,
          last: lastName,
        },
        email: email,
        location: {
          ...user.location,
          city: city,
          country: country,
        },
      };

      onUserUpdated(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
      <DialogTitle sx={{ fontSize: "20px", fontWeight: 600 }}>
        Edit User
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
          </Box>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
            />
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !firstName || !lastName || !email}
        >
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
