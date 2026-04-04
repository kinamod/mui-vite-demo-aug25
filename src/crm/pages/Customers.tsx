/**
 * Customers Page Component
 * 
 * This component implements the Customer Dashboard Enhancement as specified in the PRD.
 * It provides a searchable, paginated table of users with editing capabilities.
 * 
 * Key Features:
 * - Displays users in a table format (20 users per page by default)
 * - Search functionality by name, email, or city
 * - Pagination with "Load More" button
 * - Edit user modal for updating user names
 * - Integration with Users API for data fetching and updates
 * 
 * Design Specifications:
 * - Uses Inter font for table content (as per Figma design)
 * - Uses Poppins font for Search button (as per Figma design)
 * - Uses Helvetica font for name input fields in modal (PRD requirement)
 * - Matches color scheme from Figma: #FCFCFC, #F5F6FA, #0B0E14, etc.
 */

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

/**
 * User Interface
 * 
 * Represents the structure of a user object returned from the Users API.
 * This matches the API response format from https://user-api.builder-io.workers.dev/api/users
 * 
 * The interface includes all user properties but we primarily display:
 * - Name (first + last)
 * - Email
 * - City
 * - Country
 * - Age
 */
interface User {
  login: {
    uuid: string; // Unique identifier for each user
    username: string;
  };
  name: {
    title: string; // Mr, Mrs, Ms, etc.
    first: string; // First name (editable)
    last: string; // Last name (editable)
  };
  email: string; // User's email address
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string; // Displayed in table
    state: string;
    country: string; // Displayed in table
    postcode: string;
  };
  dob: {
    date: string; // Birth date
    age: number; // Displayed in table
  };
}

/**
 * API Response Interface
 * 
 * Structure returned by the Users API for paginated requests.
 * Helps with pagination logic and determining if more data is available.
 */
interface ApiResponse {
  page: number; // Current page number
  perPage: number; // Number of items per page
  total: number; // Total number of users available
  data: User[]; // Array of user objects
}

