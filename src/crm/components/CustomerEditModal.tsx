import * as React from "react";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// User interface (same as in CustomerDataGrid)
interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
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
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

interface CustomerEditModalProps {
  open: boolean;
  customer: User | null;
  isCreate: boolean;
  onClose: () => void;
  onSave: (customer: User) => void;
}

export default function CustomerEditModal({
  open,
  customer,
  isCreate,
  onClose,
  onSave,
}: CustomerEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else if (isCreate) {
      // Initialize with empty form for new customer
      setFormData({
        login: {
          uuid: "",
          username: "",
          password: "",
        },
        name: {
          title: "Mr",
          first: "",
          last: "",
        },
        gender: "male",
        location: {
          street: {
            number: 0,
            name: "",
          },
          city: "",
          state: "",
          country: "",
          postcode: "",
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
          timezone: {
            offset: "",
            description: "",
          },
        },
        email: "",
        dob: {
          date: "",
          age: 0,
        },
        registered: {
          date: new Date().toISOString(),
          age: 0,
        },
        phone: "",
        cell: "",
        picture: {
          large: "",
          medium: "",
          thumbnail: "",
        },
        nat: "",
      });
    }
    setError(null);
  }, [customer, isCreate]);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      const newData = { ...prev };
      
      let current = newData as any;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData };

      if (isCreate) {
        // Create new customer
        const response = await fetch("https://user-api.builder-io.workers.dev/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to create customer: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Update formData with the new UUID from the server
        const updatedCustomer = {
          ...payload,
          login: {
            ...payload.login!,
            uuid: result.uuid,
          },
        } as User;

        onSave(updatedCustomer);
      } else {
        // Update existing customer
        const customerId = customer?.login.uuid || customer?.login.username || customer?.email;
        if (!customerId) {
          throw new Error("No customer identifier found");
        }

        const response = await fetch(`https://user-api.builder-io.workers.dev/api/users/${customerId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update customer: ${response.statusText}`);
        }

        onSave(payload as User);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) return null;

  const fullName = formData.name ? `${formData.name.first} ${formData.name.last}` : "";
  const initials = formData.name ? `${formData.name.first?.charAt(0) || ""}${formData.name.last?.charAt(0) || ""}`.toUpperCase() : "";

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: "600px" }
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">
          {isCreate ? "Add New Customer" : "Edit Customer"}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Customer Avatar and Basic Info */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              src={formData.picture?.thumbnail}
              sx={{ width: 80, height: 80, mr: 2, fontSize: "1.5rem" }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h6">{fullName || "New Customer"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Title</InputLabel>
                <Select
                  value={formData.name?.title || ""}
                  label="Title"
                  onChange={(e) => handleChange("name.title", e.target.value)}
                >
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Miss">Miss</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={4.5}>
              <TextField
                label="First Name"
                value={formData.name?.first || ""}
                onChange={(e) => handleChange("name.first", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                label="Last Name"
                value={formData.name?.last || ""}
                onChange={(e) => handleChange("name.last", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender || ""}
                  label="Gender"
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Cell Phone"
                value={formData.cell || ""}
                onChange={(e) => handleChange("cell", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <TextField
                label="Street Number"
                type="number"
                value={formData.location?.street?.number || ""}
                onChange={(e) => handleChange("location.street.number", parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={9}>
              <TextField
                label="Street Name"
                value={formData.location?.street?.name || ""}
                onChange={(e) => handleChange("location.street.name", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="City"
                value={formData.location?.city || ""}
                onChange={(e) => handleChange("location.city", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="State"
                value={formData.location?.state || ""}
                onChange={(e) => handleChange("location.state", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Country"
                value={formData.location?.country || ""}
                onChange={(e) => handleChange("location.country", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Postcode"
                value={formData.location?.postcode || ""}
                onChange={(e) => handleChange("location.postcode", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Login Information (for new customers) */}
            {isCreate && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Login Information
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Username"
                    value={formData.login?.username || ""}
                    onChange={(e) => handleChange("login.username", e.target.value)}
                    fullWidth
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Password"
                    type="password"
                    value={formData.login?.password || ""}
                    onChange={(e) => handleChange("login.password", e.target.value)}
                    fullWidth
                    size="small"
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {isCreate ? "Create Customer" : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
