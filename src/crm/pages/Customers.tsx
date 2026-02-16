import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useState, useEffect } from "react";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone?: {
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

interface UsersApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export default function Customers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [saving, setSaving] = useState(false);

  const perPage = 20;

  const fetchUsers = async (page: number, search: string = "", append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersApiResponse = await response.json();
      
      if (append) {
        setUsers((prev) => [...prev, ...data.data]);
      } else {
        setUsers(data.data);
      }
      
      setTotalUsers(data.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditedFirstName(user.name.first);
    setEditedLastName(user.name.last);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditedFirstName("");
    setEditedLastName("");
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError(null);
    
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
              first: editedFirstName,
              last: editedLastName,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editedFirstName,
                  last: editedLastName,
                },
              }
            : user
        )
      );

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const hasMoreUsers = users.length < totalUsers;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 600, fontSize: "24px" }}
      >
        Customers
      </Typography>

      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          sx={{
            width: 363,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FCFCFC",
              borderRadius: "8px",
              height: "40px",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            backgroundColor: "#05070A",
            color: "#FFF",
            borderRadius: "8px",
            height: "40px",
            px: 3,
            textTransform: "none",
            fontSize: "20px",
            fontWeight: 500,
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      <TableContainer
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: "#FCFCFC",
                  borderBottom: "0.5px solid #0B0E14",
                  fontWeight: 500,
                  fontSize: "16px",
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.login.uuid}
                  sx={{
                    "& td": {
                      borderBottom: "0.5px solid #0B0E14",
                      fontSize: "16px",
                      color: "#000",
                      py: 2,
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
                      onClick={() => handleEditClick(user)}
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid #DADEE7",
                        backgroundColor: "rgba(245, 246, 250, 0.30)",
                        width: 40,
                        height: 40,
                        "&:hover": {
                          backgroundColor: "rgba(245, 246, 250, 0.50)",
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 20, color: "#0B0E14" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMoreUsers && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              px: 3,
              py: 1,
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
                border: "1px solid #DADEE7",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}

      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
          Edit User Name
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="First Name"
              value={editedFirstName}
              onChange={(e) => setEditedFirstName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Last Name"
              value={editedLastName}
              onChange={(e) => setEditedLastName(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseModal}
            sx={{ textTransform: "none" }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#05070A",
              "&:hover": {
                backgroundColor: "#0B0E14",
              },
            }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
