/**
 * Customers Page Component
 * 
 * This component displays a searchable, paginated table of customer data
 * fetched from the Users API. It includes functionality to:
 * - Search users by name, email, or city
 * - Display users in a custom-styled table matching Figma design
 * - Edit user information through a modal dialog
 * - Load more users with pagination
 * 
 * API Integration: https://user-api.builder-io.workers.dev/api/users
 */

import * as React from "react";
// MUI Core Components for layout and structure
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
// MUI Icons
import EditIcon from "@mui/icons-material/Edit";
// MUI Styling utilities
import { styled } from "@mui/material/styles";

/**
 * User Interface
 * Defines the structure of user data returned from the API.
 * This matches the schema from https://user-api.builder-io.workers.dev/api/users
 */
interface User {
  login: {
    uuid: string;        // Unique identifier for the user
    username: string;    // Username for login
  };
  name: {
    title: string;       // Mr, Ms, Mrs, etc.
    first: string;       // First name
    last: string;        // Last name
  };
  email: string;         // User's email address
  location: {
    city: string;        // City of residence
    country: string;     // Country of residence
  };
  dob: {
    age: number;         // Calculated age from date of birth
  };
}

/**
 * Styled Table Container
 * Wraps the entire table with consistent styling matching the Figma design.
 * Uses a light gray background with rounded corners.
 */
const StyledTableContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#F5F6FA",
  borderRadius: "8px",
  overflow: "hidden",
  marginTop: "24px",
}));

/**
 * Table Header Row
 * Displays column headers for the user table.
 * Uses CSS Grid for precise column width control matching Figma specifications.
 * Column widths: Name(215px), Email(346px), City(250px), Country(163px), Age(77px), Actions(107px)
 */
const TableHeader = styled(Box)({
  display: "grid",
  gridTemplateColumns: "215px 346px 250px 163px 77px 107px",
  backgroundColor: "#FCFCFC",
  borderBottom: "0.5px solid #0B0E14",
  height: "36px",
  alignItems: "center",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 500,
});

/**
 * Table Data Row
 * Individual row component for displaying user data.
 * Uses the same grid structure as TableHeader for alignment.
 * Each row has a bottom border for visual separation.
 */
const TableRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "215px 346px 250px 163px 77px 107px",
  borderBottom: "0.5px solid #0B0E14",
  height: "53px",
  alignItems: "center",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 400,
});

/**
 * Search Button Component
 * Primary action button for triggering user search.
 * Styled with blue background (updated from original black per user preference).
 * Includes subtle shadow effects for depth.
 */
const SearchButton = styled(Button)({
  background: "rgba(0, 42, 113, 1)",
  backgroundColor: "rgba(0, 42, 113, 1)",
  border: "1px solid #333C4D",
  borderRadius: "8px",
  color: "#FFF",
  fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "24.5px",
  textTransform: "none",
  height: "40px",
  padding: "0 24px",
  "&:hover": {
    backgroundColor: "rgba(0, 42, 113, 0.9)",  // Slightly lighter on hover
  },
  boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
});

/**
 * Load More Button Component
 * Secondary button for pagination - loads additional users.
 * Lighter styling compared to primary search button.
 */
const LoadMoreButton = styled(Button)({
  border: "1px solid #DADEE7",
  borderRadius: "8px",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  color: "#000",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24.5px",
  textTransform: "none",
  height: "40px",
  padding: "0 16px",
  margin: "16px auto",
  display: "block",
});

/**
 * Edit Icon Button Component
 * Small action button displayed in each table row.
 * Opens the edit modal when clicked.
 */
const EditButton = styled(IconButton)({
  border: "1px solid #DADEE7",
  borderRadius: "8px",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  width: "40px",
  height: "40px",
});

/**
 * Main Customers Component
 * Manages state and renders the complete customers page including:
 * - Page title and subtitle
 * - Search input and button
 * - User data table
 * - Pagination controls
 * - Edit user modal
 */
