import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

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

interface UsersTableProps {
  onEditUser: (user: User) => void;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: "#F5F6FA",
  borderRadius: "8px",
  boxShadow: "none",
  "& .MuiTableCell-root": {
    borderBottom: "0.5px solid #0B0E14",
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: "16px",
  },
}));

const StyledTableHead = styled(TableHead)({
  "& .MuiTableCell-head": {
    backgroundColor: "#FCFCFC",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#000",
  },
});

const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
});

const EditButton = styled(IconButton)({
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  border: "1px solid #DADEE7",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  "&:hover": {
    backgroundColor: "rgba(245, 246, 250, 0.60)",
  },
});

const SearchButton = styled(Button)({
  background: "linear-gradient(0deg, #05070A 0%, #05070A 100%)",
  color: "#FFF",
  fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "8px",
  padding: "8px 24px",
  height: "40px",
  border: "1px solid #333C4D",
  boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
  "&:hover": {
    background: "linear-gradient(0deg, #0B0E14 0%, #0B0E14 100%)",
  },
});

const LoadMoreButton = styled(Button)({
  width: "107px",
  height: "40px",
  borderRadius: "8px",
  border: "1px solid #DADEE7",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  color: "#000",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 500,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "rgba(245, 246, 250, 0.60)",
  },
});

export default function UsersTable({ onEditUser }: UsersTableProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const perPage = 20;

  const fetchUsers = React.useCallback(
    async (pageNum: number, search: string = "") => {
      setLoading(true);
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
        const data = await response.json();

        if (pageNum === 1) {
          setUsers(data.data || []);
        } else {
          setUsers((prev) => [...prev, ...(data.data || [])]);
        }
        setTotalUsers(data.total || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
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
    fetchUsers(1, searchTerm);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "36px",
          color: "#000",
          mb: 1,
        }}
      >
        Customers
      </Typography>

      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
          color: "#000",
          mb: 2,
        }}
      >
        Users
      </Typography>

      {/* Search Bar */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FCFCFC",
              borderRadius: "8px",
              height: "36px",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(194, 201, 214, 0.60)",
              },
            },
            "& input": {
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              color: "#999",
              padding: "8px 14px",
            },
          }}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          Search
        </SearchButton>
      </Box>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: "215px", pl: 2 }}>Name</TableCell>
              <TableCell sx={{ width: "346px" }}>Email</TableCell>
              <TableCell sx={{ width: "250px" }}>City</TableCell>
              <TableCell sx={{ width: "163px" }}>Country</TableCell>
              <TableCell sx={{ width: "77px", textAlign: "right" }}>
                Age
              </TableCell>
              <TableCell sx={{ width: "107px", textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {loading && page === 1 ? (
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
                <StyledTableRow key={user.login.uuid}>
                  <TableCell sx={{ pl: 2 }}>
                    {user.name.first} {user.name.last}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.location.city}</TableCell>
                  <TableCell>{user.location.country}</TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    {user.dob.age}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <EditButton
                      onClick={() => onEditUser(user)}
                      aria-label="edit user"
                    >
                      <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
                    </EditButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Load More Button */}
      {users.length < totalUsers && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </LoadMoreButton>
        </Box>
      )}
    </Box>
  );
}
