import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import Alert from "@mui/material/Alert";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

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

interface EditUserModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onUpdate,
}: EditUserModalProps) {
  const [firstName, setFirstName] = useState(user.name.first);
  const [lastName, setLastName] = useState(user.name.last);
  const [email, setEmail] = useState(user.email);
  const [city, setCity] = useState(user.location.city);
  const [country, setCountry] = useState(user.location.country);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
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
            },
            email,
            location: {
              city,
              country,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = {
        ...user,
        name: {
          ...user.name,
          first: firstName,
          last: lastName,
        },
        email,
        location: {
          ...user.location,
          city,
          country,
        },
      };

      onUpdate(updatedUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
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
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
        }}
      >
        Edit User
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
          </Stack>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              },
            }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !firstName || !lastName || !email}
          sx={{
            textTransform: "none",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            backgroundColor: "#05070A",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