export default function Customers() {
  // ============== STATE MANAGEMENT ==============
  
  /**
   * users: Array of user objects fetched from the API
   * Updated on initial load, search, and pagination
   */
  const [users, setUsers] = React.useState<User[]>([]);
  
  /**
   * searchQuery: Current value in the search input field
   * Updated on each keystroke, used when search button is clicked
   */
  const [searchQuery, setSearchQuery] = React.useState("");
  
  /**
   * currentSearch: The last executed search term
   * Used for maintaining context during pagination
   */
  const [currentSearch, setCurrentSearch] = React.useState("");
  
  /**
   * loading: Indicates if an API request is in progress
   * Used to disable buttons and show loading states
   */
  const [loading, setLoading] = React.useState(false);
  
  /**
   * page: Current page number for pagination
   * Starts at 1, increments with "Load More"
   */
  const [page, setPage] = React.useState(1);
  
  /**
   * total: Total number of users matching current search
   * Used to determine if "Load More" button should be shown
   */
  const [total, setTotal] = React.useState(0);
  
  /**
   * editingUser: User currently being edited in the modal
   * null when modal is closed, populated when edit button is clicked
   */
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  /**
   * editFormData: Form field values in the edit modal
   * Separate from editingUser to allow canceling changes
   */
  const [editFormData, setEditFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  // Number of users to fetch per page
  const perPage = 20;

  // ============== API FUNCTIONS ==============
  
  /**
   * Fetches users from the API with optional search and pagination
   * 
   * @param searchTerm - Optional search string to filter users
   * @param pageNum - Page number to fetch (default: 1)
   * 
   * API Endpoint: GET /api/users
   * Query Params:
   * - page: Page number
   * - perPage: Number of results per page
   * - search: Optional search term (searches name, email, city)
   * 
   * On pageNum === 1: Replaces current users list
   * On pageNum > 1: Appends to existing users list (pagination)
   */
  const fetchUsers = async (searchTerm: string = "", pageNum: number = 1) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        perPage: perPage.toString(),
      });

      // Add search term if provided
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      // Make API request
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`
      );
      const data = await response.json();

      // Update users list based on page number
      if (pageNum === 1) {
        // First page: replace entire list
        setUsers(data.data || []);
      } else {
        // Subsequent pages: append to existing list
        setUsers((prev) => [...prev, ...(data.data || [])]);
      }
      
      // Update total count for pagination logic
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Load initial users on component mount
   * Runs once when component first renders
   */
  React.useEffect(() => {
    fetchUsers();
  }, []);

  // ============== EVENT HANDLERS ==============
  
  /**
   * Handles search button click
   * Resets pagination and fetches users matching the search query
   */
  const handleSearch = () => {
    setCurrentSearch(searchQuery);
    setPage(1);
    fetchUsers(searchQuery, 1);
  };

  /**
   * Handles "Load More" button click
   * Increments page number and fetches next page of results
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(currentSearch, nextPage);
  };

  /**
   * Opens edit modal and populates form with user data
   * 
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    // Pre-fill form fields with current user data
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
  };

  /**
   * Closes the edit modal without saving
   * Resets editingUser to null
   */
  const handleCloseModal = () => {
    setEditingUser(null);
  };

  /**
   * Updates a single field in the edit form
   * 
   * @param field - The form field to update
   * @param value - The new value for the field
   */
  const handleFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Saves edited user data to the API
   * 
   * API Endpoint: PUT /api/users/:uuid
   * Request Body: Updated user data (name, email, location)
   * 
   * On Success:
   * - Refreshes the users list to show updated data
   * - Resets pagination to page 1
   * - Closes the edit modal
   */
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${editingUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: editFormData.firstName,
              last: editFormData.lastName,
            },
            email: editFormData.email,
            location: {
              city: editFormData.city,
              country: editFormData.country,
            },
          }),
        }
      );

      if (response.ok) {
        // Refresh the users list to show updated data
        fetchUsers(currentSearch, 1);
        setPage(1);
        handleCloseModal();
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  /**
   * Handles keyboard input in search field
   * Triggers search when Enter key is pressed
   * 
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ============== RENDER ==============
  
  return (
    <Box sx={{ width: "100%", maxWidth: "1161px", p: 0 }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "36px",
          mb: "16px",
        }}
      >
        Customers
      </Typography>

      {/* Section Subtitle */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
          mb: "16px",
        }}
      >
        Users
      </Typography>

      {/* Search Bar Section */}
      <Box sx={{ display: "flex", gap: "8px", mb: "24px", alignItems: "center" }}>
        {/* Search Input Field */}
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              borderRadius: "8px",
              border: "1px solid rgba(194, 201, 214, 0.40)",
              backgroundColor: "#FCFCFC",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              "& fieldset": {
                border: "none",  // Remove default MUI border
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
        />
        
        {/* Search Button - Triggers search on click */}
        <SearchButton onClick={handleSearch} disabled={loading}>
          Search
        </SearchButton>
      </Box>

      {/* Users Table */}
      <StyledTableContainer>
        {/* Table Header Row with Column Names */}
        <TableHeader>
          <Box sx={{ pl: "16px" }}>Name</Box>
          <Box sx={{ pl: "16px" }}>Email</Box>
          <Box sx={{ pl: "16px" }}>City</Box>
          <Box sx={{ pl: "16px" }}>Country</Box>
          <Box sx={{ textAlign: "right", pr: "16px" }}>Age</Box>
          <Box sx={{ textAlign: "center" }}>Actions</Box>
        </TableHeader>

        {/* Table Body - Map through users array to create rows */}
        {users.map((user) => (
          <TableRow key={user.login.uuid}>
            {/* User Full Name */}
            <Box sx={{ pl: "16px" }}>
              {user.name.first} {user.name.last}
            </Box>
            
            {/* Email Address */}
            <Box sx={{ pl: "16px" }}>{user.email}</Box>
            
            {/* City of Residence */}
            <Box sx={{ pl: "16px" }}>{user.location.city}</Box>
            
            {/* Country of Residence */}
            <Box sx={{ pl: "16px" }}>{user.location.country}</Box>
            
            {/* Age - Right-aligned */}
            <Box sx={{ textAlign: "right", pr: "16px" }}>{user.dob.age}</Box>
            
            {/* Edit Action Button */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <EditButton onClick={() => handleEditClick(user)}>
                <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
              </EditButton>
            </Box>
          </TableRow>
        ))}
      </StyledTableContainer>

      {/* Load More Button - Only shown if more users are available */}
      {users.length < total && (
        <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </LoadMoreButton>
      )}

      {/* Edit User Modal Dialog */}
      <Dialog
        open={!!editingUser}  // Open when editingUser is not null
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Edit User
        </DialogTitle>
        
        {/* Modal Content - Form Fields */}
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px" }}>
            {/* First Name Input */}
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) => handleFormChange("firstName", e.target.value)}
              fullWidth
            />
            
            {/* Last Name Input */}
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => handleFormChange("lastName", e.target.value)}
              fullWidth
            />
            
            {/* Email Input */}
            <TextField
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              fullWidth
            />
            
            {/* City Input */}
            <TextField
              label="City"
              value={editFormData.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
              fullWidth
            />
            
            {/* Country Input */}
            <TextField
              label="Country"
              value={editFormData.country}
              onChange={(e) => handleFormChange("country", e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        
        {/* Modal Footer - Action Buttons */}
        <DialogActions sx={{ p: "16px 24px" }}>
          {/* Cancel Button - Closes modal without saving */}
          <Button
            onClick={handleCloseModal}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          
          {/* Save Button - Submits changes to API */}
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
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
