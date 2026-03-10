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
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

interface UserName {
  title: string;
  first: string;
  last: string;
}

interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: {
    offset: string;
    description: string;
  };
}

interface UserDOB {
  date: string;
  age: number;
}

interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: UserName;
  gender: string;
  location: UserLocation;
  email: string;
  dob: UserDOB;
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture?: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  const [editTitle, setEditTitle] = React.useState("");
  const [updating, setUpdating] = React.useState(false);

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: "20",
        });
        if (search) {
          params.append("search", search);
        }
        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const data: ApiResponse = await response.json();

        if (pageNum === 1) {
          setUsers(data.data);
        } else {
          setUsers((prev) => [...prev, ...data.data]);
        }

        setHasMore(data.data.length === 20);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [fetchUsers, searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFirstName(user.name.first);
    setEditLastName(user.name.last);
    setEditTitle(user.name.title);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setEditFirstName("");
    setEditLastName("");
    setEditTitle("");
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setUpdating(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${editingUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              title: editTitle,
              first: editFirstName,
              last: editLastName,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === editingUser.login.uuid
            ? {
                ...user,
                name: {
                  title: editTitle,
                  first: editFirstName,
                  last: editLastName,
                },
              }
            : user,
        ),
      );

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
        Customers
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {/* Search Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          variant="outlined"
          size="small"
          sx={{
            width: "363px",
            backgroundColor: "#FCFCFC",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#fff",
            textTransform: "none",
            fontWeight: 500,
            px: 4,
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Look
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer
        sx={{
          backgroundColor: "#F5F6FA",
          borderRadius: "8px",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              <TableCell
                sx={{
                  fontWeight: 500,
                  borderBottom: "0.5px solid #0B0E14",
                  width: "215px",
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  borderBottom: "0.5px solid #0B0E14",
                  width: "346px",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  borderBottom: "0.5px solid #0B0E14",
                  width: "250px",
                }}
              >
                City
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  borderBottom: "0.5px solid #0B0E14",
                  width: "163px",
                }}
              >
                Country
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  borderBottom: "0.5px solid #0B0E14",
                  width: "101px",
                }}
              >
                Age
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  borderBottom: "0.5px solid #0B0E14",
                  width: "82px",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.login.uuid}>
                <TableCell
                  sx={{
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  }}
                >
                  {`${user.name.first} ${user.name.last}`}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  }}
                >
                  {user.location.city}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  }}
                >
                  {user.location.country}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  }}
                >
                  {user.dob.age}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(user)}
                    aria-label="edit user"
                  >
                    <EditIcon fontSize="small" sx={{ color: "#0B0E14" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More Button */}
      {hasMore && !loading && users.length > 0 && (
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
              px: 3,
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
              },
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Edit User Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="edit-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="edit-user-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 3 }}
          >
            Edit User
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
            />
            <TextField
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  minWidth: "300px",
                },
              }}
            />
            <TextField
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                  minWidth: "300px",
                },
              }}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                disabled={updating}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateUser}
                disabled={updating}
                sx={{ flex: 1 }}
              >
                {updating ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
