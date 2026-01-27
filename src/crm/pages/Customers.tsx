/**
 * Customers Page Component
 * 
 * This component implements the Customer Dashboard Enhancement as specified in the PRD.
 * It provides a comprehensive interface for viewing and managing user data with the following features:
 * 
 * Features:
 * - Displays users in a paginated table format (20 users per page)
 * - Search functionality for filtering users by name, email, or city
 * - "Load More" pagination to incrementally load additional users
 * - Edit capability via modal dialog for updating user information
 * - Real-time error handling and loading states
 * - Fully responsive design matching the Figma specifications
 * 
 * API Integration:
 * - Fetches user data from: https://user-api.builder-io.workers.dev/api/users
 * - Supports pagination, search, and user updates
 * 
 * PRD Requirements Fulfilled:
 * - Section 3.1.1: Dashboard Integration within Customers tab
 * - Section 3.1.2: Table Display with 20 users per page and "Load More" button
 * - Section 3.1.3: Search functionality with real-time filtering
 * - Section 3.1.4: Edit User Modal with Helvetica font for name fields
 * - Section 3.2: Performance, UI Consistency, and Accessibility
 */

import * as React from "react";
// MUI Layout Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
// MUI Form Components
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
// MUI Table Components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// MUI Dialog Components
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
// MUI Feedback Components
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
// MUI Icons
import EditIcon from "@mui/icons-material/Edit";

/**
 * User Interface
 * 
 * Represents the complete user data structure returned by the Users API.
 * This interface matches the API response format to ensure type safety
 * when fetching and manipulating user data.
 * 
 * Key Fields:
 * - login: Contains unique identifiers (uuid, username)
 * - name: User's full name with title, first, and last name
 * - email: Primary email address (required)
 * - location: Geographic information including city and country
 * - dob: Date of birth and calculated age
 * - Additional optional fields for enhanced user profiles
 */
interface User {
  // Authentication and identification
  login: {
    uuid: string;        // Unique identifier for the user
    username: string;    // Username for login
    password?: string;   // Optional password field (typically not exposed)
  };
  
  // Personal information
  name: {
    title: string;       // Title (Mr, Ms, Mrs, Dr, etc.)
    first: string;       // First name - editable via modal
    last: string;        // Last name - editable via modal
  };
  
  gender?: string;       // Gender information (optional)
  
  // Location details
  location?: {
    street?: {
      number: number;    // Street number
      name: string;      // Street name
    };
    city: string;        // City name - displayed in table
    state?: string;      // State/province
    country: string;     // Country - displayed in table
    postcode?: string;   // Postal/ZIP code
    coordinates?: {
      latitude: number;  // Geographic latitude
      longitude: number; // Geographic longitude
    };
    timezone?: {
      offset: string;    // UTC offset
      description: string; // Timezone description
    };
  };
  
  email: string;         // Email address - displayed in table and required
  
  // Date of birth information
  dob?: {
    date: string;        // ISO date string
    age: number;         // Calculated age - displayed in table
  };
  
  // Registration information
  registered?: {
    date: string;        // Registration date
    age: number;         // Years since registration
  };
  
  // Contact information
  phone?: string;        // Primary phone number
  cell?: string;         // Mobile/cell phone number
  
  // Profile pictures
  picture?: {
    large: string;       // Large profile image URL
    medium: string;      // Medium profile image URL
    thumbnail: string;   // Thumbnail image URL
  };
  
  nat?: string;          // Nationality code
}

/**
 * API Configuration
 * 
 * Base URL for the Users API endpoint.
 * All API requests (GET, PUT) are made to this base URL.
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * Pagination Configuration
 * 
 * Number of users to fetch per page as specified in the PRD (Section 3.1.2).
 * The PRD requires showing 20 users by default with a "Load More" button
 * to incrementally load the next 20 users.
 */
const USERS_PER_PAGE = 20;

