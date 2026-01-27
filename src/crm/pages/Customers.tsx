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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";

// User type based on the API structure
interface User {
  login: {
    uuid: string;
    username: string;
    password?: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender?: string;
  location?: {
    street?: {
      number: number;
      name: string;
    };
    city: string;
    state?: string;
    country: string;
    postcode?: string;
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
  dob?: {
    date: string;
    age: number;
  };
  registered?: {
    date: string;
    age: number;
  };
  phone?: string;
  cell?: string;
  picture?: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat?: string;
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";
const USERS_PER_PAGE = 20;

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    firstName: "",
    lastName: "",
    title: "",
  });
  const [saving, setSaving] = React.useState(false);

  // Fetch users from the API
  const fetchUsers = React.useCallback(async (page: number, search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: USERS_PER_PAGE.toString(),
      });
      
      if (search) {
        params.append("search", search);
      }
      
      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setUsers(data.data || []);
      } else {
        setUsers((prev) => [...prev, ...(data.data || [])]);
      }
      
      // Check if there are more users to load
      setHasMore(data.data && data.data.length === USERS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchTerm);
  };

  // Handle edit button click
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      title: user.name.title,
    });
    setEditModalOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const updateData = {
        name: {
          first: editFormData.firstName,
          last: editFormData.lastName,
          title: editFormData.title,
        },
      };
      
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      
      // Update the user in the local state
      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editFormData.firstName,
                  last: editFormData.lastName,
                  title: editFormData.title,
                },
              }
            : user
        )
      );
      
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  // Handle Enter key in search field
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>
      
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Users
      </Typography>

      {/* Search Section */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 4,
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Search
        </Button>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer
        sx={{
          backgroundColor: "#F5F6FA",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              <TableCell sx={{ fontWeight: 500, borderBottom: "0.5px solid #0B0E14" }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 500, borderBottom: "0.5px solid #0B0E14" }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 500, borderBottom: "0.5px solid #0B0E14" }}>
                City
              </TableCell>
              <TableCell sx={{ fontWeight: 500, borderBottom: "0.5px solid #0B0E14" }}>
                Country
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 500, borderBottom: "0.5px solid #0B0E14" }}
              >
                Age
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 500, borderBottom: "0.5px solid #0B0E14" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.login.uuid}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "0.5px solid #0B0E14",
                    },
                  }}
                >
                  <TableCell>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.location?.city || "-"}</TableCell>
                  <TableCell>{user.location?.country || "-"}</TableCell>
                  <TableCell align="right">{user.dob?.age || "-"}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      sx={{
                        border: "1px solid #DADEE7",
                        borderRadius: 2,
                        backgroundColor: "rgba(245, 246, 250, 0.30)",
                        "&:hover": {
                          backgroundColor: "rgba(245, 246, 250, 0.60)",
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More Button */}
      {hasMore && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              borderColor: "#DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              "&:hover": {
                borderColor: "#DADEE7",
                backgroundColor: "rgba(245, 246, 250, 0.60)",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}

      {/* Edit User Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, firstName: e.target.value })
              }
              fullWidth
              required
              sx={{
                "& input": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, lastName: e.target.value })
              }
              fullWidth
              required
              sx={{
                "& input": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleModalClose}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={saving || !editFormData.firstName || !editFormData.lastName}
            sx={{ textTransform: "none" }}
          >
            {saving ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
