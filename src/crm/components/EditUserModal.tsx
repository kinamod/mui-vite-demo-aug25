import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

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
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  dob: {
    date: string;
    age: number;
  };
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: Partial<User>) => Promise<void>;
}

export default function EditUserModal({
  open,
  onClose,
  user,
  onSave,
}: EditUserModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name.first,
        lastName: user.name.last,
        email: user.email,
        city: user.location.city,
        country: user.location.country,
      });
      setError(null);
    }
  }, [user]);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await onSave({
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
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                required
                sx={{
                  "& input": {
                    fontFamily: "Helvetica, Arial, sans-serif",
                    minWidth: "300px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                required
                sx={{
                  "& input": {
                    fontFamily: "Helvetica, Arial, sans-serif",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange("city")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleChange("country")}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
