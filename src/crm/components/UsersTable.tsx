/**
 * UsersTable Component
 * 
 * A comprehensive table component for displaying and managing user data in the CRM.
 * This component integrates with the Users API to fetch, search, and display users
 * in a paginated table format.
 * 
 * Features:
 * - Displays 20 users per page with pagination
 * - Search functionality by name, email, or city
 * - Load More button for progressive data loading
 * - Edit action for each user row
 * - Loading and error states
 * - Responsive design following Figma specifications
 * 
 * @see PRD: Customer Dashboard Enhancement – Users View
 */

import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

/**
 * User interface definition matching the Users API response structure
 * Represents a single user with their personal and location information
 */
interface User {
  login: {
    uuid: string; // Unique identifier for the user
    username: string; // User's login username
  };
  name: {
    title: string; // Title (Mr., Ms., etc.)
    first: string; // First name
    last: string; // Last name
  };
  email: string; // User's email address
  location: {
    city: string; // City of residence
    country: string; // Country of residence
  };
  dob: {
    age: number; // User's age
  };
}

/**
 * Props interface for UsersTable component
 */
interface UsersTableProps {
  onEditUser: (user: User) => void; // Callback function triggered when edit button is clicked
}

/**
 * Styled table container with custom background and border styling
 * Matches the Figma design specifications (#F5F6FA background)
 */
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: "#F5F6FA",
  borderRadius: "8px",
  boxShadow: "none",
  "& .MuiTableCell-root": {
    borderBottom: "0.5px solid #0B0E14", // Consistent border styling
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: "16px",
  },
}));

/**
 * Styled table header with custom background color
 * Header cells use #FCFCFC background to differentiate from table body
 */
const StyledTableHead = styled(TableHead)({
  "& .MuiTableCell-head": {
    backgroundColor: "#FCFCFC",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#000",
  },
});

/**
 * Styled table row with hover effect
 * Provides visual feedback when user hovers over a row
 */
const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.02)", // Subtle hover effect
  },
});

/**
 * Custom styled edit button matching Figma design
 * Circular icon button with border and semi-transparent background
 */
const EditButton = styled(IconButton)({
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  border: "1px solid #DADEE7",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  "&:hover": {
    backgroundColor: "rgba(245, 246, 250, 0.60)", // Darker on hover
  },
});

/**
 * Custom styled search button with gradient background
 * Uses Poppins font as specified in the Figma design
 * Includes custom box-shadow for depth effect
 */
const SearchButton = styled(Button)({
  background: "linear-gradient(0deg, #05070A 0%, #05070A 100%)",
  color: "#FFF",
  fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  textTransform: "none", // Prevents uppercase transformation
  borderRadius: "8px",
  padding: "8px 24px",
  height: "40px",
  border: "1px solid #333C4D",
  boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000", // Custom shadow from Figma
  "&:hover": {
    background: "linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)", // Slightly lighter on hover
  },
});

/**
 * Custom styled Load More button
 * Matches the design specifications for pagination control
 */
const LoadMoreButton = styled(Button)({
  width: "107px",
  height: "40px",
  borderRadius: "8px",
  border: "1px solid #DADEE7",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  color: "#000",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 500,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "rgba(245, 246, 250, 0.60)", // Darker on hover
  },
});

/**
 * Main UsersTable Component
 * 
 * Manages the display and interaction with user data including:
 * - Fetching users from the API
 * - Search functionality
 * - Pagination with Load More
 * - Edit user action
 * 
 * @param {UsersTableProps} props - Component props
 * @returns {JSX.Element} Rendered table component
 */
