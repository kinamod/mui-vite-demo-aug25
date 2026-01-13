import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import Stack from "@mui/material/Stack";

// User interface based on API structure
interface UserName {
  title: string;
  first: string;
  last: string;
}

interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
}

interface UserDob {
  date: string;
  age: number;
}

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: UserName;
  email: string;
  location: UserLocation;
  dob: UserDob;
  gender: string;
  phone: string;
  cell: string;
  nat: string;
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";
const USERS_PER_PAGE = 20;

export default function Customers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedCity, setEditedCity] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async (page: number, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users?page=${page}&perPage=${USERS_PER_PAGE}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      
      if (append) {
        setUsers((prev) => [...prev, ...data.data]);
        setFilteredUsers((prev) => [...prev, ...data.data]);
      } else {
        setUsers(data.data);
        setFilteredUsers(data.data);
      }
      
      setTotalUsers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
      const email = user.email.toLowerCase();
      const city = user.location.city.toLowerCase();
      
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        city.includes(query)
      );
    });
    
    setFilteredUsers(filtered);
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditedFirstName(user.name.first);
    setEditedLastName(user.name.last);
    setEditedEmail(user.email);
    setEditedCity(user.location.city);
    setEditModalOpen(true);
  };

  // Handle save edited user
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setUpdateLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              ...selectedUser.name,
              first: editedFirstName,
              last: editedLastName,
            },
            email: editedEmail,
            location: {
              ...selectedUser.location,
              city: editedCity,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update local state
      const updatedUsers = users.map((user) =>
        user.login.uuid === selectedUser.login.uuid
          ? {
              ...user,
              name: {
                ...user.name,
                first: editedFirstName,
                last: editedLastName,
              },
              email: editedEmail,
              location: {
                ...user.location,
                city: editedCity,
              },
            }
          : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setEditModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const hasMoreUsers = users.length < totalUsers;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "36px",
        }}
      >
        Customers
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h6"
        component="h2"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: "20px",
          lineHeight: "26.68px",
        }}
      >
        Users
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          size="small"
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "100%", sm: "400px" },
            backgroundColor: "#FCFCFC",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
            "& input::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#999" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            borderRadius: "8px",
            background: "linear-gradient(0deg, #05070A 0%, #05070A 100%)",
            color: "#FFF",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            textTransform: "none",
            px: 3,
            py: 1,
            minWidth: "126px",
            height: "40px",
            boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              background: "linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)",
            },
          }}
        >
          Search
        </Button>
      </Stack>

      {/* Users Table */}
      <Card
        variant="outlined"
        sx={{
          backgroundColor: "#F5F6FA",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#FCFCFC",
                  "& th": {
                    borderBottom: "0.5px solid #0B0E14",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#000",
                    py: 1.5,
                  },
                }}
              >
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Age</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.login.uuid}
                    sx={{
                      "& td": {
                        borderBottom: "0.5px solid #0B0E14",
                        fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "20.02px",
                        color: "#000",
                        py: 2,
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  >
                    <TableCell>
                      {user.name.first} {user.name.last}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.location.city}</TableCell>
                    <TableCell>{user.location.country}</TableCell>
                    <TableCell align="right">{user.dob.age}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        aria-label={`Edit ${user.name.first} ${user.name.last}`}
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          border: "1px solid #DADEE7",
                          backgroundColor: "rgba(245, 246, 250, 0.30)",
                          "&:hover": {
                            backgroundColor: "rgba(245, 246, 250, 0.60)",
                          },
                        }}
                      >
                        <EditIcon sx={{ color: "#0B0E14", fontSize: "20px" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Load More Button */}
        {hasMoreUsers && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={loading}
              sx={{
                borderRadius: "8px",
                border: "1px solid #DADEE7",
                backgroundColor: "rgba(245, 246, 250, 0.30)",
                color: "#000",
                fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24.5px",
                textTransform: "none",
                px: 2,
                py: 1,
                minWidth: "107px",
                "&:hover": {
                  backgroundColor: "rgba(245, 246, 250, 0.60)",
                  borderColor: "#DADEE7",
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : "Load More"}
            </Button>
          </Box>
        )}
      </Card>

      {/* Edit User Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
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
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: 600,
            fontSize: "20px",
          }}
        >
          Edit User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              value={editedFirstName}
              onChange={(e) => setEditedFirstName(e.target.value)}
              fullWidth
              sx={{
                "& input": {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
            />
            <TextField
              label="Last Name"
              value={editedLastName}
              onChange={(e) => setEditedLastName(e.target.value)}
              fullWidth
              sx={{
                "& input": {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
            />
            <TextField
              label="Email"
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              fullWidth
              sx={{
                "& input": {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
            />
            <TextField
              label="City"
              value={editedCity}
              onChange={(e) => setEditedCity(e.target.value)}
              fullWidth
              sx={{
                "& input": {
                  fontFamily: "Helvetica, -apple-system, Roboto, sans-serif",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseModal}
            disabled={updateLoading}
            sx={{
              textTransform: "none",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={updateLoading}
            sx={{
              textTransform: "none",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            {updateLoading ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