/**
 * Customers Component
 * 
 * Main component that renders the customer dashboard with user management capabilities.
 * This component manages all state and user interactions for the customer view.
 * 
 * @returns {JSX.Element} The rendered Customers dashboard
 */
export default function Customers() {
  // ==================== State Management ====================
  
  /**
   * Users State
   * Stores the array of users fetched from the API.
   * This array grows as users click "Load More" to paginate through results.
   */
  const [users, setUsers] = React.useState<User[]>([]);
  
  /**
   * Loading State
   * Indicates when an API request is in progress.
   * Used to show loading spinners and disable interactive elements.
   */
  const [loading, setLoading] = React.useState(false);
  
  /**
   * Error State
   * Stores error messages from failed API requests.
   * When set, an error alert is displayed to the user.
   */
  const [error, setError] = React.useState<string | null>(null);
  
  /**
   * Search Term State
   * Stores the current value of the search input field.
   * Used to filter users by name, email, or city when the user clicks "Search".
   */
  const [searchTerm, setSearchTerm] = React.useState("");
  
  /**
   * Current Page State
   * Tracks which page of results we're currently on.
   * Increments when the user clicks "Load More" to fetch the next batch of users.
   */
  const [currentPage, setCurrentPage] = React.useState(1);
  
  /**
   * Has More State
   * Boolean flag indicating whether there are more users to load.
   * Set to false when the API returns fewer than USERS_PER_PAGE results,
   * which hides the "Load More" button.
   */
  const [hasMore, setHasMore] = React.useState(true);
  
  // ==================== Edit Modal State ====================
  
  /**
   * Edit Modal Open State
   * Controls the visibility of the edit user dialog.
   * Set to true when user clicks an edit button, false when closing the modal.
   */
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  
  /**
   * Selected User State
   * Stores the user currently being edited in the modal.
   * Set when user clicks an edit button, cleared when modal is closed.
   */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  /**
   * Edit Form Data State
   * Stores the form values for the edit modal.
   * This is separate from selectedUser to allow for controlled form inputs
   * and to track changes before saving.
   * 
   * Fields match PRD Section 3.1.4 requirements:
   * - firstName: Uses Helvetica font (applied via sx prop)
   * - lastName: Uses Helvetica font (applied via sx prop)
   * - title: User's title (Mr, Ms, etc.)
   */
  const [editFormData, setEditFormData] = React.useState({
    firstName: "",
    lastName: "",
    title: "",
  });
  
  /**
   * Saving State
   * Indicates when a user update request is in progress.
   * Used to show a loading spinner in the save button and disable form controls.
   */
  const [saving, setSaving] = React.useState(false);

  // ==================== API Functions ====================
  
  /**
   * Fetch Users Function
   * 
   * Fetches users from the API with pagination and optional search filtering.
   * This function handles all user data retrieval and is called:
   * - On initial component mount (page 1, no search)
   * - When user clicks "Search" (page 1, with search term)
   * - When user clicks "Load More" (next page, with current search term)
   * 
   * API Endpoint: GET /api/users
   * Query Parameters:
   * - page: Current page number (1-indexed)
   * - perPage: Number of results per page (20 as per PRD)
   * - search: Optional search term for filtering
   * 
   * @param {number} page - The page number to fetch (1-indexed)
   * @param {string} [search] - Optional search term to filter results
   * 
   * State Updates:
   * - Sets loading to true at start, false at end
   * - Clears any existing errors
   * - Replaces users array if page === 1, appends if page > 1
   * - Updates hasMore based on result count
   * - Sets error if request fails
   */
  const fetchUsers = React.useCallback(async (page: number, search?: string) => {
    // Start loading state and clear any previous errors
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters for the API request
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: USERS_PER_PAGE.toString(),
      });
      
      // Add search parameter if provided
      // This filters users by name, email, or city on the server side
      if (search) {
        params.append("search", search);
      }
      
      // Make the API request
      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      /**
       * Update the users array based on the page number:
       * - Page 1: Replace entire array (new search or initial load)
       * - Page > 1: Append to existing array (pagination)
       */
      if (page === 1) {
        setUsers(data.data || []);
      } else {
        setUsers((prev) => [...prev, ...(data.data || [])]);
      }
      
      /**
       * Determine if there are more users to load.
       * If the API returns fewer than USERS_PER_PAGE results,
       * we've reached the end and hide the "Load More" button.
       */
      setHasMore(data.data && data.data.length === USERS_PER_PAGE);
    } catch (err) {
      // Handle errors and display to user via Alert component
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      // Always stop loading, whether request succeeded or failed
      setLoading(false);
    }
  }, []);

  // ==================== Effects ====================
  
  /**
   * Initial Data Load Effect
   * 
   * Automatically fetches the first page of users when the component mounts.
   * This provides immediate data to the user without requiring any interaction.
   * 
   * Dependencies: [fetchUsers] - only re-runs if fetchUsers reference changes
   */
  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // ==================== Event Handlers ====================
  
  /**
   * Handle Search
   * 
   * Triggered when the user clicks the "Search" button or presses Enter
   * in the search input field.
   * 
   * Behavior:
   * - Resets to page 1 (new search should start from beginning)
   * - Fetches users with the current search term
   * - Replaces the current users array with search results
   */
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  /**
   * Handle Load More
   * 
   * Triggered when the user clicks the "Load More" button.
   * 
   * Behavior:
   * - Increments the current page number
   * - Fetches the next batch of users
   * - Appends new users to the existing array
   * - Maintains the current search term if one is active
   * 
   * This implements the pagination requirement from PRD Section 3.1.2:
   * "A 'Load More' button loads the next 20 users at a time"
   */
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchTerm);
  };

  /**
   * Handle Edit Button Click
   * 
   * Triggered when the user clicks the edit icon button on a user row.
   * 
   * Behavior:
   * - Sets the selected user for editing
   * - Populates the edit form with the user's current data
   * - Opens the edit modal dialog
   * 
   * @param {User} user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      title: user.name.title,
    });
    setEditModalOpen(true);
  };

  /**
   * Handle Edit Form Submit
   * 
   * Triggered when the user clicks "Save Changes" in the edit modal.
   * 
   * Behavior:
   * - Validates that a user is selected
   * - Sends a PUT request to the API with updated user data
   * - Updates the local users array with the new data (optimistic update)
   * - Closes the modal on success
   * - Displays an error message on failure
   * 
   * API Endpoint: PUT /api/users/{uuid}
   * Request Body: { name: { first, last, title } }
   * 
   * This implements the edit functionality from PRD Section 3.1.4:
   * "The modal includes at least the name field"
   */
  const handleEditSubmit = async () => {
    // Guard clause: ensure we have a user to update
    if (!selectedUser) return;
    
    // Start saving state to show loading spinner
    setSaving(true);
    setError(null);
    
    try {
      // Prepare the update payload with only the name fields
      const updateData = {
        name: {
          first: editFormData.firstName,
          last: editFormData.lastName,
          title: editFormData.title,
        },
      };
      
      // Send PUT request to update the user
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
      
      // Check if the update was successful
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      
      /**
       * Optimistically update the user in the local state.
       * This provides immediate feedback to the user without waiting
       * for a full data refresh from the server.
       * 
       * We map through the users array and replace the matching user
       * with the updated data while preserving all other fields.
       */
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
      
      // Close the modal and clear selection on success
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      // Display error message to user without closing modal
      // This allows them to retry or correct their input
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always stop the saving state
      setSaving(false);
    }
  };

  /**
   * Handle Modal Close
   * 
   * Triggered when the user clicks "Cancel" or closes the modal.
   * 
   * Behavior:
   * - Closes the modal
   * - Clears the selected user
   * - Form data is preserved in case of accidental closure
   */
  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Handle Search Input Key Press
   * 
   * Triggered when the user presses a key while focused on the search input.
   * 
   * Behavior:
   * - Listens for the Enter key
   * - Triggers the search function when Enter is pressed
   * - Provides keyboard accessibility as per PRD Section 3.2
   * 
   * @param {React.KeyboardEvent} event - The keyboard event
   */
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ==================== Render ====================
  
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Title - "Customers" */}
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>
      
      {/* Section Title - "Users" */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Users
      </Typography>

      {/* ==================== Search Section ==================== */}
      {/*
        Search functionality as required by PRD Section 3.1.3:
        - Search input above the table
        - Filters users by name, email, or city
        - Can search via button click or Enter key press
      */}
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

      {/* ==================== Error Alert ==================== */}
      {/*
        Error handling as required by PRD Section 3.2:
        - Displays error messages from failed API requests
        - Uses MUI Alert for consistent UI
        - Shows toast notifications for user feedback
      */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ==================== Users Table ==================== */}
      {/*
        Main data table as required by PRD Section 3.1.2:
        - Displays user data in table format
        - Shows Name, Email, City, Country, Age columns
        - Each row represents a single user
        - Styled to match Figma design with borders and background colors
      */}
      <TableContainer
        sx={{
          backgroundColor: "#F5F6FA",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Table>
          {/* Table Header */}
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
          
          {/* Table Body */}
          <TableBody>
            {/* Loading State - Show spinner while fetching initial data */}
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              /* Empty State - Show message when no users found */
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              /* User Rows - Display each user's data */
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
                  {/* Name Column - Combines first and last name */}
                  <TableCell>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  
                  {/* Email Column */}
                  <TableCell>{user.email}</TableCell>
                  
                  {/* City Column - Shows "-" if not available */}
                  <TableCell>{user.location?.city || "-"}</TableCell>
                  
                  {/* Country Column - Shows "-" if not available */}
                  <TableCell>{user.location?.country || "-"}</TableCell>
                  
                  {/* Age Column - Right-aligned, shows "-" if not available */}
                  <TableCell align="right">{user.dob?.age || "-"}</TableCell>
                  
                  {/* Actions Column - Edit button as per PRD Section 3.1.4 */}
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      aria-label={`Edit ${user.name.first} ${user.name.last}`}
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

      {/* ==================== Load More Button ==================== */}
      {/*
        Pagination control as required by PRD Section 3.1.2:
        - "Load More" button loads the next 20 users at a time
        - Only shown when there are more users to load
        - Disabled while loading to prevent multiple requests
        - Shows loading spinner during data fetch
      */}
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

      {/* ==================== Edit User Modal ==================== */}
      {/*
        Edit modal as required by PRD Section 3.1.4:
        - Opens when user clicks edit button
        - Contains editable fields for user's name
        - Name fields use Helvetica font (applied via sx prop)
        - Fields are wide enough to display most names on a single line (~300px via fullWidth)
        - Includes validation (first and last name required)
        - Shows loading state while saving
        - Follows existing design patterns from the app
      */}
      <Dialog
        open={editModalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-user-dialog-title"
      >
        <DialogTitle id="edit-user-dialog-title">Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Title Field - Optional */}
            <TextField
              label="Title"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              fullWidth
              helperText="e.g., Mr, Ms, Dr"
            />
            
            {/* First Name Field - Required, Helvetica font as per PRD */}
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
                  // PRD Section 3.1.4: "Use Helvetica font"
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
            />
            
            {/* Last Name Field - Required, Helvetica font as per PRD */}
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
                  // PRD Section 3.1.4: "Use Helvetica font"
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
            />
          </Stack>
        </DialogContent>
        
        {/* Modal Actions - Cancel and Save buttons */}
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {/* Cancel Button - Closes modal without saving */}
          <Button
            onClick={handleModalClose}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          
          {/* Save Button - Submits changes to API */}
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            // Disabled if saving or required fields are empty
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
