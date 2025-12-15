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
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";

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

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editForm, setEditForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "", append: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: perPage.toString(),
          ...(search && { search }),
        });

        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();

        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        setHasMore(data.data.length === perPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
    setPage(1);
  }, [searchQuery, fetchUsers]);

  const handleSearch = () => {
    fetchUsers(1, searchQuery);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

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
              first: editForm.firstName,
              last: editForm.lastName,
            },
            email: editForm.email,
            location: {
              city: editForm.city,
              country: editForm.country,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editForm.firstName,
                  last: editForm.lastName,
                },
                email: editForm.email,
                location: {
                  ...user.location,
                  city: editForm.city,
                  country: editForm.country,
                },
              }
            : user
        )
      );

      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 1, fontWeight: 600, fontSize: "24px" }}
      >
        Customers
      </Typography>
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
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
            width: "363px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
              borderRadius: "8px",
              fontSize: "16px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            height: "40px",
            borderRadius: "8px",
            px: 4,
            backgroundColor: "#05070A",
            color: "#FFF",
            fontWeight: 500,
            fontSize: "20px",
            textTransform: "none",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      <TableContainer
        sx={{
          borderRadius: "8px",
          border: "none",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                borderBottom: "0.5px solid #0B0E14",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "215px",
                  py: 1.5,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "346px",
                  py: 1.5,
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "250px",
                  py: 1.5,
                }}
              >
                City
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "163px",
                  py: 1.5,
                }}
              >
                Country
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "77px",
                  py: 1.5,
                }}
              >
                Age
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  width: "107px",
                  py: 1.5,
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
                  borderBottom: "0.5px solid #0B0E14",
                  "&:last-child": {
                    borderBottom: "0.5px solid #0B0E14",
                  },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.location.city}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.location.country}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: "16px",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    py: 2,
                  }}
                >
                  {user.dob.age}
                </TableCell>
                <TableCell align="center" sx={{ py: 2 }}>
                  <IconButton
                    onClick={() => handleEditClick(user)}
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid #DADEE7",
                    }}
                  >
                    <EditIcon sx={{ fontSize: 24, color: "#0B0E14" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && users.length === 0 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No users found
          </Typography>
        </Box>
      )}

      {hasMore && users.length > 0 && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              height: "40px",
              borderRadius: "8px",
              px: 3,
              border: "1px solid #DADEE7",
              color: "#000",
              fontWeight: 500,
              fontSize: "16px",
              textTransform: "none",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              "&:hover": {
                border: "1px solid #0B0E14",
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            minWidth: 500,
            maxWidth: 600,
            p: 2,
          }}
        >
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Edit User
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="First Name"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="City"
                value={editForm.city}
                onChange={(e) =>
                  setEditForm({ ...editForm, city: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Country"
                value={editForm.country}
                onChange={(e) =>
                  setEditForm({ ...editForm, country: e.target.value })
                }
                fullWidth
              />
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleEditSubmit}
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditModalOpen(false)}
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
}
