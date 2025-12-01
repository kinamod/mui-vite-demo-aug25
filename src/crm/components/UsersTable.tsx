import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { usersApi, type User } from "../services/usersApi";
import EditUserModal from "./EditUserModal";

export default function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchUsers = React.useCallback(
    async (page: number, search: string, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await usersApi.getUsers({
          page,
          perPage: 20,
          search: search || undefined,
        });

        if (append) {
          setUsers((prev) => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }

        setHasMore(response.data.length === 20);
      } catch (err) {
        setError("Failed to load users. Please try again.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(1, searchTerm, false);
  }, [searchTerm, fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchTerm, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      await usersApi.updateUser(selectedUser.login.uuid, userData);
      
      setUsers((prev) =>
        prev.map((u) =>
          u.login.uuid === selectedUser.login.uuid
            ? { ...u, ...userData }
            : u
        )
      );

      setSnackbar({
        open: true,
        message: "User updated successfully",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to update user",
        severity: "error",
      });
      throw err;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              fontSize: "24px",
              lineHeight: "36px",
              mb: 1,
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
        </Box>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <TextField
            placeholder="Search users by name, email, or city"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            size="small"
            sx={{
              width: 363,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FCFCFC",
                borderRadius: "8px",
                fontSize: "16px",
                "& fieldset": {
                  borderColor: "rgba(194, 201, 214, 0.40)",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#999",
                opacity: 1,
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
              fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "20px",
              fontWeight: 500,
              lineHeight: "24.5px",
              textTransform: "none",
              px: 3,
              py: 1,
              minWidth: 126,
              height: 40,
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer
          sx={{
            borderRadius: "8px",
            backgroundColor: "#F5F6FA",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#FCFCFC",
                  "& th": {
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    color: "#000",
                    py: 1.5,
                  },
                }}
              >
                <TableCell sx={{ pl: 2 }}>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Age</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.login.uuid}
                  sx={{
                    "& td": {
                      borderBottom: "0.5px solid #0B0E14",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "20.02px",
                      color: "#000",
                      py: 2,
                    },
                  }}
                >
                  <TableCell sx={{ pl: 2 }}>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.location.city}</TableCell>
                  <TableCell>{user.location.country}</TableCell>
                  <TableCell align="right">{user.dob.age}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        border: "1px solid #DADEE7",
                        backgroundColor: "rgba(245, 246, 250, 0.30)",
                        "&:hover": {
                          backgroundColor: "rgba(245, 246, 250, 0.60)",
                        },
                      }}
                    >
                      <EditRoundedIcon
                        sx={{ width: 24, height: 24, color: "#0B0E14" }}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {hasMore && !loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={loadingMore}
              sx={{
                borderRadius: "8px",
                border: "1px solid #DADEE7",
                backgroundColor: "rgba(245, 246, 250, 0.30)",
                color: "#000",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24.5px",
                textTransform: "none",
                px: 2,
                py: 1,
                minWidth: 107,
                height: 40,
                "&:hover": {
                  backgroundColor: "rgba(245, 246, 250, 0.60)",
                  borderColor: "#DADEE7",
                },
              }}
            >
              {loadingMore ? (
                <CircularProgress size={20} />
              ) : (
                "Load More"
              )}
            </Button>
          </Box>
        )}
      </Stack>

      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveUser}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
