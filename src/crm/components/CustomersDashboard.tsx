import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { listUsers, User } from "../../api/usersApi";
import EditUserModal from "./EditUserModal";

export default function CustomersDashboard() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const perPage = 20;

  const fetchUsers = React.useCallback(async (page: number, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listUsers({
        page,
        perPage,
        search: search || undefined,
      });
      
      if (page === 1) {
        setUsers(response.data);
      } else {
        setUsers((prev) => [...prev, ...response.data]);
      }
      
      setTotalUsers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleUserUpdated = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
    handleModalClose();
  };

  const hasMore = users.length < totalUsers;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "36px",
        }}
      >
        Customers
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: "20px",
          lineHeight: "26.68px",
        }}
      >
        Users
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            minWidth: { xs: "100%", sm: "363px" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FCFCFC",
              borderRadius: "8px",
              height: "40px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            backgroundColor: "#05070A",
            color: "#fff",
            borderRadius: "8px",
            height: "40px",
            minWidth: "126px",
            textTransform: "none",
            fontWeight: 400,
            fontSize: "16px",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Look
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#F5F6FA",
          borderRadius: "8px",
          boxShadow: "none",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#FCFCFC",
                "& th": {
                  borderBottom: "0.5px solid #0B0E14",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  padding: "12px 16px",
                },
              }}
            >
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Age</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.login.uuid}
                  sx={{
                    "& td": {
                      borderBottom: "0.5px solid #0B0E14",
                      fontSize: "16px",
                      lineHeight: "20.02px",
                      padding: "16px",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                  }}
                >
                  <TableCell>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.location.city}</TableCell>
                  <TableCell>{user.location.country}</TableCell>
                  <TableCell>{user.dob.age}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditClick(user)}
                      size="small"
                      aria-label="edit user"
                      sx={{
                        color: "#0B0E14",
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24.5px",
              padding: "8px 16px",
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

      {loading && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {editingUser && (
        <EditUserModal
          open={isModalOpen}
          user={editingUser}
          onClose={handleModalClose}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Box>
  );
}
