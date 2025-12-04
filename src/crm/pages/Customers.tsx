/**
 * Customers Page Component
 *
 * This component implements the Customer Dashboard Enhancement as specified in the PRD.
 * It provides a searchable, paginated table of users with editing capabilities.
 *
 * Key Features:
 * - Displays users in a table format (PRD 3.1.2)
 * - Shows 20 users by default with "Load More" pagination (PRD 3.1.2)
 * - Search functionality for filtering by name, email, or city (PRD 3.1.3)
 * - Edit button in each row that opens a modal (PRD 3.1.4)
 * - Error handling and loading states (PRD 3.2)
 *
 * Design matching Figma specifications with Inter font family and specific styling.
 */

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
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { usersApi, User } from "../services/usersApi";
import EditUserModal from "../components/EditUserModal";

export default function Customers() {
  // State management for user data and UI

  /** Array of user objects fetched from the API */
  const [users, setUsers] = React.useState<User[]>([]);

  /** Loading state for API requests */
  const [loading, setLoading] = React.useState(false);

  /** Error message to display if API requests fail */
  const [error, setError] = React.useState<string | null>(null);

  /** Current search query entered by the user */
  const [searchQuery, setSearchQuery] = React.useState("");

  /** Current page number for pagination (1-indexed) */
  const [page, setPage] = React.useState(1);

  /** Flag indicating if more users are available to load */
  const [hasMore, setHasMore] = React.useState(true);

  /** Controls visibility of the edit user modal */
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  /** The user currently selected for editing */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  /**
   * Load users from the API with pagination and search support
   *
   * This function handles fetching user data from the Users API. It supports
   * both initial loads and "Load More" pagination scenarios.
   *
   * Per PRD 3.1.2: Table must show 20 users by default with "Load More" functionality
   * Per PRD 3.1.3: Search filters the table by user names, email, or city
   *
   * @param pageNum - Page number to fetch (1-indexed)
   * @param search - Search query string to filter results
   * @param append - If true, append results to existing users; if false, replace all users
   */
  const loadUsers = React.useCallback(
    async (pageNum: number, search: string, append: boolean = false) => {
      try {
        // Set loading state and clear any previous errors
        setLoading(true);
        setError(null);

        // Fetch users from API with pagination and search parameters
        const response = await usersApi.getUsers({
          page: pageNum,
          perPage: 20, // PRD requirement: 20 users by default
          search: search || undefined,
        });

        // Either append to existing users or replace them entirely
        if (append) {
          setUsers((prev) => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }

        // Check if more users are available for pagination
        // If we got less than 20 users, we've reached the end
        setHasMore(response.data.length === 20);
      } catch (err) {
        // Per PRD 6: Include error handling for failed API requests
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Initial data load effect
   * Fetches the first page of users when the component mounts
   */
  React.useEffect(() => {
    loadUsers(1, searchQuery, false);
  }, []);

  /**
   * Handle search button click
   * Resets pagination to page 1 and loads users matching the search query
   * Per PRD 3.1.3: Search applies to user names at minimum
   */
  const handleSearch = () => {
    setPage(1);
    loadUsers(1, searchQuery, false);
  };

  /**
   * Handle "Load More" button click
   * Fetches the next page of users and appends them to the current list
   * Per PRD 3.1.2: "Load More" button loads the next 20 users at a time
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage, searchQuery, true);
  };

  /**
   * Handle edit button click in table row
   * Opens the edit modal with the selected user's data
   * Per PRD 3.1.4: Each row has an "Edit" button that opens a modal
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  /**
   * Handle save action from the edit modal
   * Updates the user via API and refreshes the local state
   *
   * Per PRD 6: Use the existing Users API for performing user updates (PATCH/PUT)
   *
   * @param userId - UUID of the user being updated
   * @param firstName - Updated first name
   * @param lastName - Updated last name
   */
  const handleSaveUser = async (
    userId: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      // Call API to update user data
      await usersApi.updateUser(userId, {
        name: { first: firstName, last: lastName },
      });

      // Update local state to reflect the changes without refetching all users
      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === userId
            ? {
                ...user,
                name: { ...user.name, first: firstName, last: lastName },
              }
            : user
        )
      );

      // Close modal and clear selected user
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      // Per PRD 6: Include error handling for failed API requests
      setError("Failed to update user. Please try again.");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/*
        Page Header: "Customers"
        Per PRD 3.1.1: A new Users dashboard is embedded within the Customers tab
        Matches Figma design: 24px font, 600 weight, 36px line height
      */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "36px",
        }}
      >
        Customers
      </Typography>

      {/*
        Section Header: "Users"
        Indicates this is the Users view within the Customers page
        Matches Figma design: 20px font, 600 weight, 26.68px line height
      */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 3,
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
        }}
      >
        Users
      </Typography>

      {/*
        Search Bar Section
        Per PRD 3.1.3: A search input is provided above the table
        Matches Figma design with exact styling
      */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {/*
          Search Input Field
          - Placeholder text per PRD: "Search users by name, email, or city"
          - 363px width to match Figma design
          - Enter key triggers search for better UX
        */}
        <TextField
          placeholder="Search users by name, email, or city"
          variant="outlined"
          size="medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
            "& input": {
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
            },
            "& ::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
        />

        {/*
          Search Button
          Styled to match Figma design with dark gradient background
          Uses Poppins font (20px) as specified in design
          Disabled during loading to prevent duplicate requests
        */}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            background:
              "linear-gradient(0deg, #05070A 0%, #05070A 100%), linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)",
            backgroundColor: "#05070A",
            color: "#FFF",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 500,
            textTransform: "none",
            px: 3,
            boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
            border: "1px solid #333C4D",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Stack>

      {/*
        Error Alert
        Per PRD 6: Include error handling for failed API requests
        Displays toast-like notifications when API calls fail
      */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/*
        Users Table
        Per PRD 3.1.2: Display user data in a table format
        - Each row represents a single user
        - The table must show 20 users by default
        - Users can scroll to see all loaded entries

        Matches Figma design with:
        - #F5F6FA background color
        - 8px border radius
        - 0.5px solid borders (#0B0E14)
        - Inter font family
      */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          boxShadow: "none",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          {/*
            Table Header Row
            Displays column names: Name, Email, City, Country, Age, Actions
            Per PRD 5: Use consistent column spacing for readability
          */}
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#FCFCFC",
                borderBottom: "0.5px solid #0B0E14",
              }}
            >
              {/* Name column header */}
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Name
              </TableCell>

              {/* Email column header */}
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Email
              </TableCell>

              {/* City column header */}
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                City
              </TableCell>

              {/* Country column header */}
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Country
              </TableCell>

              {/* Age column header - right aligned for numeric data */}
              <TableCell
                align="right"
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Age
              </TableCell>

              {/* Actions column header - center aligned */}
              <TableCell
                align="center"
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          {/*
            Table Body - User Rows
            Maps through the users array to create a row for each user
            Per PRD 3.1.2: Each row represents a single user
          */}
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.login.uuid}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                {/* User's full name (first + last) */}
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.name.first} {user.name.last}
                </TableCell>

                {/* User's email address */}
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.email}
                </TableCell>

                {/* User's city location */}
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.city}
                </TableCell>

                {/* User's country */}
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.country}
                </TableCell>

                {/* User's age - right aligned */}
                <TableCell
                  align="right"
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.dob.age}
                </TableCell>

                {/*
                  Actions column with Edit button
                  Per PRD 3.1.4: Each row has an "Edit" button that opens a modal
                  Styled to match Figma design: 40x40px, rounded, light background
                */}
                <TableCell
                  align="center"
                  sx={{ borderBottom: "0.5px solid #0B0E14" }}
                >
                  <IconButton
                    onClick={() => handleEditClick(user)}
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
                    <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/*
        Loading Indicator
        Displays a centered spinner while fetching data from the API
        Per PRD 3.2: Performance - Pagination helps ensure responsiveness
      */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/*
        Load More Button
        Per PRD 3.1.2: A "Load More" button loads the next 20 users at a time
        Only shown when:
        - Not currently loading
        - More users are available (hasMore is true)
        - At least some users have been loaded

        Matches Figma design with light background and border
      */}
      {!loading && hasMore && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              textTransform: "none",
              px: 3,
              py: 1,
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
        Edit User Modal
        Per PRD 3.1.4: Clicking the Edit button opens a modal for editing user information
        - Modal includes the name field (first and last name)
        - Uses Helvetica font for name input
        - Input fields are wide enough to display most names on a single line

        Controlled by editModalOpen state and selectedUser data
      */}
      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </Box>
  );
}
