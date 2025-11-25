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
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

interface UserLocation {
  street?: {
    number?: number;
    name?: string;
  };
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  timezone?: {
    offset?: string;
    description?: string;
  };
}

interface UserName {
  title?: string;
  first: string;
  last: string;
}

interface UserDOB {
  date?: string;
  age?: number;
}

interface UserRegistered {
  date?: string;
  age?: number;
}

interface UserPicture {
  large?: string;
  medium?: string;
  thumbnail?: string;
}

interface UserLogin {
  uuid: string;
  username?: string;
  password?: string;
}

interface User {
  login: UserLogin;
  name: UserName;
  gender?: string;
  location: UserLocation;
  email: string;
  dob?: UserDOB;
  registered?: UserRegistered;
  phone?: string;
  cell?: string;
  picture?: UserPicture;
  nat?: string;
}

interface ApiResponse {
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
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentSearch, setCurrentSearch] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });
  const [saving, setSaving] = React.useState(false);

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

        const data: ApiResponse = await response.json();

        if (append) {
          setUsers((prev) => [...prev, ...data.data]);
        } else {
          setUsers(data.data);
        }
        setTotal(data.total);
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
    fetchUsers(1, currentSearch);
  }, [currentSearch, fetchUsers]);

  const handleSearch = () => {
    setCurrentSearch(searchQuery);
    setPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, currentSearch, true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city || "",
      country: user.location.country || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const updatedUser = {
        name: {
          ...editingUser.name,
          first: editFormData.firstName,
          last: editFormData.lastName,
        },
        email: editFormData.email,
        location: {
          ...editingUser.location,
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
          body: JSON.stringify(updatedUser),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((prev) =>
        prev.map((user) =>
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

      handleEditDialogClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const hasMore = users.length < total;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 1, fontWeight: 600, fontSize: "24px", lineHeight: "36px" }}
      >
        Customers
      </Typography>
      <Typography
        variant="h6"
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
          onKeyPress={handleSearchKeyPress}
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
            height: "40px",
            minWidth: "126px",
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#FFF",
            textTransform: "none",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            border: "1px solid #333C4D",
            boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      <Box
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table
            sx={{
              "& .MuiTableCell-root": {
                fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#FCFCFC",
                  "& th": {
                    borderBottom: "0.5px solid #0B0E14",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    padding: "6px 16px",
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
              {loading && !loadingMore ? (
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
                        fontSize: "16px",
                        fontWeight: 400,
                        lineHeight: "20.02px",
                        padding: "16px",
                      },
                    }}
                  >
                    <TableCell>
                      {user.name.first} {user.name.last}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.location.city || "-"}</TableCell>
                    <TableCell>{user.location.country || "-"}</TableCell>
                    <TableCell align="right">{user.dob?.age || "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(user)}
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          border: "1px solid #DADEE7",
                          backgroundColor: "rgba(245, 246, 250, 0.30)",
                          "&:hover": {
                            backgroundColor: "rgba(245, 246, 250, 0.60)",
                          },
                        }}
                      >
                        <EditRoundedIcon
                          sx={{ fontSize: "24px", color: "#0B0E14" }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {hasMore && !loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={loadingMore}
              sx={{
                height: "40px",
                minWidth: "107px",
                borderRadius: "8px",
                border: "1px solid #DADEE7",
                backgroundColor: "rgba(245, 246, 250, 0.30)",
                color: "#000",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24.5px",
                "&:hover": {
                  backgroundColor: "rgba(245, 246, 250, 0.60)",
                  border: "1px solid #DADEE7",
                },
              }}
            >
              {loadingMore ? <CircularProgress size={20} /> : "Load More"}
            </Button>
          </Box>
        )}
      </Box>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: 600,
          }}
        >
          Edit User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) =>
                handleEditFormChange("firstName", e.target.value)
              }
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => handleEditFormChange("lastName", e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            <TextField
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => handleEditFormChange("email", e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            <TextField
              label="City"
              value={editFormData.city}
              onChange={(e) => handleEditFormChange("city", e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
            <TextField
              label="Country"
              value={editFormData.country}
              onChange={(e) => handleEditFormChange("country", e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleEditDialogClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
