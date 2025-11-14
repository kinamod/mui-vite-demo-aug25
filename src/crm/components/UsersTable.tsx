import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useState, useEffect } from "react";
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
  location: {
    city: string;
    country: string;
  };
  dob: {
    age: number;
  };
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const perPage = 20;

  const fetchUsers = async (pageNum: number, search: string = "") => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/users`);
      url.searchParams.append("page", pageNum.toString());
      url.searchParams.append("perPage", perPage.toString());
      if (search) {
        url.searchParams.append("search", search);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (pageNum === 1) {
        setUsers(data.data);
      } else {
        setUsers((prev) => [...prev, ...data.data]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.login.uuid === updatedUser.login.uuid ? updatedUser : u
      )
    );
  };

  const hasMore = users.length < total;

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
          mb: 2,
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          size="small"
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(194, 201, 214, 0.40)",
            },
          }}
        />
        <Button
          onClick={handleSearch}
          variant="contained"
          sx={{
            borderRadius: "8px",
            backgroundColor: "#05070A",
            color: "#FFF",
            textTransform: "none",
            fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            minWidth: "126px",
            height: "42px",
            boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Stack>

      <TableContainer
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F5F6FA",
          overflow: "auto",
        }}
      >
        <Table sx={{ minWidth: 1157 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "215px",
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "346px",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "250px",
                }}
              >
                City
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "163px",
                }}
              >
                Country
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  borderBottom: "0.5px solid #0B0E14",
                  width: "77px",
                }}
              >
                Age
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
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
              <TableRow key={user.login.uuid}>
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.name.first} {user.name.last}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.city}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
                    borderBottom: "0.5px solid #0B0E14",
                  }}
                >
                  {user.location.country}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "20.02px",
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
                    size="small"
                    aria-label={`Edit ${user.name.first} ${user.name.last}`}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              textTransform: "none",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24.5px",
              minWidth: "107px",
              height: "40px",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.60)",
                borderColor: "#DADEE7",
              },
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}

      {selectedUser && (
        <EditUserModal
          open={modalOpen}
          user={selectedUser}
          onClose={handleModalClose}
          onUpdate={handleUserUpdate}
        />
      )}
    </Box>
  );
}
