/**
 * UsersTable Component
 *
 * A comprehensive table component for displaying and managing user data from the Users API.
 * Features include:
 * - Paginated user list (20 users per page)
 * - Search functionality (by name, email, or city)
 * - Edit user capability via modal dialog
 * - Loading states and error handling
 * - Responsive design matching Figma specifications
 *
 * @see PRD: Customer Dashboard Enhancement – Users View
 */
import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditUserModal from "./EditUserModal";

/**
 * Base URL for the Users API
 * Documentation: https://user-api.builder-io.workers.dev/api
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * Interface representing a user's location information
 * Includes street address, city, state, country, and postal code
 */
interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string | number; // Can be string or number depending on country
}

/**
 * Interface representing a user's name
 * Includes title (Mr, Mrs, Ms, etc.), first name, and last name
 */
interface UserName {
  title: string;
  first: string;
  last: string;
}

/**
 * Main User interface representing the complete user object from the API
 * Matches the structure returned by the Users API
 */
interface User {
  login: {
    uuid: string; // Unique identifier for the user
    username: string;
  };
  name: UserName;
  email: string;
  location: UserLocation;
  dob: {
    date: string; // ISO date string
    age: number; // Calculated age
  };
  gender: string;
}

export default function UsersTable() {
  // ============================================================================
  // State Management
  // ============================================================================

  /** Array of user objects currently displayed in the table */
  const [users, setUsers] = React.useState<User[]>([]);

  /** Loading state for initial data fetch */
  const [loading, setLoading] = React.useState(true);

  /** Loading state specifically for "Load More" button */
  const [loadingMore, setLoadingMore] = React.useState(false);

  /** Error message to display if API request fails */
  const [error, setError] = React.useState<string | null>(null);

  /** Current search query entered by user */
  const [searchQuery, setSearchQuery] = React.useState("");

  /** Current page number for pagination */
  const [page, setPage] = React.useState(1);

  /** Boolean indicating if more users are available to load */
  const [hasMore, setHasMore] = React.useState(true);

  /** Controls visibility of the edit user modal */
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  /** The user currently selected for editing */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  /** Number of users to fetch per page (as per PRD requirement) */
  const perPage = 20;

  // ============================================================================
  // API Integration
  // ============================================================================

  /**
   * Fetches users from the Users API with optional search and pagination
   *
   * @param pageNum - The page number to fetch (1-indexed)
   * @param search - Optional search query to filter users
   * @param append - If true, appends results to existing users (for "Load More")
   *                 If false, replaces existing users (for new search)
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "", append: boolean = false) => {
      try {
        // Set appropriate loading state
        if (append) {
          setLoadingMore(true); // Loading more users
        } else {
          setLoading(true); // Initial load or new search
        }
        setError(null);

        // Build query parameters for API request
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
        });

        // Add search query if provided
        if (search) {
          params.append("search", search);
        }

        // Make API request
        const response = await fetch(`${API_BASE_URL}/users?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();

        // Update users state based on append flag
        if (append) {
          // Append new users to existing list (Load More functionality)
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          // Replace users with new results (Search or initial load)
          setUsers(data.data);
        }

        // Check if more users are available for pagination
        setHasMore(data.data.length === perPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  /**
   * Effect: Fetch users when component mounts or search query changes
   */
  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [fetchUsers, searchQuery]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles search form submission
   * Resets pagination and fetches users with search query
   */
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1); // Reset to first page
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles "Load More" button click
   * Fetches the next page of users and appends to existing list
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, true); // true = append mode
  };

  /**
   * Handles edit button click for a user row
   * Opens the edit modal with selected user data
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  /**
   * Handles closing of the edit user modal
   * Clears selected user and closes modal
   */
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Handles successful user update from modal
   * Updates the user in the local state and closes modal
   *
   * @param updatedUser - The user object with updated information
   */
  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.login.uuid === updatedUser.login.uuid ? updatedUser : user,
      ),
    );
    handleCloseModal();
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Formats a user's name into a full name string
   * @param name - UserName object containing first and last name
   * @returns Formatted full name (e.g., "John Doe")
   */
  const getFullName = (name: UserName) => {
    return `${name.first} ${name.last}`;
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
        Customers
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      <Card variant="outlined" sx={{ backgroundColor: "#F5F6FA" }}>
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                placeholder="Search users by name, email, or city"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: 363,
                  backgroundColor: "#FCFCFC",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 126,
                  borderRadius: "8px",
                  backgroundColor: "#05070A",
                  textTransform: "none",
                  fontSize: "20px",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#0B0E14",
                  },
                }}
              >
                Search
              </Button>
            </Box>
          </form>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ backgroundColor: "#F5F6FA" }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "#FCFCFC",
                        "& th": {
                          borderBottom: "0.5px solid #0B0E14",
                          fontSize: "16px",
                          fontWeight: 500,
                        },
                      }}
                    >
                      <TableCell sx={{ width: 215 }}>Name</TableCell>
                      <TableCell sx={{ width: 346 }}>Email</TableCell>
                      <TableCell sx={{ width: 250 }}>City</TableCell>
                      <TableCell sx={{ width: 163 }}>Country</TableCell>
                      <TableCell align="right" sx={{ width: 77 }}>
                        Age
                      </TableCell>
                      <TableCell align="center" sx={{ width: 107 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.login.uuid}
                        sx={{
                          "& td": {
                            borderBottom: "0.5px solid #0B0E14",
                            fontSize: "16px",
                            fontWeight: 400,
                          },
                        }}
                      >
                        <TableCell>{getFullName(user.name)}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.location.city}</TableCell>
                        <TableCell>{user.location.country}</TableCell>
                        <TableCell align="right">{user.dob.age}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(user)}
                            sx={{
                              borderRadius: "8px",
                              border: "1px solid #DADEE7",
                              backgroundColor: "rgba(245, 246, 250, 0.30)",
                              width: 40,
                              height: 40,
                            }}
                          >
                            <EditRoundedIcon sx={{ color: "#0B0E14" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {hasMore && users.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 3,
                  }}
                >
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outlined"
                    sx={{
                      borderRadius: "8px",
                      border: "1px solid #DADEE7",
                      backgroundColor: "rgba(245, 246, 250, 0.30)",
                      color: "#000",
                      textTransform: "none",
                      fontSize: "16px",
                      fontWeight: 500,
                      minWidth: 107,
                      "&:hover": {
                        backgroundColor: "rgba(245, 246, 250, 0.50)",
                      },
                    }}
                  >
                    {loadingMore ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Card>

      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
