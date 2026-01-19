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
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";

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

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "", append: boolean = false) => {
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

        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: ApiResponse = await response.json();

        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }

        setTotal(data.total);
        setPage(pageNum);
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
  }, [fetchUsers, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleLoadMore = () => {
    fetchUsers(page + 1, searchQuery, true);
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
    setError(null);

    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
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
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const hasMore = users.length < total;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 0.5, fontWeight: 600 }}
      >
        Customers
      </Typography>

      {/* Section Title */}
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 2, fontWeight: 600, fontSize: "20px" }}
      >
        Users
      </Typography>

      {/* Search Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          sx={{
            width: 363,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
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
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            fontSize: "20px",
            px: 3,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          mb: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                City
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
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
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
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
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "0.5px solid #0B0E14",
                  py: 1.5,
                }}
              >
                Actions
              </TableCell>
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
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.login.uuid}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.name.first} {user.name.last}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.location.city}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.location.country}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    {user.dob.age}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "0.5px solid #0B0E14",
                      py: 2,
                    }}
                  >
                    <IconButton
                      onClick={() => handleEditClick(user)}
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid #DADEE7",
                        backgroundColor: "rgba(245, 246, 250, 0.30)",
                        width: 40,
                        height: 40,
                        "&:hover": {
                          backgroundColor: "rgba(245, 246, 250, 0.50)",
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 20, color: "#0B0E14" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More Button */}
      {hasMore && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              px: 3,
              py: 1,
              textTransform: "none",
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
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Edit User Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, sans-serif",
                  width: "100%",
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
                  fontFamily: "Helvetica, sans-serif",
                  width: "100%",
                  minWidth: "300px",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving || !editFirstName || !editLastName}
            sx={{ textTransform: "none" }}
          >
            {saving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
