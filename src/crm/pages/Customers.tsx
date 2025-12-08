import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Stack from "@mui/material/Stack";
import EditUserModal from "../components/EditUserModal";

/**
 * User interface matching the Users API response structure
 * This represents a single user record from the API
 */
interface User {
  login: {
    uuid: string; // Primary identifier for API operations
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  dob: {
    age: number;
  };
}

/**
 * Customers Page Component
 * 
 * Implements the Customer Dashboard Enhancement as per PRD requirements:
 * 
 * Features:
 * - Displays users in a searchable, paginated table
 * - Shows 20 users by default with "Load More" functionality
 * - Search by name, email, or city
 * - Edit user capability via modal dialog
 * - Integrates with Users API (https://user-api.builder-io.workers.dev/api/users)
 * 
 * PRD Reference: Customer Dashboard Enhancement – Users View
 * 
 * @returns {JSX.Element} Customer management page with users table
 */
export default function Customers() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  /**
   * users: Array of user records fetched from the API
   * Accumulates across pagination when "Load More" is clicked
   */
  const [users, setUsers] = React.useState<User[]>([]);
  
  /**
   * loading: Indicates when an API request is in progress
   * Used to show loading spinner and disable interactive elements
   */
  const [loading, setLoading] = React.useState(false);
  
  /**
   * error: Stores error messages from failed API requests
   * Displayed to user via Alert component when not null
   */
  const [error, setError] = React.useState<string | null>(null);
  
  /**
   * searchQuery: Current value in the search input field
   * Used for filtering users by name, email, or city
   */
  const [searchQuery, setSearchQuery] = React.useState("");
  
  /**
   * page: Current page number for pagination
   * Increments with each "Load More" click, resets on new search
   */
  const [page, setPage] = React.useState(1);
  
  /**
   * hasMore: Indicates if more users are available to load
   * Controls visibility of "Load More" button
   */
  const [hasMore, setHasMore] = React.useState(true);
  
  /**
   * selectedUser: The user currently being edited
   * Passed to EditUserModal component, null when no user is selected
   */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  /**
   * modalOpen: Controls visibility of the edit user modal
   * Set to true when edit button is clicked
   */
  const [modalOpen, setModalOpen] = React.useState(false);

  // ============================================================================
  // Constants
  // ============================================================================
  
  /**
   * Number of users to fetch per page/request
   * Per PRD requirement: "The table must show 20 users by default"
   */
  const perPage = 20;

  // ============================================================================
  // API Functions
  // ============================================================================
  