export default function Customers() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Users Data State
   * 
   * Stores the list of users currently displayed in the table.
   * When "Load More" is clicked, new users are appended to this array.
   * When searching, this array is replaced with filtered results.
   */
  const [users, setUsers] = React.useState<User[]>([]);
  
  /**
   * Loading State
   * 
   * Tracks whether data is currently being fetched from the API.
   * Used to show loading spinners and prevent duplicate requests.
   */
  const [loading, setLoading] = React.useState(false);
  
  /**
   * Error State
   * 
   * Stores error messages for both fetch and update operations.
   * Displayed to users via an Alert component for better UX.
   */
  const [error, setError] = React.useState<string | null>(null);
  
  /**
   * Pagination State
   * 
   * Tracks the current page number for the "Load More" functionality.
   * Incremented when user clicks "Load More" button.
   */
  const [page, setPage] = React.useState(1);
  
  /**
   * Total Users Count
   * 
   * Total number of users available from the API.
   * Used to determine if "Load More" button should be shown.
   */
  const [total, setTotal] = React.useState(0);
  
  /**
   * Search Query State
   * 
   * The actual search query sent to the API.
   * Updated only when user clicks Search button or presses Enter.
   * Separate from searchInput to allow typing without triggering API calls.
   */
  const [searchQuery, setSearchQuery] = React.useState("");
  
  /**
   * Search Input State
   * 
   * Tracks the current value in the search text field.
   * Updated on every keystroke. Converted to searchQuery on submit.
   * This two-state approach prevents API calls on every keystroke.
   */
  const [searchInput, setSearchInput] = React.useState("");
  
  /**
   * Edit Modal State
   * 
   * Controls whether the edit user modal is open or closed.
   * Modal opens when user clicks edit button for a specific user.
   */
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  
  /**
   * Selected User State
   * 
   * Stores the user object currently being edited in the modal.
   * Set when edit button is clicked, cleared when modal closes.
   */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  /**
   * Edit Form Fields
   * 
   * Separate state for first and last name in the edit modal.
   * Allows controlled form inputs and validation before saving.
   * PRD Requirement: Name field must use Helvetica font and be ~300px wide.
   */
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  
  /**
   * Saving State
   * 
   * Tracks whether a user update is currently in progress.
   * Used to disable Save button and show loading spinner during save.
   */
  const [saving, setSaving] = React.useState(false);

  /**
   * Pagination Configuration
   * 
   * PRD Requirement: Display 20 users by default, load 20 more at a time.
   */
  const perPage = 20;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  /**
   * Fetch Users Function
   * 
   * Fetches user data from the Users API with pagination and search support.
   * 
   * @param pageNum - Page number to fetch (1-indexed)
   * @param search - Optional search query to filter results
   * @param append - If true, append results to existing users; if false, replace them
   * 
   * API Endpoint: https://user-api.builder-io.workers.dev/api/users
   * Query Parameters:
   * - page: Page number
   * - perPage: Number of results per page
   * - search: Optional search query (filters by name, email, city)
   * 
   * PRD Requirements Fulfilled:
   * - Fetch data from Users API
   * - Support pagination (20 users at a time)
   * - Support search filtering
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "", append: boolean = false) => {
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        // Build query parameters for API request
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
        });

        // Add search parameter if provided
        if (search) {
          params.append("search", search);
        }

        // Make API request
        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: ApiResponse = await response.json();

        /**
         * Update Users State
         * 
         * If append=true (Load More), add new users to existing list.
         * If append=false (new search or initial load), replace entire list.
         */
        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        // Update pagination state
        setTotal(data.total);
        setPage(pageNum);
      } catch (err) {
        // Handle errors gracefully and display to user
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Initial Data Load Effect
   * 
   * Fetches users when component mounts or when search query changes.
   * Always fetches page 1 when search query changes to reset pagination.
   */
  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [fetchUsers, searchQuery]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle Search Submit
   * 
   * Triggered when user clicks Search button or presses Enter in search field.
   * Updates the searchQuery state, which triggers a new API call via useEffect.
   * 
   * PRD Requirement: Search filters by user names (and also email/city)
   */
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  /**
   * Handle Load More
   * 
   * Loads the next page of users and appends them to the existing list.
   * 
   * PRD Requirement: "Load More" button loads next 20 users at a time
   */
  const handleLoadMore = () => {
    fetchUsers(page + 1, searchQuery, true);
  };

  /**
   * Handle Edit Button Click
   * 
   * Opens the edit modal and populates form fields with selected user's data.
   * 
   * @param user - The user object to edit
   * 
   * PRD Requirement: Each row has "Edit" button that opens modal
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFirstName(user.name.first);
    setEditLastName(user.name.last);
    setEditModalOpen(true);
  };

  /**
   * Handle Modal Close
   * 
   * Closes the edit modal and resets all related state.
   * Called when user clicks Cancel or closes modal via backdrop/escape.
   */
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditFirstName("");
    setEditLastName("");
  };

  /**
   * Handle Save User
   * 
   * Saves updated user information to the API via PUT request.
   * On success, updates the local state to reflect changes without refetching.
   * 
   * API Endpoint: PUT https://user-api.builder-io.workers.dev/api/users/{uuid}
   * Request Body: { name: { first, last } }
   * 
   * PRD Requirements Fulfilled:
   * - Update user via API (PUT request)
   * - Modal includes name field (first and last)
   * - Name field uses Helvetica font
   */
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError(null);

    try {
      // Make PUT request to update user
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: editFirstName,
              last: editLastName,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      /**
       * Optimistic UI Update
       * 
       * Update the local users array immediately without refetching.
       * This provides instant feedback to the user.
       * If we refetched, pagination state might be lost.
       */
      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editFirstName,
                  last: editLastName,
                },
              }
            : user
        )
      );

      // Close modal on success
      handleCloseModal();
    } catch (err) {
      // Show error to user but keep modal open so they can retry
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Calculate if More Data is Available
   * 
   * Determines if "Load More" button should be shown.
   * True if current number of loaded users is less than total available.
   */
  const hasMore = users.length < total;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* 
        PAGE HEADER
        
        PRD Requirement: Dashboard integrated within Customers tab
        Displays "Customers" as main heading and "Users" as section heading
      */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 0.5, fontWeight: 600 }}
      >
        Customers
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 2, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {/* 
        SEARCH BAR
        
        PRD Requirements:
        - Search input above table
        - Search filters by user names (also email and city)
        - Real-time or on submit (implemented as on submit)
        
        Design Notes:
        - 363px width matches Figma design
        - #FCFCFC background color from Figma
        - Poppins font for Search button as specified in Figma
        - Enter key triggers search for better UX
      */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: 363,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#FFF",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            fontSize: "20px",
            px: 3,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Stack>

      {/* 
        ERROR ALERT
        
        Displays API errors or save errors to the user.
        Non-Functional Requirement: Include error handling for failed requests
      */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 
        USERS TABLE
        
        PRD Requirements:
        - Display user data in table format
        - Each row represents a single user
        - Show 20 users by default
        - Users can scroll to see all loaded entries
        - Edit button in each row
        
        Design Specifications from Figma:
        - Table background: #F5F6FA
        - Header background: #FCFCFC
        - Border color: #0B0E14 (0.5px)
        - Font: Inter for all table content
        - 8px border radius for container
        
        Columns Displayed:
        1. Name (first + last)
        2. Email
        3. City
        4. Country
        5. Age (right-aligned)
        6. Actions (edit button, center-aligned)
      */}
      <TableContainer
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          mb: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                City
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
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
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
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
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 
              LOADING STATE
              
              Show spinner when fetching initial data.
              Covers entire table area for clear feedback.
            */}
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              /* 
                EMPTY STATE
                
                Shown when search returns no results or API has no data.
              */
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              /* 
                USER ROWS
                
                Map through users array to display each user in a row.
                Each row is interactive with hover effect for better UX.
                
                Key Design Details:
                - Inter font for all content
                - 16px font size
                - 0.5px border between rows (#0B0E14)
                - Subtle hover effect for interactivity
              */
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
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.name.first} {user.name.last}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.location.city}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.location.country}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
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
                    {/* 
                      EDIT BUTTON
                      
                      PRD Requirement: Each row has "Edit" button
                      
                      Design from Figma:
                      - 40x40px size
                      - 8px border radius
                      - Border: 1px solid #DADEE7
                      - Background: rgba(245, 246, 250, 0.30)
                      - Edit icon color: #0B0E14
                    */}
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

      {/* 
        LOAD MORE BUTTON
        
        PRD Requirements:
        - "Load More" button loads next 20 users at a time
        - Button should only show when more data is available
        
        Visibility Logic:
        - Show only if: hasMore (users.length < total)
        - Hide if: loading (prevents duplicate requests)
        - Hide if: all users loaded
        
        Design from Figma:
        - Center-aligned
        - Rounded corners (8px)
        - Border: 1px solid #DADEE7
        - Background: rgba(245, 246, 250, 0.30)
        - Inter font, 16px, weight 500
      */}
      {hasMore && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              px: 3,
              py: 1,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
                border: "1px solid #DADEE7",
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {/* 
        LOADING INDICATOR FOR PAGINATION
        
        Shows small spinner when loading more users (not initial load).
        Provides feedback that "Load More" action is in progress.
      */}
      {loading && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* 
        EDIT USER MODAL
        
        PRD Requirements:
        - Modal for editing user information
        - Name field with Helvetica font
        - Name field wide enough for most names (300px or character-based)
        - Modal should not lose user's place in dashboard
        
        Implementation Details:
        - Material-UI Dialog component (fullWidth, maxWidth="sm")
        - Two text fields: First Name and Last Name
        - Helvetica font applied to input fields
        - minWidth: 300px on inputs (PRD requirement)
        - Save button disabled if fields empty or while saving
        - Cancel button closes modal without saving
        - Clicking backdrop or pressing Escape closes modal
        
        Non-Functional Requirements:
        - UI Consistency: Follows existing MUI design patterns
        - Accessibility: Dialog is keyboard navigable and screen reader friendly
      */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* 
              FIRST NAME INPUT
              
              PRD Requirements:
              - Use Helvetica font
              - Wide enough to display most names on single line (~300px)
            */}
            <TextField
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
            {/* 
              LAST NAME INPUT
              
              Same styling as First Name for consistency.
              Both fields required for save button to be enabled.
            */}
            <TextField
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {/* 
            CANCEL BUTTON
            
            Closes modal without saving changes.
            Resets all modal-related state.
          */}
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          {/* 
            SAVE BUTTON
            
            Submits changes to API and updates local state.
            
            Disabled States:
            - While saving (saving=true)
            - If first name is empty
            - If last name is empty
            
            Shows loading spinner while saving for user feedback.
          */}
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving || !editFirstName || !editLastName}
            sx={{ textTransform: "none" }}
          >
            {saving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
