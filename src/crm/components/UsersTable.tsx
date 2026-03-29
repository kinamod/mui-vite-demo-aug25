import * as React from "react";
import Box from "@mui/material/Box";
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
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import { usersApi, User } from "../../services/usersApi";

interface UsersTableProps {
  onEditUser: (user: User) => void;
}

export default function UsersTable({ onEditUser }: UsersTableProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalUsers, setTotalUsers] = React.useState<number>(0);
  const [hasMore, setHasMore] = React.useState<boolean>(true);

  const perPage = 20;

  const fetchUsers = React.useCallback(async (page: number, search: string, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersApi.getUsers({
        page,
        perPage,
        search: search || undefined,
      });

      if (append) {
        setUsers(prev => {
          const newUsers = [...prev, ...response.data];
          setHasMore(newUsers.length < response.total);
          return newUsers;
        });
      } else {
        setUsers(response.data);
        setHasMore(response.data.length < response.total);
      }

      setTotalUsers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  React.useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [searchQuery, fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchQuery(searchTerm);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  const getFullName = (user: User): string => {
    return `${user.name.first} ${user.name.last}`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 1,
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "36px",
        }}
      >
        Customers
      </Typography>

      <Typography 
        variant="h6" 
        component="h2" 
        sx={{ 
          mb: 2,
          fontWeight: 600,
          fontSize: "20px",
          lineHeight: "26.68px",
        }}
      >
        Users
      </Typography>

      {/* Search */}
      <Box 
        sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          size="small"
          sx={{
            width: { xs: "100%", sm: "363px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#FCFCFC",
              "& fieldset": {
                borderColor: "rgba(194, 201, 214, 0.40)",
              },
            },
            "& input": {
              fontSize: "16px",
              color: "#999",
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
            px: 3,
            py: 1,
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24.5px",
            textTransform: "none",
            boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
            "&:hover": {
              backgroundColor: "#0B0E14",
            },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer 
        sx={{ 
          backgroundColor: "#F5F6FA",
          borderRadius: "8px",
          maxHeight: "calc(100vh - 300px)",
          overflow: "auto",
        }}
      >
        <Table 
          stickyHeader 
          sx={{ 
            minWidth: 650,
            "& .MuiTableCell-root": {
              borderBottom: "0.5px solid #0B0E14",
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FCFCFC" }}>
              <TableCell 
                sx={{ 
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  backgroundColor: "#FCFCFC",
                  width: "215px",
                }}
              >
                Name
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  backgroundColor: "#FCFCFC",
                  width: "346px",
                }}
              >
                Email
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  backgroundColor: "#FCFCFC",
                  width: "250px",
                }}
              >
                City
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  backgroundColor: "#FCFCFC",
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
                  lineHeight: "24px",
                  backgroundColor: "#FCFCFC",
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
                  lineHeight: "24px",
                  backgroundColor: "#FCFCFC",
                  width: "107px",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && currentPage === 1 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.login.uuid}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <TableCell 
                    sx={{ 
                      fontSize: "16px",
                      lineHeight: "20.02px",
                      fontFamily: "Helvetica, Inter, -apple-system, Roboto, sans-serif",
                    }}
                  >
                    {getFullName(user)}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontSize: "16px",
                      lineHeight: "20.02px",
                    }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontSize: "16px",
                      lineHeight: "20.02px",
                    }}
                  >
                    {user.location.city}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontSize: "16px",
                      lineHeight: "20.02px",
                    }}
                  >
                    {user.location.country}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontSize: "16px",
                      lineHeight: "20.02px",
                    }}
                  >
                    {user.dob.age}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => onEditUser(user)}
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid #DADEE7",
                        backgroundColor: "rgba(245, 246, 250, 0.30)",
                        width: "40px",
                        height: "40px",
                        "&:hover": {
                          backgroundColor: "rgba(245, 246, 250, 0.50)",
                        },
                      }}
                      aria-label="edit user"
                    >
                      <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
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
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              borderRadius: "8px",
              border: "1px solid #DADEE7",
              backgroundColor: "rgba(245, 246, 250, 0.30)",
              color: "#000",
              px: 3,
              py: 1,
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24.5px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(245, 246, 250, 0.50)",
                border: "1px solid #DADEE7",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
