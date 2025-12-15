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
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";

/**
 * User interface representing the data structure from the Users API
 * This matches the response format from https://user-api.builder-io.workers.dev/api
 */
interface User {
  login: {
    uuid: string; // Unique identifier for the user
    username: string; // User's login username
  };
  name: {
    title: string; // Title (Mr, Mrs, Ms, etc.)
    first: string; // First name
    last: string; // Last name
  };
  email: string; // User's email address
  location: {
    street: {
      number: number; // Street number
      name: string; // Street name
    };
    city: string; // City name
    state: string; // State or province
    country: string; // Country name
    postcode: string; // Postal/ZIP code
  };
  dob: {
    date: string; // Date of birth (ISO format)
    age: number; // Calculated age
  };
}

// Base URL for the Users API endpoint
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * Customers Component
 * Displays a searchable, paginated table of customer/user data
 * with edit functionality via modal dialog
 */
export default function Customers() {
  // State to store the array of users fetched from the API
  const [users, setUsers] = React.useState<User[]>([]);
  
  // Loading state to show/hide loading indicator during API calls
  const [loading, setLoading] = React.useState(false);
  
  // Error state to store and display any error messages
  const [error, setError] = React.useState<string | null>(null);
  
  // Search query string entered by the user
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Current page number for pagination (starts at 1)
  const [page, setPage] = React.useState(1);
  
  // Flag to determine if more data is available for pagination
  const [hasMore, setHasMore] = React.useState(true);
  
  // Controls visibility of the edit user modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  
  // Stores the user currently being edited
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  // Form state for editing user information
  const [editForm, setEditForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  // Number of users to fetch per page
  const perPage = 20;

  /**
   * Fetches users from the API with optional search and pagination
   * @param pageNum - The page number to fetch (1-indexed)
   * @param search - Optional search query to filter users
   * @param append - If true, appends results to existing users; otherwise replaces them
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "", append: boolean = false) => {
      // Set loading state to show spinner/indicator
      setLoading(true);
      
      // Clear any previous errors
      setError(null);
      
      try {
        // Build query parameters for the API request
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
          // Only include search param if a search query exists
          ...(search && { search }),
        });

        // Make API request to fetch users
        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        
        // Check if the response was successful
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        
        // Parse the JSON response
        const data = await response.json();

        // Update users state based on append flag
        if (append) {
          // Append mode: Add new users to existing list (for pagination)
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          // Replace mode: Replace entire list (for new search or initial load)
          setUsers(data.data);
        }

        // Determine if more data is available for pagination
        // If we received fewer items than perPage, we've reached the end
        setHasMore(data.data.length === perPage);
      } catch (err) {
        // Handle and store any errors that occurred during fetch
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        // Always set loading to false when request completes
        setLoading(false);
      }
    },
    [] // Empty dependency array since this function doesn't depend on external values
  );

  /**
   * Effect hook that triggers when searchQuery changes
   * Automatically fetches users with the new search query
   */
  React.useEffect(() => {
    // Fetch first page with current search query
    fetchUsers(1, searchQuery);
    
    // Reset page to 1 when search query changes
    setPage(1);
  }, [searchQuery, fetchUsers]);

  /**
   * Handles the search button click
   * Resets pagination and fetches users with the current search query
   */
  const handleSearch = () => {
    // Fetch first page with current search query
    fetchUsers(1, searchQuery);
    
    // Reset to first page
    setPage(1);
  };

  /**
   * Handles the "Load More" button click
   * Fetches the next page of users and appends to the current list
   */
  const handleLoadMore = () => {
    // Calculate next page number
    const nextPage = page + 1;
    
    // Update page state
    setPage(nextPage);
    
    // Fetch next page and append results to existing users
    fetchUsers(nextPage, searchQuery, true);
  };

  /**
   * Opens the edit modal and populates it with the selected user's data
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    // Store the user being edited
    setSelectedUser(user);
    
    // Populate the edit form with user's current data
    setEditForm({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
    
    // Open the edit modal
    setEditModalOpen(true);
  };

  /**
   * Submits the edited user data to the API
   * Updates the user in the local state if successful
   */
  const handleEditSubmit = async () => {
    // Ensure a user is selected before proceeding
    if (!selectedUser) return;

    try {
      // Make PUT request to update user data
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // Send only the fields that can be edited
          body: JSON.stringify({
            name: {
              first: editForm.firstName,
              last: editForm.lastName,
            },
            email: editForm.email,
            location: {
              city: editForm.city,
              country: editForm.country,
            },
          }),
        }
      );

      // Check if the update was successful
      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update the user in the local state to reflect changes immediately
      setUsers((prev) =>
        prev.map((user) =>
          // Find the user by UUID and update their data
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editForm.firstName,
                  last: editForm.lastName,
                },
                email: editForm.email,
                location: {
                  ...user.location,
                  city: editForm.city,
                  country: editForm.country,
                },
              }
            : user // Return unchanged user if UUID doesn't match
        )
      );

      // Close the modal after successful update
      setEditModalOpen(false);
      
      // Clear the selected user
      setSelectedUser(null);
    } catch (err) {
      // Handle and display any errors that occurred during update
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 1, fontWeight: 600, fontSize: "24px" }}
      >
        Customers
      </Typography>
      
      {/* Subtitle */}
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {/* Error Alert - Only shown when error state has a value */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        {/* Search Input Field */}
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            // Allow search on Enter key press
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
              borderRadius: "8px",
              fontSize: "16px",
            },
          }}
        />
        
        {/* Search Button */}
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            height: "40px",
            borderRadius: "8px",
            px: 4,
            backgroundColor: "#05070A",
            color: "#FFF",
            fontWeight: 500,
            fontSize: "20px",
            textTransform: "none",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Users Table */}
      <TableContainer
        sx={{
          borderRadius: "8px",
          border: "none",
        }}
      >
        <Table>
          {/* Table Header */}
          <TableHead>
            <TableRow
              sx={{
                borderBottom: "0.5px solid #0B0E14",
              }}
            >
              {/* Name Column Header */}
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "215px",
                  py: 1.5,
                }}
              >
                Name
              </TableCell>
              
              {/* Email Column Header */}
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "346px",
                  py: 1.5,
                }}
              >
                Email
              </TableCell>
              
              {/* City Column Header */}
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "250px",
                  py: 1.5,
                }}
              >
                City
              </TableCell>
              
              {/* Country Column Header */}
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "163px",
                  py: 1.5,
                }}
              >
                Country
              </TableCell>
              
              {/* Age Column Header (right-aligned) */}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "77px",
                  py: 1.5,
                }}
              >
                Age
              </TableCell>
              
              {/* Actions Column Header (center-aligned) */}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "107px",
                  py: 1.5,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          
          {/* Table Body - Maps through users array to display each user */}
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.login.uuid} // Use UUID as unique key for React reconciliation
                sx={{
                  borderBottom: "0.5px solid #0B0E14",
                  "&:last-child": {
                    borderBottom: "0.5px solid #0B0E14",
                  },
                }}
              >
                {/* User Full Name Cell */}
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.name.first} {user.name.last}
                </TableCell>
                
                {/* Email Cell */}
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.email}
                </TableCell>
                
                {/* City Cell */}
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.location.city}
                </TableCell>
                
                {/* Country Cell */}
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.location.country}
                </TableCell>
                
                {/* Age Cell (right-aligned) */}
                <TableCell
                  align="right"
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.dob.age}
                </TableCell>
                
                {/* Actions Cell - Contains Edit Button */}
                <TableCell align="center" sx={{ py: 2 }}>
                  <IconButton
                    onClick={() => handleEditClick(user)}
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid #DADEE7",
                    }}
                  >
                    <EditIcon sx={{ fontSize: 24, color: "#0B0E14" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Loading Indicator - Shown during API requests */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State - Shown when no users are found and not loading */}
      {!loading && users.length === 0 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No users found
          </Typography>
        </Box>
      )}

      {/* Load More Button - Only shown when more data is available */}
      {hasMore && users.length > 0 && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              height: "40px",
              borderRadius: "8px",
              px: 3,
              border: "1px solid #DADEE7",
              color: "#000",
              fontWeight: 500,
              fontSize: "16px",
              textTransform: "none",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              "&:hover": {
                border: "1px solid #0B0E14",
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {/* Edit User Modal Dialog */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            minWidth: 500,
            maxWidth: 600,
            p: 2,
          }}
        >
          <CardContent>
            {/* Modal Title */}
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Edit User
            </Typography>
            
            {/* Edit Form Fields */}
            <Stack spacing={2}>
              {/* First Name Input */}
              <TextField
                label="First Name"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
                fullWidth
              />
              
              {/* Last Name Input */}
              <TextField
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
                fullWidth
              />
              
              {/* Email Input */}
              <TextField
                label="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                fullWidth
              />
              
              {/* City Input */}
              <TextField
                label="City"
                value={editForm.city}
                onChange={(e) =>
                  setEditForm({ ...editForm, city: e.target.value })
                }
                fullWidth
              />
              
              {/* Country Input */}
              <TextField
                label="Country"
                value={editForm.country}
                onChange={(e) =>
                  setEditForm({ ...editForm, country: e.target.value })
                }
                fullWidth
              />
              
              {/* Modal Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {/* Save Button - Submits the edited data */}
                <Button
                  variant="contained"
                  onClick={handleEditSubmit}
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  Save Changes
                </Button>
                
                {/* Cancel Button - Closes modal without saving */}
                <Button
                  variant="outlined"
                  onClick={() => setEditModalOpen(false)}
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
}