export default function UsersTable({ onEditUser }: UsersTableProps) {
  // State: Array of user objects fetched from the API
  const [users, setUsers] = React.useState<User[]>([]);
  
  // State: Loading indicator for API requests
  const [loading, setLoading] = React.useState(false);
  
  // State: Current search term entered by the user
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // State: Current page number for pagination (starts at 1)
  const [page, setPage] = React.useState(1);
  
  // State: Total number of users available in the API
  const [totalUsers, setTotalUsers] = React.useState(0);
  
  // Constant: Number of users to display per page (as per PRD requirement)
  const perPage = 20;

  /**
   * Fetches users from the API with pagination and search support
   * 
   * This function:
   * 1. Constructs the API URL with query parameters
   * 2. Fetches data from the Users API
   * 3. Updates the users state (replaces on page 1, appends on subsequent pages)
   * 4. Handles errors and updates loading state
   * 
   * @param {number} pageNum - The page number to fetch
   * @param {string} search - Optional search term to filter users
   */
  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      setLoading(true);
      try {
        // Construct the API URL with query parameters
        const url = new URL(
          "https://user-api.builder-io.workers.dev/api/users"
        );
        url.searchParams.append("page", pageNum.toString());
        url.searchParams.append("perPage", perPage.toString());
        
        // Add search parameter if search term exists
        if (search) {
          url.searchParams.append("search", search);
        }

        // Fetch data from the API
        const response = await fetch(url.toString());
        const data = await response.json();

        // For page 1, replace the entire user list (new search or initial load)
        // For subsequent pages, append to existing users (Load More functionality)
        if (pageNum === 1) {
          setUsers(data.data || []);
        } else {
          setUsers((prev) => [...prev, ...(data.data || [])]);
        }
        
        // Update total users count for pagination control
        setTotalUsers(data.total || 0);
      } catch (error) {
        // Log errors to console for debugging
        console.error("Error fetching users:", error);
      } finally {
        // Always reset loading state when request completes
        setLoading(false);
      }
    },
    []
  );

  /**
   * Effect: Fetch initial user data on component mount
   * Loads the first page of users when the component is first rendered
   */
  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  /**
   * Handles the search action when the Search button is clicked
   * Resets to page 1 and fetches users with the current search term
   */
  const handleSearch = () => {
    setPage(1); // Reset to first page for new search
    fetchUsers(1, searchTerm);
  };

  /**
   * Handles the Load More button click
   * Increments the page number and fetches the next batch of users
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchTerm);
  };

  /**
   * Handles keyboard events in the search input
   * Triggers search when Enter key is pressed
   * 
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header: "Customers" title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "36px",
          color: "#000",
          mb: 1,
        }}
      >
        Customers
      </Typography>

      {/* Section Header: "Users" subtitle */}
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
          color: "#000",
          mb: 2,
        }}
      >
        Users
      </Typography>

      {/* Search Bar: Text input and Search button */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          sx={{
            width: "363px", // Fixed width as per Figma design
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FCFCFC",
              borderRadius: "8px",
              height: "36px",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(194, 201, 214, 0.60)",
              },
            },
            "& input": {
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              color: "#999",
              padding: "8px 14px",
            },
          }}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          Search
        </SearchButton>
      </Box>

      {/* Users Table: Main data table with headers and rows */}
      <StyledTableContainer component={Paper}>
        <Table>
          {/* Table Header: Column names */}
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: "215px", pl: 2 }}>Name</TableCell>
              <TableCell sx={{ width: "346px" }}>Email</TableCell>
              <TableCell sx={{ width: "250px" }}>City</TableCell>
              <TableCell sx={{ width: "163px" }}>Country</TableCell>
              <TableCell sx={{ width: "77px", textAlign: "right" }}>
                Age
              </TableCell>
              <TableCell sx={{ width: "107px", textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </StyledTableHead>
          
          {/* Table Body: User data rows with conditional rendering */}
          <TableBody>
            {/* Loading State: Show spinner on initial load (page 1) */}
            {loading && page === 1 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              /* Empty State: Display message when no users are found */
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              /* Data Rows: Map through users array and display each user */
              users.map((user) => (
                <StyledTableRow key={user.login.uuid}>
                  {/* Name Column: Display full name (first + last) */}
                  <TableCell sx={{ pl: 2 }}>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  
                  {/* Email Column */}
                  <TableCell>{user.email}</TableCell>
                  
                  {/* City Column */}
                  <TableCell>{user.location.city}</TableCell>
                  
                  {/* Country Column */}
                  <TableCell>{user.location.country}</TableCell>
                  
                  {/* Age Column: Right-aligned for better readability of numbers */}
                  <TableCell sx={{ textAlign: "right" }}>
                    {user.dob.age}
                  </TableCell>
                  
                  {/* Actions Column: Edit button to trigger edit modal */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <EditButton
                      onClick={() => onEditUser(user)}
                      aria-label="edit user"
                    >
                      <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
                    </EditButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Load More Button: Only shown when there are more users to load */}
      {/* Hidden when all users are loaded (users.length >= totalUsers) */}
      {users.length < totalUsers && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </LoadMoreButton>
        </Box>
      )}
    </Box>
  );
}
