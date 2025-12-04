import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditUserModal from "./EditUserModal";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string | number;
}

interface UserName {
  title: string;
  first: string;
  last: string;
}

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: UserName;
  email: string;
  location: UserLocation;
  dob: {
    date: string;
    age: number;
  };
  gender: string;
}

export default function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

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
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();

        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        setHasMore(data.data.length === perPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [fetchUsers, searchQuery]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.login.uuid === updatedUser.login.uuid ? updatedUser : user,
      ),
    );
    handleCloseModal();
  };

  const getFullName = (name: UserName) => {
    return `${name.first} ${name.last}`;
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
        Customers
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      <Card variant="outlined" sx={{ backgroundColor: "#F5F6FA" }}>
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                placeholder="Search users by name, email, or city"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: 363,
                  backgroundColor: "#FCFCFC",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 126,
                  borderRadius: "8px",
                  backgroundColor: "#05070A",
                  textTransform: "none",
                  fontSize: "20px",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#0B0E14",
                  },
                }}
              >
                Search
              </Button>
            </Box>
          </form>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ backgroundColor: "#F5F6FA" }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "#FCFCFC",
                        "& th": {
                          borderBottom: "0.5px solid #0B0E14",
                          fontSize: "16px",
                          fontWeight: 500,
                        },
                      }}
                    >
                      <TableCell sx={{ width: 215 }}>Name</TableCell>
                      <TableCell sx={{ width: 346 }}>Email</TableCell>
                      <TableCell sx={{ width: 250 }}>City</TableCell>
                      <TableCell sx={{ width: 163 }}>Country</TableCell>
                      <TableCell align="right" sx={{ width: 77 }}>
                        Age
                      </TableCell>
                      <TableCell align="center" sx={{ width: 107 }}>
                        Actions
                      </TableCell>
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
                          },
                        }}
                      >
                        <TableCell>{getFullName(user.name)}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.location.city}</TableCell>
                        <TableCell>{user.location.country}</TableCell>
                        <TableCell align="right">{user.dob.age}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(user)}
                            sx={{
                              borderRadius: "8px",
                              border: "1px solid #DADEE7",
                              backgroundColor: "rgba(245, 246, 250, 0.30)",
                              width: 40,
                              height: 40,
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

              {hasMore && users.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 3,
                  }}
                >
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outlined"
                    sx={{
                      borderRadius: "8px",
                      border: "1px solid #DADEE7",
                      backgroundColor: "rgba(245, 246, 250, 0.30)",
                      color: "#000",
                      textTransform: "none",
                      fontSize: "16px",
                      fontWeight: 500,
                      minWidth: 107,
                      "&:hover": {
                        backgroundColor: "rgba(245, 246, 250, 0.50)",
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
            </>
          )}
        </Box>
      </Card>

      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
