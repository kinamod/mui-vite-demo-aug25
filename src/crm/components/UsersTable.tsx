import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useState, useEffect } from "react";
import EditUserModal from "./EditUserModal";

/**
 * Base URL for the Users API
 * This API provides endpoints for fetching, searching, and managing user data
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * User interface representing the structure of user data from the API
 * This matches the response format from the Users API
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
    city: string; // City where user is located
    country: string; // Country where user is located
  };
  dob: {
    age: number; // User's age
  };
}

/**
 * UsersTable Component
 * 
 * Main component for displaying and managing customer data in the CRM dashboard.
 * Implements the requirements from the PRD including:
 * 
 * Features:
 * - Displays users in a paginated table format
 * - Shows 20 users per page with "Load More" functionality
 * - Search capability by name, email, or city
 * - Edit functionality via modal dialog
 * - Responsive design matching Figma specifications
 * - Uses Inter font family for consistent typography
 * 
 * Table Columns:
 * - Name (215px)
 * - Email (346px)
 * - City (250px)
 * - Country (163px)
 * - Age (77px, right-aligned)
 * - Actions (107px, centered) - Contains edit button
 * 
 * @returns {JSX.Element} Complete users table with search and pagination
 */
export default function UsersTable() {
  // State for user data and table management
  const [users, setUsers] = useState<User[]>([]); // Array of user objects to display
  const [loading, setLoading] = useState(false); // Loading state for API requests
  const [page, setPage] = useState(1); // Current page number for pagination
  const [total, setTotal] = useState(0); // Total number of users available from API
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState(""); // Active search query used in API call
  const [searchInput, setSearchInput] = useState(""); // User's input in search field (before submit)
  
  // State for edit modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // User currently being edited
  const [modalOpen, setModalOpen] = useState(false); // Controls modal visibility
  
  // Constant for pagination - matches PRD requirement of 20 users per page
  const perPage = 20;

  /**
   * Fetches users from the API with pagination and optional search
   * 
   * @param {number} pageNum - Page number to fetch (1-based)
   * @param {string} search - Optional search query for filtering users
   * 
   * API Parameters:
   * - page: Current page number
   * - perPage: Number of results per page (20)
   * - search: Search term for filtering (optional)
   * 
   * The API searches across name, email, and city fields
   */
  const fetchUsers = async (pageNum: number, search: string = "") => {
    setLoading(true);
    try {
      // Build URL with query parameters
      const url = new URL(`${API_BASE_URL}/users`);
      url.searchParams.append("page", pageNum.toString());
      url.searchParams.append("perPage", perPage.toString());
      if (search) {
        url.searchParams.append("search", search);
      }

      // Fetch data from API
      const response = await fetch(url.toString());
      const data = await response.json();

      // If fetching page 1, replace existing users
      // Otherwise, append new users for "Load More" functionality
      if (pageNum === 1) {
        setUsers(data.data);
      } else {
        setUsers((prev) => [...prev, ...data.data]);
      }
      
      // Update total count for pagination logic
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      // Always reset loading state, whether fetch succeeded or failed
      setLoading(false);
    }
  };

  /**
   * Effect hook that triggers when searchQuery changes
   * Resets to page 1 and fetches fresh data with the new search query
   */
  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [searchQuery]);

  /**
   * Handles "Load More" button click
   * Increments page number and fetches next batch of users
   * New users are appended to existing list (see fetchUsers logic)
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  /**
   * Handles search submission when user clicks "Search" button
   * Updates searchQuery state which triggers useEffect to fetch filtered results
   * Resets page to 1 for new search
   */
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  /**
   * Handles Enter key press in search input field
   * Allows users to submit search by pressing Enter instead of clicking button
   * 
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Opens edit modal for the selected user
   * 
   * @param {User} user - User object to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  /**
   * Closes edit modal and clears selected user
   */
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Callback from EditUserModal when user is successfully updated
   * Updates the user in the local state to reflect changes immediately
   * without requiring a full table refresh
   * 
   * @param {User} updatedUser - User object with updated information
   */
  const handleUserUpdate = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.login.uuid === updatedUser.login.uuid ? updatedUser : u
      )
    );
  };

  // Calculate if there are more users to load
  // Used to show/hide "Load More" button
  const hasMore = users.length < total;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Title - "Customers" */}
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

      {/* Section Title - "Users" */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 2,
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
        }}
      >
        Users
      </Typography>

      {/* Search Bar Section */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {/* Search Input Field */}
        {/* Width set to 363px as per Figma design */}
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          size="small"
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(194, 201, 214, 0.40)",
            },
          }}
        />
        
        {/* Search Button */}
        {/* Styled to match Figma design with dark background and specific shadows */}
        <Button
          onClick={handleSearch}
          variant="contained"
          sx={{
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#FFF",
            textTransform: "none",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            minWidth: "126px",
            height: "42px",
            boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Stack>

      {/* Users Table Container */}
      {/* Background color #F5F6FA as per Figma design */}
      <TableContainer
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          overflow: "auto",
        }}
      >
        <Table sx={{ minWidth: 1157 }}>
          {/* Table Header */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              {/* Name Column Header */}
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "215px", // Column width from Figma
                }}
              >
                Name
              </TableCell>
              
              {/* Email Column Header */}
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "346px", // Column width from Figma
                }}
              >
                Email
              </TableCell>
              
              {/* City Column Header */}
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "250px", // Column width from Figma
                }}
              >
                City
              </TableCell>
              
              {/* Country Column Header */}
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "163px", // Column width from Figma
                }}
              >
                Country
              </TableCell>
              
              {/* Age Column Header - Right aligned */}
              <TableCell
                align="right"
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "77px", // Column width from Figma
                }}
              >
                Age
              </TableCell>
              
              {/* Actions Column Header - Center aligned */}
              <TableCell
                align="center"
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "107px", // Column width from Figma
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          
          {/* Table Body - Rows of user data */}
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.login.uuid}>
                {/* Name Cell - Displays full name */}
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.name.first} {user.name.last}
                </TableCell>
                
                {/* Email Cell */}
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.email}
                </TableCell>
                
                {/* City Cell */}
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.city}
                </TableCell>
                
                {/* Country Cell */}
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.country}
                </TableCell>
                
                {/* Age Cell - Right aligned */}
                <TableCell
                  align="right"
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.dob.age}
                </TableCell>
                
                {/* Actions Cell - Contains edit button */}
                <TableCell
                  align="center"
                  sx={{ borderBottom: "0.5px solid #0B0E14" }}
                >
                  {/* Edit Button - Opens modal for editing user */}
                  <IconButton
                    onClick={() => handleEditClick(user)}
                    size="small"
                    aria-label={`Edit ${user.name.first} ${user.name.last}`}
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid #DADEE7",
                      backgroundColor: "rgba(245, 246, 250, 0.30)",
                      "&:hover": {
                        backgroundColor: "rgba(245, 246, 250, 0.60)",
                      },
                    }}
                  >
                    <EditRoundedIcon
                      sx={{ fontSize: "24px", color: "#0B0E14" }}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More Button Section */}
      {/* Only shown if there are more users available to load */}
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              textTransform: "none",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24.5px",
              minWidth: "107px",
              height: "40px",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.60)",
                borderColor: "#DADEE7",
              },
            }}
          >
            {/* Button text changes based on loading state */}
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}

      {/* Edit User Modal */}
      {/* Only rendered when a user is selected for editing */}
      {selectedUser && (
        <EditUserModal
          open={modalOpen}
          user={selectedUser}
          onClose={handleModalClose}
          onUpdate={handleUserUpdate}
        />
      )}
    </Box>
  );
}
