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

/**
 * Base URL for the Users API
 * @see https://user-api.builder-io.workers.dev/api for API documentation
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * User interface representing the structure of a user object from the API
 */
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

/**
 * API Response interface for the users list endpoint
 */
interface UsersApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

/**
 * Customers component - Main page for managing customer/user data
 * 
 * Features:
 * - Search users by name, email, or city
 * - Display users in a paginated table
 * - Edit user names via a modal dialog
 * - Load more users with pagination
 */
export default function Customers() {
  // State for storing the list of users
  const [users, setUsers] = useState<User[]>([]);
  
  // Loading state for API requests
  const [loading, setLoading] = useState(false);
  
  // Error state for displaying error messages
  const [error, setError] = useState<string | null>(null);
  
  // Search query input value
  const [searchQuery, setSearchQuery] = useState("");
  
  // Current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Total number of users available from the API
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal open/close state
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Currently selected user for editing
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Edited first name value in the modal
  const [editedFirstName, setEditedFirstName] = useState("");
  
  // Edited last name value in the modal
  const [editedLastName, setEditedLastName] = useState("");
  
  // Loading state for save operation
  const [saving, setSaving] = useState(false);

  // Number of users to fetch per page
  const perPage = 20;

  /**
   * Fetches users from the API
   * @param page - The page number to fetch
   * @param search - Optional search query to filter users
   * @param append - If true, appends results to existing users; if false, replaces users
   */
  const fetchUsers = async (page: number, search: string = "", append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters for the API request
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        ...(search && { search }),
      });

      // Make API request to fetch users
      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersApiResponse = await response.json();
      
      // Either append to existing users or replace them
      if (append) {
        setUsers((prev) => [...prev, ...data.data]);
      } else {
        setUsers(data.data);
      }
      
      // Update pagination metadata
      setTotalUsers(data.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch initial users on component mount
   */
  useEffect(() => {
    fetchUsers(1);
  }, []);

  /**
   * Handles the search button click
   * Resets to page 1 and fetches users with the search query
   */
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles the "Load More" button click
   * Fetches the next page of users and appends them to the current list
   */
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchUsers(nextPage, searchQuery, true);
  };

  /**
   * Opens the edit modal for a specific user
   * @param user - The user to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditedFirstName(user.name.first);
    setEditedLastName(user.name.last);
    setEditModalOpen(true);
  };

  /**
   * Closes the edit modal and resets the form state
   */
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditedFirstName("");
    setEditedLastName("");
  };

  /**
   * Saves the edited user name to the API
   * Updates the local state with the new user data on success
   */
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError(null);
    
    try {
      // Send PUT request to update user
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

      // Update the user in the local state to reflect the changes
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

      // Close the modal after successful save
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Determine if there are more users to load
  const hasMoreUsers = users.length < totalUsers;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 600, fontSize: "24px" }}
      >
        Customers
      </Typography>

      {/* Section subtitle */}
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {/* Error alert - only shown when there's an error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search bar section */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        {/* Search input field */}
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
        {/* Search button */}
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

      {/* Users table */}
      <TableContainer
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
        }}
      >
        <Table>
          {/* Table header */}
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
          {/* Table body */}
          <TableBody>
            {/* Show loading spinner when fetching initial data */}
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              // Show "no users found" message when there are no results
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              // Render user rows
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
                  {/* User name column */}
                  <TableCell>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  {/* Email column */}
                  <TableCell>{user.email}</TableCell>
                  {/* City column */}
                  <TableCell>{user.location.city}</TableCell>
                  {/* Country column */}
                  <TableCell>{user.location.country}</TableCell>
                  {/* Age column */}
                  <TableCell align="right">{user.dob.age}</TableCell>
                  {/* Actions column with edit button */}
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

      {/* Load More button - only shown when there are more users to load */}
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

      {/* Edit User Modal Dialog */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        {/* Modal title */}
        <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
          Edit User Name
        </DialogTitle>
        {/* Modal content with form fields */}
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            {/* First name input field */}
            <TextField
              label="First Name"
              value={editedFirstName}
              onChange={(e) => setEditedFirstName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            {/* Last name input field */}
            <TextField
              label="Last Name"
              value={editedLastName}
              onChange={(e) => setEditedLastName(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        {/* Modal action buttons */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {/* Cancel button */}
          <Button
            onClick={handleCloseModal}
            sx={{ textTransform: "none" }}
            disabled={saving}
          >
            Cancel
          </Button>
          {/* Save button */}
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
