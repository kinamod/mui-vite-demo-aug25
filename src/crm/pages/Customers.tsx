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

  /**
   * Loads users from the API with pagination and search
   *
   * This function is memoized with useCallback to prevent unnecessary re-renders.
   * It's called on component mount and whenever the search query changes.
   *
   * @param {number} currentPage - The page number to fetch (1-indexed)
   * @param {boolean} append - If true, appends new users to existing list. If false, replaces the list.
   * @returns {Promise<void>}
   *
   * Features:
   * - Fetches 20 users per page as per PRD requirement
   * - Supports search filtering by name, email, or city
   * - Updates hasMore flag based on response length
   * - Handles errors gracefully with error messages
   */
  const loadUsers = React.useCallback(
    async (currentPage: number, append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching users...", { currentPage, searchQuery });

        // Call the Users API with pagination and search parameters
        const response = await fetchUsers({
          page: currentPage,
          perPage: 20, // PRD requirement: show 20 users by default
          search: searchQuery,
        });

        console.log("Users fetched:", response);

        // Either append to existing users (for "Load More") or replace the list (for new search)
        if (append) {
          setUsers((prev) => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }

        // Update total count for display
        setTotal(response.total);

        // Determine if there are more users to load
        // If we got less than 20 users, we've reached the end
        setHasMore(response.data.length === 20);
      } catch (err) {
        console.error("Error loading users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        // Always clear loading state
        setLoading(false);
      }
    },
    [searchQuery], // Re-create function when search query changes
  );

  /**
   * Effect: Load initial users when component mounts or search query changes
   *
   * This effect runs whenever the loadUsers callback changes (which happens
   * when the searchQuery changes). It always loads the first page and replaces
   * the existing user list.
   */
  React.useEffect(() => {
    console.log("Component mounted, loading users...");
    loadUsers(1, false);
  }, [loadUsers]);

  /**
   * Handles the search button click
   *
   * Updates the search query state with the current input value,
   * which triggers a new API call via the useEffect. Also resets
   * the page to 1 since we're starting a new search.
   */
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  /**
   * Handles Enter key press in the search input
   *
   * Allows users to submit the search by pressing Enter instead
   * of clicking the Search button, improving UX.
   *
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Handles the "Load More" button click
   *
   * Increments the page number and loads the next batch of users,
   * appending them to the existing list. This implements the
   * pagination requirement from PRD section 3.1.2.
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage, true); // true = append to existing users
  };

  /**
   * Handles the edit button click for a user row
   *
   * Opens the edit modal and sets the selected user to be edited.
   * This implements the edit functionality from PRD section 3.1.4.
   *
   * @param {User} user - The user object to edit
   */
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  /**
   * Callback invoked after a user is successfully updated
   *
   * Reloads the first page of users to reflect the changes and
   * resets the page counter. This ensures the user sees the
   * updated information immediately.
   */
  const handleUserUpdated = () => {
    // Reload users from page 1 to see the updated data
    loadUsers(1, false);
    setPage(1);
  };

  // Render the customers page with user table
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/*
        Page Title - "Customers"
        Responsive font size: 1.5rem on mobile, 2rem on desktop
        Implements PRD section 3.1.1 dashboard integration
      */}
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

      {/*
        Section Title - "Users"
        Indicates the Users dashboard as specified in PRD section 3.1.1
      */}
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

      {/*
        Search Bar Section
        Implements PRD section 3.1.3 search functionality
        - Stacks vertically on mobile, horizontally on larger screens
        - Search input with placeholder text as shown in Figma design
        - Search button with Poppins font matching the design
      */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        {/*
          Search Text Input
          - Supports Enter key to submit (better UX)
          - Updates searchInput state on change
          - Max width of 400px on larger screens
        */}
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

        {/*
          Search Button
          - Uses Poppins font and specific styling from Figma design
          - Black background with rounded corners
          - Triggers search on click
        */}
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

      {/*
        Error Alert
        Displays error messages if API calls fail
        Only shown when error state is not null
      */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/*
        Users Table
        Implements PRD section 3.1.2 table display requirements
        - Displays user data in table format with Name, Email, City, Country, Age, and Actions columns
        - Uses Figma design colors: #F5F6FA background, #FCFCFC header background
        - Border styling matches Figma design with 0.5px solid borders
        - Rounded corners (8px) for modern appearance
      */}
      <Paper
        sx={{
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#F5F6FA", // Matches Figma design background color
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            {/*
              Table Header
              - Fixed header with column labels
              - Lighter background (#FCFCFC) to distinguish from data rows
              - Font weight 500 for emphasis
            */}
            <TableHead>
              <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
                {/* Name column */}
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Name
                </TableCell>

                {/* Email column */}
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Email
                </TableCell>

                {/* City column */}
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  City
                </TableCell>

                {/* Country column */}
                <TableCell
                  sx={{
                    fontWeight: 500,
                    borderBottom: "0.5px solid #0B0E14",
                    py: 1.5,
                  }}
                >
                  Country
                </TableCell>

                {/* Age column - right aligned for better readability of numbers */}
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

                {/* Actions column - center aligned for edit button */}
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

            {/*
              Table Body - displays user data or loading/empty states
              Uses conditional rendering to show different content based on data state:
              1. Loading spinner when initially loading data
              2. "No users found" message when no data is available
              3. User rows when data is loaded
            */}
            <TableBody>
              {/*
                Loading State
                Shows a centered circular progress indicator while fetching initial data
                Only shown when loading AND no users are loaded yet
                Spans all 6 columns for proper alignment
              */}
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : /*
                Empty State
                Shows when no users match the search criteria or when there's no data
                Displays a helpful message to inform the user
              */ users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                /*
                  User Rows
                  Maps through the users array to create a row for each user
                  Each row represents a single user as per PRD section 3.1.2
                  Includes hover effect for better UX
                */
                users.map((user) => (
                  <TableRow
                    key={user.login.uuid}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.02)", // Subtle hover effect
                      },
                    }}
                  >
                    {/* Name Cell - displays first and last name */}
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.name.first} {user.name.last}
                    </TableCell>

                    {/* Email Cell */}
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.email}
                    </TableCell>

                    {/* City Cell */}
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.location.city}
                    </TableCell>

                    {/* Country Cell */}
                    <TableCell
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.location.country}
                    </TableCell>

                    {/* Age Cell - right aligned for better number readability */}
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {user.dob.age}
                    </TableCell>

                    {/*
                      Actions Cell
                      Contains the Edit button as per PRD section 3.1.4
                      Clicking opens a modal for editing user information
                    */}
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "0.5px solid #0B0E14",
                        py: 2,
                      }}
                    >
                      {/*
                        Edit Button
                        - Styled to match Figma design with rounded corners and subtle background
                        - Includes aria-label for accessibility
                        - Opens EditUserModal when clicked
                      */}
                      <IconButton
                        onClick={() => handleEditUser(user)}
                        size="small"
                        aria-label={`Edit ${user.name.first} ${user.name.last}`}
                        sx={{
                          borderRadius: "8px",
                          border: "1px solid #DADEE7", // Matches Figma design
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

        {/*
          Load More Button
          Implements PRD section 3.1.2 pagination requirement
          - Only shown when there are users loaded AND more users are available
          - Loads the next 20 users when clicked
          - Shows loading spinner during API call
          - Disabled during loading to prevent duplicate requests
          - Styled to match Figma design
        */}
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

        {/*
          User Count Display
          Shows the number of currently loaded users vs total users available
          Helps users understand how much data they're viewing
          Only shown when there's at least one user
        */}
        {total > 0 && (
          <Box sx={{ px: 2, pb: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Showing {users.length} of {total} users
            </Typography>
          </Box>
        )}
      </Paper>

      {/*
        Edit User Modal
        Implements PRD section 3.1.4 edit functionality
        - Modal for editing user information
        - Opens when edit button is clicked on any user row
        - Controlled by editModalOpen state
        - Receives selectedUser as the user to edit
        - Calls handleUserUpdated after successful update to refresh the table
      */}
      <EditUserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
