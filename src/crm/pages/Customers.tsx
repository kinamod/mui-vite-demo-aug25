/**
 * Customers Page Component
 *
 * This component displays a searchable, paginated table of users fetched from
 * the Users API. It allows editing user details through a modal interface.
 *
 * Features:
 * - Display 20 users per page with pagination
 * - Search users by name, email, or city
 * - Edit user names through a modal dialog
 * - Responsive table layout matching Figma design
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
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";

// Base URL for the Users API
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * Type Definitions
 * These interfaces match the structure returned by the Users API
 */

/** User name structure with title, first name, and last name */
interface UserName {
  title: string;
  first: string;
  last: string;
}

/** User location details including street, city, state, country */
interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
}

/** User date of birth information */
interface UserDob {
  date: string;
  age: number;
}

/** Complete user object structure from API */
interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: UserName;
  email: string;
  location: UserLocation;
  dob: UserDob;
  gender: string;
}

/** API response structure for paginated user list */
interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
  alignItems: "stretch",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: "#F5F6FA",
  borderRadius: theme.spacing(1),
  "& .MuiTableHead-root": {
    backgroundColor: "#FCFCFC",
  },
  "& .MuiTableCell-head": {
    fontWeight: 500,
    borderBottom: "0.5px solid #0B0E14",
    backgroundColor: "#FCFCFC",
  },
  "& .MuiTableCell-body": {
    borderBottom: "0.5px solid #0B0E14",
  },
  "& .MuiTableRow-root:last-child .MuiTableCell-body": {
    borderBottom: "0.5px solid #0B0E14",
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(0deg, #05070A 0%, #05070A 100%), linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)",
  backgroundColor: "#05070A",
  color: "#FFF",
  border: "1px solid #333C4D",
  boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
  padding: theme.spacing(1, 3),
  borderRadius: theme.spacing(1),
  textTransform: "none",
  fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  minWidth: "126px",
  height: "40px",
  "&:hover": {
    backgroundColor: "#0B0E14",
  },
}));

const EditButton = styled(IconButton)(({ theme }) => ({
  width: "40px",
  height: "40px",
  borderRadius: theme.spacing(1),
  border: "1px solid #DADEE7",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  "&:hover": {
    backgroundColor: "rgba(245, 246, 250, 0.50)",
  },
}));

const LoadMoreButton = styled(Button)(({ theme }) => ({
  width: "107px",
  height: "40px",
  borderRadius: theme.spacing(1),
  border: "1px solid #DADEE7",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  color: "#000",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "16px",
  "&:hover": {
    backgroundColor: "rgba(245, 246, 250, 0.50)",
  },
}));

const HelveticaTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    fontFamily: "Helvetica, Arial, sans-serif",
  },
});

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (page: number, search: string = "", append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          perPage: perPage.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`${API_BASE_URL}/users?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: ApiResponse = await response.json();

        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        setTotalUsers(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery, false);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFirstName(user.name.first);
    setEditLastName(user.name.last);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditFirstName("");
    setEditLastName("");
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              title: selectedUser.name.title,
              first: editFirstName,
              last: editLastName,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update local state
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

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const hasMoreUsers = users.length < totalUsers;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "36px",
          mb: 2,
        }}
      >
        Customers
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 600,
          fontSize: "20px",
          lineHeight: "26.68px",
          mb: 3,
        }}
      >
        Users
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SearchContainer>
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
            flex: 1,
            maxWidth: "363px",
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              border: "1px solid rgba(194, 201, 214, 0.40)",
              "& fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          Search
        </SearchButton>
      </SearchContainer>

      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "215px" }}>Name</TableCell>
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
          </TableHead>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.login.uuid}>
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
                    <EditButton
                      onClick={() => handleEditClick(user)}
                      aria-label="Edit user"
                    >
                      <EditIcon sx={{ color: "#0B0E14" }} />
                    </EditButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {hasMoreUsers && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </LoadMoreButton>
        </Box>
      )}

      {/* Edit User Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <HelveticaTextField
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  minWidth: "300px",
                },
              }}
            />
            <HelveticaTextField
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  minWidth: "300px",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving || !editFirstName || !editLastName}
          >
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
