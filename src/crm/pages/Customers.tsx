import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Stack from "@mui/material/Stack";
import EditUserModal from "../components/EditUserModal";

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

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(
          "https://user-api.builder-io.workers.dev/api/users"
        );
        url.searchParams.append("page", pageNum.toString());
        url.searchParams.append("perPage", perPage.toString());
        if (search) {
          url.searchParams.append("search", search);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        if (pageNum === 1) {
          setUsers(data.data || []);
        } else {
          setUsers((prev) => [...prev, ...(data.data || [])]);
        }

        setHasMore(
          data.data && data.data.length === perPage && pageNum * perPage < data.total
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
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
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>

      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Users
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{
            minWidth: "300px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
          }}
        >
          Search
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        sx={{
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 500 }} align="right">
                Age
              </TableCell>
              <TableCell sx={{ fontWeight: 500 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.login.uuid} hover>
                <TableCell>
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
                    aria-label="Edit user"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && hasMore && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 4,
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {!loading && users.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            No users found. Try adjusting your search.
          </Typography>
        </Box>
      )}

      <EditUserModal
        open={modalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