  /**
   * Fetches users from the Users API with pagination and optional search
   * 
   * @param {number} pageNum - Page number to fetch (1-indexed)
   * @param {string} search - Optional search query for filtering
   * 
   * Behavior:
   * - Page 1: Replaces existing users array (new search or initial load)
   * - Page 2+: Appends to existing users array (Load More functionality)
   * - Updates hasMore flag based on results to control "Load More" button
   * - Handles errors and displays them to the user
   * 
   * API: GET https://user-api.builder-io.workers.dev/api/users
   * Query params: page, perPage, search (optional)
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      // Set loading state to show spinner and disable interactions
      setLoading(true);
      
      // Clear any previous error messages
      setError(null);

      try {
        // Construct API URL with query parameters
        const url = new URL(
          "https://user-api.builder-io.workers.dev/api/users"
        );
        url.searchParams.append("page", pageNum.toString());
        url.searchParams.append("perPage", perPage.toString());
        
        // Only add search parameter if user has entered a search query
        if (search) {
          url.searchParams.append("search", search);
        }

        // Make GET request to fetch users
        const response = await fetch(url.toString());

        // Check for HTTP errors
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        // Parse JSON response
        const data = await response.json();

        // Update users based on whether this is first page or subsequent page
        if (pageNum === 1) {
          // First page: Replace all users (new search or initial load)
          setUsers(data.data || []);
        } else {
          // Subsequent pages: Append to existing users (Load More)
          setUsers((prev) => [...prev, ...(data.data || [])]);
        }

        /**
         * Determine if more data is available for pagination
         * Logic: If we received a full page AND haven't reached total count, more data exists
         * This controls the "Load More" button visibility
         */
        setHasMore(
          data.data && data.data.length === perPage && pageNum * perPage < data.total
        );
      } catch (err) {
        // Display error message to user if fetch fails
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        // Always clear loading state, whether success or failure
        setLoading(false);
      }
    },
    [] // Empty deps array - function doesn't depend on any props/state
  );

  // ============================================================================
  // Effects
  // ============================================================================
  
  /**
   * Effect: Initial data load when component mounts
   * Fetches the first page of users with no search filter
   */
  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Handles search button click
   * 
   * Resets to page 1 and fetches users matching the search query
   * This ensures search always starts fresh from the first page
   */
  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles "Load More" button click
   * 
   * Increments page number and fetches next batch of users
   * New users are appended to existing list (see fetchUsers logic)
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  /**
   * Handles click on edit icon button in table row
   * 
   * @param {User} user - The user to edit
   * 
   * Opens the edit modal with the selected user's data
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  /**
   * Handles modal close event
   * 
   * Clears selected user and closes the modal
   */
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Callback invoked after user is successfully updated
   * 
   * Refreshes the user list to show updated data
   * Resets to page 1 to ensure updated user is visible
   */
  const handleUserUpdated = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles Enter key press in search input
   * 
   * @param {React.KeyboardEvent} e - Keyboard event
   * 
   * Allows users to trigger search by pressing Enter
   * Provides better UX than requiring Search button click
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Title: "Customers" as per PRD requirement */}
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>

      {/* Section Title: "Users" to distinguish the users dashboard */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Users
      </Typography>

      {/* 
        Search Bar Section
        Per PRD: "A search input is provided above the table"
        Allows filtering by name, email, or city
      */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{
            minWidth: "300px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px", // Rounded corners per design
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            textTransform: "none", // Keep button text as-is (no uppercase)
            fontWeight: 500,
            px: 3,
          }}
        >
          Search
        </Button>
      </Stack>

      {/* Error Alert - Only shown when error state is not null */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/*
        Users Table
        Per PRD requirements:
        - Display user data in table format
        - Each row represents a single user
        - Edit button in each row
        - Columns: Name, Email, City, Country, Age, Actions
      */}
      <TableContainer
        sx={{
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table>
          {/* Table Header with column names */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 500 }} align="right">
                Age
              </TableCell>
              <TableCell sx={{ fontWeight: 500 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          
          {/* Table Body with user data rows */}
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.login.uuid} hover>
                {/* Name column: Combines first and last name */}
                <TableCell>
                  {user.name.first} {user.name.last}
                </TableCell>
                
                {/* Email column */}
                <TableCell>{user.email}</TableCell>
                
                {/* City column */}
                <TableCell>{user.location.city}</TableCell>
                
                {/* Country column */}
                <TableCell>{user.location.country}</TableCell>
                
                {/* Age column: Right-aligned for numeric data */}
                <TableCell align="right">{user.dob.age}</TableCell>
                
                {/* Actions column: Contains edit button */}
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(user)}
                    aria-label="Edit user"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Loading Spinner - Shown during API requests */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/*
        Load More Button
        Per PRD: "A 'Load More' button loads the next 20 users at a time"
        Only shown when:
        - Not currently loading
        - More users are available (hasMore === true)
        - At least some users have been loaded
      */}
      {!loading && hasMore && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 4,
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {/* Empty State - Shown when no users found */}
      {!loading && users.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            No users found. Try adjusting your search.
          </Typography>
        </Box>
      )}

      {/*
        Edit User Modal
        Per PRD: "Each row has an 'Edit' button. Clicking the button opens a modal"
        Handles user editing functionality with form validation and API integration
      */}
      <EditUserModal
        open={modalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
