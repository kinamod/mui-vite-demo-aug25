import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { usersApi, User } from "../services/usersApi";
import EditUserModal from "../components/EditUserModal";

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const loadUsers = React.useCallback(
    async (pageNum: number, search: string, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersApi.getUsers({
          page: pageNum,
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
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    loadUsers(1, searchQuery, false);
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadUsers(1, searchQuery, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage, searchQuery, true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (
    userId: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      await usersApi.updateUser(userId, {
        name: { first: firstName, last: lastName },
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.login.uuid === userId
            ? {
                ...user,
                name: { ...user.name, first: firstName, last: lastName },
              }
            : user
        )
      );

      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError("Failed to update user. Please try again.");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "36px",
        }}
      >
        Customers
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 3,
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
        }}
      >
        Users
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          variant="outlined"
          size="medium"
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
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
            "& input": {
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
            },
            "& ::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            background:
              "linear-gradient(0deg, #05070A 0%, #05070A 100%), linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)",
            backgroundColor: "#05070A",
            color: "#FFF",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 500,
            textTransform: "none",
            px: 3,
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
        component={Paper}
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          boxShadow: "none",
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
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                City
              </TableCell>
              <TableCell
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Country
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                Age
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#000",
                  borderBottom: "0.5px solid #0B0E14",
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
                  "&:last-child td, &:last-child th": { border: 0 },
                  borderBottom: "0.5px solid #0B0E14",
                }}
              >
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.city}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.country}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontFamily:
                      "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#000",
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
                    <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
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
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
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
            Load More
          </Button>
        </Box>
      )}

      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </Box>
  );
}
