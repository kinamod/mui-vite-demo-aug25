import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";

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

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });
  const [saveLoading, setSaveLoading] = React.useState(false);

  const perPage = 20;
  const API_BASE = "https://user-api.builder-io.workers.dev/api";

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
          sortBy: "name.first",
        });

        if (search.trim()) {
          params.append("search", search.trim());
        }

        const response = await fetch(`${API_BASE}/users?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        
        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        setHasMore(data.data.length === perPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setSaveLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: editFormData.firstName,
              last: editFormData.lastName,
            },
            email: editFormData.email,
            location: {
              city: editFormData.city,
              country: editFormData.country,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editFormData.firstName,
                  last: editFormData.lastName,
                },
                email: editFormData.email,
                location: {
                  ...user.location,
                  city: editFormData.city,
                  country: editFormData.country,
                },
              }
            : user
        )
      );

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>
      
      <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Users
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search users by name, email, or city"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: 363,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: "#05070A",
            color: "white",
            textTransform: "none",
            fontSize: "34px",
            px: 3,
            "&:hover": {
              bgcolor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, width: 215 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 346 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 250 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 163 }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 77, textAlign: "right" }}>
                Age
              </TableCell>
              <TableCell sx={{ fontWeight: 500, width: 107, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.login.uuid}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell>
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.location.city}</TableCell>
                <TableCell>{user.location.country}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {user.dob.age}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(user)}
                    sx={{
                      border: "1px solid",
                      borderColor: "#DADEE7",
                      borderRadius: 1,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && users.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No users found</Typography>
          </Box>
        )}
      </TableContainer>

      {hasMore && !loading && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              textTransform: "none",
              borderColor: "#DADEE7",
              color: "text.primary",
              "&:hover": {
                borderColor: "#DADEE7",
                backgroundColor: "action.hover",
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                value={editFormData.firstName}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                value={editFormData.lastName}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={editFormData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                value={editFormData.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                value={editFormData.country}
                onChange={(e) => handleFormChange("country", e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
