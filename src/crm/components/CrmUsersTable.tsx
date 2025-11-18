import * as React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CrmEditUserModal from "./CrmEditUserModal";

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
    city: string;
    country: string;
  };
  dob: {
    age: number;
  };
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function CrmUsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        if (pageNum === 1) {
          setUsers(data.data);
        } else {
          setUsers((prev) => [...prev, ...data.data]);
        }

        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [perPage]
  );

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.login.uuid === updatedUser.login.uuid ? updatedUser : u
      )
    );
    setEditingUser(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 600, fontSize: "24px", lineHeight: "36px" }}
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
          alignItems: "center",
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
            width: { xs: "100%", sm: "363px" },
            "& .MuiOutlinedInput-root": {
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              "& input": {
                fontSize: "16px",
                color: "#999",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            height: "40px",
            minWidth: "126px",
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#FFF",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            textTransform: "none",
            border: "1px solid #333C4D",
            boxShadow:
              "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
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
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          boxShadow: "none",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-head": {
                  backgroundColor: "#FCFCFC",
                  borderBottom: "0.5px solid #0B0E14",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  padding: "6px 16px",
                  height: "36px",
                },
              }}
            >
              <TableCell sx={{ width: "215px" }}>Name</TableCell>
              <TableCell sx={{ width: "346px" }}>Email</TableCell>
              <TableCell sx={{ width: "250px" }}>City</TableCell>
              <TableCell sx={{ width: "163px" }}>Country</TableCell>
              <TableCell align="right" sx={{ width: "77px" }}>
                Age
              </TableCell>
              <TableCell align="center" sx={{ width: "107px" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.login.uuid}
                sx={{
                  "& .MuiTableCell-body": {
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    padding: "16px",
                    height: "53px",
                  },
                }}
              >
                <TableCell>
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.location.city}</TableCell>
                <TableCell>{user.location.country}</TableCell>
                <TableCell align="right">{user.dob.age}</TableCell>
                <TableCell align="center">
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
                    <EditIcon sx={{ width: "24px", height: "24px" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && page === 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && users.length < total && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              width: "107px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24.5px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}

      {editingUser && (
        <CrmEditUserModal
          user={editingUser}
          open={!!editingUser}
          onClose={handleCloseModal}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Box>
  );
}
