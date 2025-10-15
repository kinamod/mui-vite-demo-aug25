import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import EditUserModal from "./EditUserModal";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

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
  gender: string;
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

export default function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "", append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

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
        
        if (append) {
          setUsers((prev) => [...prev, ...(data.data || [])]);
        } else {
          setUsers(data.data || []);
        }

        setHasMore((data.data || []).length === perPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;

    const response = await fetch(
      `${API_BASE_URL}/users/${selectedUser.login.username}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.login.uuid === selectedUser.login.uuid
          ? { ...user, ...updatedUser }
          : user
      )
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 600, fontSize: "24px" }}
      >
        Customers
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{
            width: { xs: "100%", sm: "363px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "#999" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            borderRadius: "8px",
            px: 3,
            py: 1.25,
            background: "linear-gradient(0deg, #05070A 0%, #05070A 100%)",
            color: "#FFF",
            fontSize: "16px",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)",
            },
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer
            sx={{
              borderRadius: "8px",
              backgroundColor: "#F5F6FA",
              border: "none",
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#FCFCFC",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      width: "215px",
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      width: "346px",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      width: "250px",
                    }}
                  >
                    City
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      width: "163px",
                    }}
                  >
                    Country
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      width: "77px",
                    }}
                  >
                    Age
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      width: "107px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.login.uuid}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                      borderBottom: "0.5px solid #0B0E14",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: "16px",
                        borderBottom: "0.5px solid #0B0E14",
                      }}
                    >
                      {user.name.first} {user.name.last}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "16px",
                        borderBottom: "0.5px solid #0B0E14",
                      }}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "16px",
                        borderBottom: "0.5px solid #0B0E14",
                      }}
                    >
                      {user.location.city}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "16px",
                        borderBottom: "0.5px solid #0B0E14",
                      }}
                    >
                      {user.location.country}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: "16px",
                        borderBottom: "0.5px solid #0B0E14",
                      }}
                    >
                      {user.dob.age}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderBottom: "0.5px solid #0B0E14" }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(user)}
                        sx={{
                          borderRadius: "8px",
                          border: "1px solid #DADEE7",
                          backgroundColor: "rgba(245, 246, 250, 0.30)",
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <EditRoundedIcon sx={{ color: "#0B0E14" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  "&:hover": {
                    backgroundColor: "rgba(245, 246, 250, 0.50)",
                    border: "1px solid #DADEE7",
                  },
                }}
              >
                {loadingMore ? <CircularProgress size={24} /> : "Load More"}
              </Button>
            </Box>
          )}
        </>
      )}

      <EditUserModal
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </Box>
  );
}
