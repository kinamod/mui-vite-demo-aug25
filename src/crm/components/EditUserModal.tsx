import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string | number;
}

interface UserName {
  title: string;
  first: string;
  last: string;
}

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: UserName;
  email: string;
  location: UserLocation;
  dob: {
    date: string;
    age: number;
  };
  gender: string;
}

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
      setEmail(user.email);
      setError(null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users/${user.login.uuid}`, {
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const updatedUser: User = {
        ...user,
        name: {
          ...user.name,
          first: firstName,
          last: lastName,
        },
        email,
      };

      onUserUpdated(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
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
      <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
        Edit User
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: 300,
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
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: 300,
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            InputProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
                minWidth: 300,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: "Helvetica, Arial, sans-serif",
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !firstName || !lastName || !email}
          sx={{
            backgroundColor: "#05070A",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          {saving ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
