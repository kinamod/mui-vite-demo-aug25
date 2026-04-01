import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import { usersApiService, User } from "../services/usersApi";
import EditUserModal from "./EditUserModal";

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadUsers = useCallback(async (isLoadMore: boolean = false, search: string = "") => {
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await usersApiService.getUsers({
        page: currentPage,
        perPage: 20,
        search: search.trim(),
        sortBy: 'name.first'
      });

      if (isLoadMore) {
        setUsers(prev => [...prev, ...response.data]);
        setPage(currentPage);
      } else {
        setUsers(response.data);
        setPage(1);
      }
      
      setTotal(response.total);
      setHasMore(response.data.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadUsers(false, searchQuery);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    loadUsers(true, searchQuery);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    // Refresh the users list after update
    loadUsers(false, searchQuery);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 1, 
          fontWeight: 600,
          fontSize: '24px',
          lineHeight: '36px',
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
        }}
      >
        Customers
      </Typography>
      
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          fontSize: '20px',
          lineHeight: '26.68px',
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
        }}
      >
        Users
      </Typography>

      {/* Search Section */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3, 
        alignItems: 'flex-end'
      }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          variant="outlined"
          sx={{
            width: '363px',
            '& .MuiOutlinedInput-root': {
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#FCFCFC',
              border: '1px solid rgba(194, 201, 214, 0.40)',
              fontSize: '16px',
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              color: '#999',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '8px 14px',
              fontSize: '16px',
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              color: '#999',
              '&::placeholder': {
                color: '#999',
                opacity: 1,
              },
            },
          }}
        />
        <Button
          onClick={handleSearch}
          variant="contained"
          disabled={loading}
          sx={{
            height: '40px',
            width: '126px',
            borderRadius: '8px',
            backgroundColor: '#05070A',
            color: '#FFF',
            fontSize: '20px',
            fontWeight: 500,
            lineHeight: '24.5px',
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            textTransform: 'none',
            border: '1px solid #333C4D',
            boxShadow: '0 1px 0 #47536B, 0 -1px 0 #000',
            '&:hover': {
              backgroundColor: '#0B0E14',
            },
            '&:disabled': {
              backgroundColor: '#333C4D',
              color: '#666',
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

      {/* Table Container */}
      <Box sx={{
        borderRadius: '8px',
        backgroundColor: '#F5F6FA',
        overflow: 'hidden',
        minHeight: '400px',
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: '#FCFCFC',
                '& .MuiTableCell-head': {
                  borderBottom: '0.5px solid #0B0E14',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                  color: '#000',
                }
              }}>
                <TableCell sx={{ width: '215px' }}>Name</TableCell>
                <TableCell sx={{ width: '346px' }}>Email</TableCell>
                <TableCell sx={{ width: '250px' }}>City</TableCell>
                <TableCell sx={{ width: '163px' }}>Country</TableCell>
                <TableCell sx={{ width: '77px', textAlign: 'right' }}>Age</TableCell>
                <TableCell sx={{ width: '107px', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', padding: '40px' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', padding: '40px' }}>
                    <Typography color="textSecondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow 
                    key={`${user.login.uuid}-${index}`}
                    sx={{
                      '& .MuiTableCell-body': {
                        borderBottom: '0.5px solid #0B0E14',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '20.02px',
                        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                        color: '#000',
                      }
                    }}
                  >
                    <TableCell sx={{ width: '215px' }}>
                      {`${user.name.first} ${user.name.last}`}
                    </TableCell>
                    <TableCell sx={{ width: '346px' }}>
                      {user.email}
                    </TableCell>
                    <TableCell sx={{ width: '250px' }}>
                      {user.location.city}
                    </TableCell>
                    <TableCell sx={{ width: '163px' }}>
                      {user.location.country}
                    </TableCell>
                    <TableCell sx={{ width: '77px', textAlign: 'right' }}>
                      {user.dob.age}
                    </TableCell>
                    <TableCell sx={{ width: '107px', textAlign: 'center' }}>
                      <IconButton
                        onClick={() => handleEditUser(user)}
                        sx={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          border: '1px solid #DADEE7',
                          backgroundColor: 'rgba(245, 246, 250, 0.30)',
                          '&:hover': {
                            backgroundColor: 'rgba(245, 246, 250, 0.60)',
                          },
                        }}
                      >
                        <EditIcon sx={{ 
                          width: '24px', 
                          height: '24px', 
                          color: '#0B0E14' 
                        }} />
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '20px',
            borderTop: users.length > 0 ? 'none' : undefined
          }}>
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outlined"
              sx={{
                width: '107px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #DADEE7',
                backgroundColor: 'rgba(245, 246, 250, 0.30)',
                color: '#000',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24.5px',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(245, 246, 250, 0.60)',
                  border: '1px solid #DADEE7',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(245, 246, 250, 0.30)',
                  color: '#666',
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Load More'}
            </Button>
          </Box>
        )}

        {/* Results Info */}
        {users.length > 0 && (
          <Box sx={{ 
            padding: '16px', 
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
          }}>
            Showing {users.length} of {total} users
          </Box>
        )}
      </Box>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
