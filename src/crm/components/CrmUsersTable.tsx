/**
 * CrmUsersTable Component
 * 
 * Displays a searchable, paginated table of users from the Users API.
 * Implements the Customer Dashboard Enhancement PRD requirements:
 * - Shows 20 users per page with "Load More" pagination
 * - Provides search functionality by name, email, or city
 * - Enables editing user details through a modal interface
 * - Follows the Figma design specifications for styling and layout
 */

import * as React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CrmEditUserModal from "./CrmEditUserModal";

/**
 * User interface matching the Users API response structure
 * Represents a single user with authentication, personal, and location data
 */
interface User {
  login: {
    uuid: string; // Unique identifier for the user
    username: string;
  };
  name: {
    title: string; // e.g., "Mr", "Ms", "Dr"
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  dob: {
    age: number; // User's age in years
  };
}

/**
 * API base URL - uses Vite proxy to avoid CORS issues
 * Proxied from https://user-api.builder-io.workers.dev/api
 */
const API_BASE_URL = "/api";

export default function CrmUsersTable() {
  // State: User data and pagination
  const [users, setUsers] = React.useState<User[]>([]); // Array of loaded users
  const [loading, setLoading] = React.useState(false); // Loading indicator state
  const [error, setError] = React.useState<string | null>(null); // Error message if API fails
  const [searchQuery, setSearchQuery] = React.useState(""); // Current search input value
  const [page, setPage] = React.useState(1); // Current page number (1-indexed)
  const [total, setTotal] = React.useState(0); // Total number of users available from API
  const [editingUser, setEditingUser] = React.useState<User | null>(null); // User currently being edited in modal
  const perPage = 20; // Number of users to load per page (PRD requirement)

  /**
   * Fetches users from the API with pagination and optional search
   * 
   * @param pageNum - Page number to fetch (1-indexed)
   * @param search - Optional search query to filter users by name, email, or city
   * 
   * Behavior:
   * - On page 1: Replaces existing users (new search or initial load)
   * - On page > 1: Appends to existing users (Load More functionality)
   * - Sets error state if fetch fails
   * - Updates total count for pagination logic
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters for the API request
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
        });

        // Add search query if provided
        if (search) {
          params.append("search", search);
        }

        // Fetch users from the API
        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        // Replace users on page 1 (new search), append on subsequent pages (Load More)
        if (pageNum === 1) {
          setUsers(data.data);
        } else {
          setUsers((prev) => [...prev, ...data.data]);
        }

        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [perPage]
  );

  /**
   * Initial data load on component mount
   * Fetches the first page of users without search filter
   */
  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, []);

  /**
   * Handles search button click or Enter key press
   * Resets to page 1 and fetches users matching the search query
   */
  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles "Load More" button click
   * Fetches the next page of users and appends to current list
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  /**
   * Opens the edit modal for the specified user
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  /**
   * Closes the edit modal without saving changes
   */
  const handleCloseModal = () => {
    setEditingUser(null);
  };

  /**
   * Handles successful user update from the modal
   * Updates the user in the local state to reflect changes without refetching
   * 
   * @param updatedUser - The user object with updated values
   */
  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.login.uuid === updatedUser.login.uuid ? updatedUser : u
      )
    );
    setEditingUser(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Title: "Customers" - matches Figma design */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 600, fontSize: "24px", lineHeight: "36px" }}
      >
        Customers
      </Typography>

      {/* Section Title: "Users" - matches Figma design */}
      <Typography
        variant="h5"
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

      {/* Search Bar and Button */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        {/* Search Input Field - styled per Figma specifications */}
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            // Allow Enter key to trigger search
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: { xs: "100%", sm: "363px" },
            "& .MuiOutlinedInput-root": {
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              "& input": {
                fontSize: "16px",
                color: "#999",
              },
            },
          }}
        />
        {/* Search Button - dark theme matching Figma design */}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            height: "40px",
            minWidth: "126px",
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#FFF",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            textTransform: "none",
            border: "1px solid #333C4D",
            boxShadow:
              "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Error Alert - displays if API request fails */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table - styled to match Figma design specifications */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          boxShadow: "none",
        }}
      >
        <Table>
          {/* Table Header - column names with specific widths from Figma */}
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-head": {
                  backgroundColor: "#FCFCFC",
                  borderBottom: "0.5px solid #0B0E14",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  padding: "6px 16px",
                  height: "36px",
                },
              }}
            >
              <TableCell sx={{ width: "215px" }}>Name</TableCell>
              <TableCell sx={{ width: "346px" }}>Email</TableCell>
              <TableCell sx={{ width: "250px" }}>City</TableCell>
              <TableCell sx={{ width: "163px" }}>Country</TableCell>
              <TableCell align="right" sx={{ width: "77px" }}>
                Age
              </TableCell>
              <TableCell align="center" sx={{ width: "107px" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          {/* Table Body - displays user data rows */}
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.login.uuid}
                sx={{
                  "& .MuiTableCell-body": {
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    padding: "16px",
                    height: "53px",
                  },
                }}
              >
                {/* Full name combining first and last */}
                <TableCell>
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.location.city}</TableCell>
                <TableCell>{user.location.country}</TableCell>
                <TableCell align="right">{user.dob.age}</TableCell>
                <TableCell align="center">
                  {/* Edit Button - opens modal for editing user details */}
                  <IconButton
                    onClick={() => handleEditClick(user)}
                    aria-label={`Edit ${user.name.first} ${user.name.last}`}
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid #DADEE7",
                      backgroundColor: "rgba(245, 246, 250, 0.30)",
                      "&:hover": {
                        backgroundColor: "rgba(245, 246, 250, 0.50)",
                      },
                    }}
                  >
                    <EditIcon sx={{ width: "24px", height: "24px" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Loading Spinner - shown during initial data load (page 1) */}
      {loading && page === 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Load More Button - shown when there are more users to load */}
      {!loading && users.length < total && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              width: "107px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24.5px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}

      {/* Edit User Modal - displayed when a user is being edited */}
      {editingUser && (
        <CrmEditUserModal
          user={editingUser}
          open={!!editingUser}
          onClose={handleCloseModal}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Box>
  );
}
