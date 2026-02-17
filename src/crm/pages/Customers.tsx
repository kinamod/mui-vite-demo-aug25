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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";

interface User {
  login: {
    uuid: string;
    username: string;
    password?: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone?: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
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

interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });
  const [saving, setSaving] = React.useState(false);

  const fetchUsers = React.useCallback(
    async (searchQuery: string = "", pageNum: number = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          perPage: "20",
        });
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: UsersResponse = await response.json();
        
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
    []
  );

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(searchTerm, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(searchTerm, nextPage);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setEditFormData({
      firstName: "",
      lastName: "",
      email: "",
      city: "",
      country: "",
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setSaving(true);
    setError(null);
    
    try {
      const updateData = {
        name: {
          first: editFormData.firstName,
          last: editFormData.lastName,
        },
        email: editFormData.email,
        location: {
          city: editFormData.city,
          country: editFormData.country,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/users/${editingUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.login.uuid === editingUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editFormData.firstName,
                  last: editFormData.lastName,
                },
                email: editFormData.email,
                location: {
                  ...user.location,
                  city: editFormData.city,
                  country: editFormData.country,
                },
              }
            : user
        )
      );

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 0.5, fontWeight: 600, fontSize: 24 }}
      >
        Customers
      </Typography>

      {/* Section Title */}
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, mt: 3, fontWeight: 600, fontSize: 20 }}
      >
        Users
      </Typography>

      {/* Search Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: 363,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FCFCFC",
              borderRadius: 1,
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
          }}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            backgroundColor: "#05070A",
            color: "#FFF",
            borderRadius: 1,
            px: 3,
            py: 1,
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            textTransform: "none",
            boxShadow:
              "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
            "&.Mui-disabled": {
              backgroundColor: "#05070A",
              color: "#FFF",
              opacity: 0.6,
            },
          }}
        >
          Find
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer
        sx={{
          backgroundColor: "#F5F6FA",
          borderRadius: 1,
          mb: 2,
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
                  fontSize: 16,
                  py: 1.5,
                },
              }}
            >
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.login.uuid}
                  sx={{
                    "& td": {
                      borderBottom: "0.5px solid #0B0E14",
                      fontSize: 16,
                      py: 2,
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
                        border: "1px solid #DADEE7",
                        borderRadius: 1,
                        backgroundColor: "rgba(245, 246, 250, 0.30)",
                        padding: 1,
                        "&:hover": {
                          backgroundColor: "rgba(245, 246, 250, 0.50)",
                        },
                      }}
                    >
                      <EditIcon sx={{ color: "#0B0E14" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More Button */}
      {hasMore && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              borderRadius: 1,
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              px: 2,
              py: 1,
              fontWeight: 500,
              fontSize: 16,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
                border: "1px solid #DADEE7",
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Load More"}
          </Button>
        </Box>
      )}

      {/* Edit User Modal */}
      <Dialog
        open={!!editingUser}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, firstName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, lastName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="City"
              value={editFormData.city}
              onChange={(e) =>
                setEditFormData({ ...editFormData, city: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Country"
              value={editFormData.country}
              onChange={(e) =>
                setEditFormData({ ...editFormData, country: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={saving}
            sx={{
              backgroundColor: "#05070A",
              "&:hover": {
                backgroundColor: "#0B0E14",
              },
            }}
          >
            {saving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
