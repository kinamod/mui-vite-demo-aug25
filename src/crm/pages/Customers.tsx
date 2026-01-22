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
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { fetchUsers, User } from "../services/usersApi";
import EditUserModal from "../components/EditUserModal";

/**
 * Customers Page Component
 *
 * Displays a searchable, paginated table of users fetched from the Users API.
 * Implements the requirements from the Customer Dashboard Enhancement PRD.
 *
 * Key Features:
 * - Displays 20 users per page by default (as per PRD section 3.1.2)
 * - Search functionality for filtering users by name, email, or city (PRD section 3.1.3)
 * - "Load More" button for pagination (PRD section 3.1.2)
 * - Edit button in each row that opens a modal for user editing (PRD section 3.1.4)
 * - Real-time loading states and error handling
 * - Responsive design that works on mobile, tablet, and desktop
 *
 * @component
 * @returns {JSX.Element} The Customers page with user table
 */
export default function Customers() {
  // State for storing the list of users fetched from the API
  const [users, setUsers] = React.useState<User[]>([]);

  // Loading state - true when fetching data from API
  const [loading, setLoading] = React.useState(true);

  // Error state - stores error message if API call fails
  const [error, setError] = React.useState<string | null>(null);

  // Search query state - the active search filter applied to the API
  const [searchQuery, setSearchQuery] = React.useState("");

  // Search input state - the current value in the search input field
  // (separate from searchQuery to allow typing without triggering API calls)
  const [searchInput, setSearchInput] = React.useState("");

  // Current page number for pagination
  const [page, setPage] = React.useState(1);

  // Flag indicating if there are more users to load
  const [hasMore, setHasMore] = React.useState(true);

  // Total count of users from the API
  const [total, setTotal] = React.useState(0);

  // Edit modal state - controls visibility of the edit user modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  // Selected user state - stores the user currently being edited
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Fetch users on mount and when search query or page changes
  const loadUsers = React.useCallback(
    async (currentPage: number, append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching users...", { currentPage, searchQuery });
        const response = await fetchUsers({
          page: currentPage,
          perPage: 20,
          search: searchQuery,
        });

        console.log("Users fetched:", response);

        if (append) {
          setUsers((prev) => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }

        setTotal(response.total);
        setHasMore(response.data.length === 20);
      } catch (err) {
        console.error("Error loading users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery],
  );

  // Load initial data
  React.useEffect(() => {
    console.log("Component mounted, loading users...");
    loadUsers(1, false);
  }, [loadUsers]);

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage, true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Handle user updated
  const handleUserUpdated = () => {
    // Reload current users
    loadUsers(1, false);
    setPage(1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontWeight: 600,
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        Customers
      </Typography>

      {/* Section Title */}
      <Typography
        variant="h6"
        component="h2"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: { xs: "1.125rem", md: "1.25rem" },
        }}
      >
        Users
      </Typography>

      {/* Search Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          fullWidth
          size="small"
          sx={{
            maxWidth: { sm: "400px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            px: 4,
            fontWeight: 500,
            fontSize: "1.25rem",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            minWidth: { xs: "100%", sm: "126px" },
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
      <Paper
        sx={{
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#F5F6FA",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  City
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Country
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Age
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
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
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.name.first} {user.name.last}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.location.city}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.location.country}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.dob.age}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      <IconButton
                        onClick={() => handleEditUser(user)}
                        size="small"
                        aria-label={`Edit ${user.name.first} ${user.name.last}`}
                        sx={{
                          borderRadius: "8px",
                          border: "1px solid #DADEE7",
                          backgroundColor: "rgba(245, 246, 250, 0.30)",
                          "&:hover": {
                            backgroundColor: "rgba(245, 246, 250, 0.50)",
                          },
                        }}
                      >
                        <EditRoundedIcon sx={{ fontSize: "1.25rem" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Load More Button */}
        {users.length > 0 && hasMore && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outlined"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                px: 3,
                py: 1,
                fontWeight: 500,
                border: "1px solid #DADEE7",
                backgroundColor: "rgba(245, 246, 250, 0.30)",
                color: "#000",
                "&:hover": {
                  backgroundColor: "rgba(245, 246, 250, 0.50)",
                  border: "1px solid #DADEE7",
                },
              }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </Box>
        )}

        {/* Total count */}
        {total > 0 && (
          <Box sx={{ px: 2, pb: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Showing {users.length} of {total} users
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
