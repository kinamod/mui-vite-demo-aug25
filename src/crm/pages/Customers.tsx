import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  dob: {
    date: string;
    age: number;
  };
}

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
}

export default function Customers() {
  // Array of user objects fetched from the API
  const [users, setUsers] = React.useState<User[]>([]);

  // Loading state for the main user table fetch operations
  const [loading, setLoading] = React.useState(false);

  // Error message to display if API requests fail
  const [error, setError] = React.useState<string | null>(null);

  // Current search query entered by the user in the search field
  const [searchQuery, setSearchQuery] = React.useState("");

  // Current page number for pagination (1-indexed)
  const [page, setPage] = React.useState(1);

  // Flag indicating whether there are more users to load
  const [hasMore, setHasMore] = React.useState(true);

  // Controls visibility of the edit user modal dialog
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  // The user object currently being edited (null when no user is selected)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Form data for the edit modal with editable user fields
  const [editFormData, setEditFormData] = React.useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  // Loading state specifically for the save operation in the edit modal
  const [saveLoading, setSaveLoading] = React.useState(false);

  // Number of users to fetch per page for pagination
  const perPage = 20;
  // Base URL for the users API endpoint
  const API_BASE = "https://user-api.builder-io.workers.dev/api";

  /**
   * Fetches users from the API with pagination and search support
   * @param pageNum - The page number to fetch (1-indexed)
   * @param search - Optional search query to filter users by name, email, or city
   * @param append - If true, appends results to existing users; if false, replaces them
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string, append = false) => {
      // Set loading state to show spinner to user
      setLoading(true);
      // Clear any previous errors before making new request
      setError(null);

      try {
        // Build query parameters for the API request
        // The API expects: page, perPage, and sortBy parameters
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
          sortBy: "name.first", // Sort users alphabetically by first name
        });

        // Add search parameter only if user has entered a search query
        // This filters users by name, email, or city on the server side
        if (search.trim()) {
          params.append("search", search.trim());
        }

        // Make GET request to fetch users from the API
        // The params are automatically URL-encoded in the query string
        const response = await fetch(`${API_BASE}/users?${params}`);

        // Check if the response was successful (status 200-299)
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        // Parse the JSON response body
        const data = await response.json();

        // Update users state based on append flag
        // append=true: Add new users to existing list (for "Load More" functionality)
        // append=false: Replace entire list (for new searches or initial load)
        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        // Determine if there are more users to load
        // If we received fewer users than requested, we've reached the end
        setHasMore(data.data.length === perPage);
      } catch (err) {
        // Handle any errors from the fetch operation or response parsing
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        // Always stop loading spinner, whether request succeeded or failed
        setLoading(false);
      }
    },
    [] // Empty dependency array means this callback never changes
  );

  // Fetch initial users when component mounts
  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, []);

  /**
   * Handles search button click
   * Resets to page 1 and fetches users matching the search query
   */
  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles "Load More" button click
   * Fetches the next page of users and appends them to the existing list
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Pass append=true to add new users to the existing list
    fetchUsers(nextPage, searchQuery, true);
  };

  /**
   * Opens the edit modal and populates form with selected user's data
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    // Pre-fill the edit form with current user data
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
    setEditModalOpen(true);
  };

  /**
   * Closes the edit modal and clears selected user
   */
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Updates a single field in the edit form
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Saves the edited user data to the API and updates the local state
   * Makes a PUT request to update the user, then updates the UI optimistically
   */
  const handleSaveUser = async () => {
    // Guard clause: don't proceed if no user is selected
    if (!selectedUser) return;

    // Show loading state on the save button
    setSaveLoading(true);
    try {
      // Send PUT request to update user by UUID
      // The API expects partial user data to update specific fields
      const response = await fetch(
        `${API_BASE}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          // Send only the fields that can be edited in the form
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

      // Check if update was successful
      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update the local users array with the edited data
      // This provides immediate feedback without refetching all users
      setUsers((prev) =>
        prev.map((user) =>
          // Find the user by UUID and update their data
          user.login.uuid === selectedUser.login.uuid
            ? {
                // Spread existing user data to preserve unchanged fields
                ...user,
                name: {
                  ...user.name,
                  first: editFormData.firstName,
                  last: editFormData.lastName,
                },
                email: editFormData.email,
                location: {
                  ...user.location,
                  city: editFormData.city,
                  country: editFormData.country,
                },
              }
            : user // Return unchanged for all other users
        )
      );

      // Close the modal after successful save
      handleCloseModal();
    } catch (err) {
      // Display error message to user if save fails
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      // Always stop the loading state, regardless of success or failure
      setSaveLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>
      
      <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Users
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search users by name, email, or city"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: 363,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: "#05070A",
            color: "white",
            textTransform: "none",
            fontSize: "34px",
            px: 3,
            "&:hover": {
              bgcolor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, width: 215 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 346 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 250 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 163 }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 77, textAlign: "right" }}>
                Age
              </TableCell>
              <TableCell sx={{ fontWeight: 500, width: 107, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.login.uuid}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell>
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.location.city}</TableCell>
                <TableCell>{user.location.country}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {user.dob.age}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(user)}
                    sx={{
                      border: "1px solid",
                      borderColor: "#DADEE7",
                      borderRadius: 1,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && users.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No users found</Typography>
          </Box>
        )}
      </TableContainer>

      {hasMore && !loading && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              textTransform: "none",
              borderColor: "#DADEE7",
              color: "text.primary",
              "&:hover": {
                borderColor: "#DADEE7",
                backgroundColor: "action.hover",
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                value={editFormData.firstName}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                value={editFormData.lastName}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={editFormData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                value={editFormData.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                value={editFormData.country}
                onChange={(e) => handleFormChange("country", e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
