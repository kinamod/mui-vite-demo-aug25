import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { User, UsersResponse, fetchUsers } from '../../api/usersApi';
import EditUserModal from './EditUserModal';

const USERS_PER_PAGE = 20;

export default function CustomersDashboard() {
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  // Initial load
  React.useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response: UsersResponse = await fetchUsers({
          page: 1,
          perPage: USERS_PER_PAGE,
        });

        setAllUsers(response.data);
        setFilteredUsers(response.data);
        setTotalUsers(response.total);
        setCurrentPage(1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load users'
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = allUsers.filter(
        (user) =>
          user.name.first.toLowerCase().includes(lowerQuery) ||
          user.name.last.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
      );

      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  };

  // Handle load more
  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response: UsersResponse = await fetchUsers({
        page: nextPage,
        perPage: USERS_PER_PAGE,
      });

      setAllUsers((prev) => [...prev, ...response.data]);
      setFilteredUsers((prev) => [...prev, ...response.data]);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more users'
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Handle save user
  const handleSaveUser = (updatedUser: User) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.login.uuid === updatedUser.login.uuid ? updatedUser : u))
    );

    setFilteredUsers((prev) =>
      prev.map((u) => (u.login.uuid === updatedUser.login.uuid ? updatedUser : u))
    );
  };

  // Format name
  const formatName = (user: User) => `${user.name.first} ${user.name.last}`;

  // Get avatar initials
  const getAvatarInitials = (user: User) =>
    (user.name.first[0] + user.name.last[0]).toUpperCase();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const hasMoreUsers = allUsers.length < totalUsers;

  return (
    <>
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              Customers
            </Typography>

            {/* Search */}
            <TextField
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  sx: { maxWidth: '400px' },
                },
              }}
            />

            {/* Error Alert */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Table */}
            <TableContainer sx={{ mt: 2 }}>
              <Table aria-label="customers table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.login.uuid} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                bgcolor: 'primary.main',
                              }}
                            >
                              {getAvatarInitials(user)}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                fontWeight: 500,
                              }}
                            >
                              {formatName(user)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.location.city}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.location.country}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            aria-label="edit user"
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Load More Button */}
            {hasMoreUsers && filteredUsers.length === allUsers.length && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : `Load More (${allUsers.length} of ${totalUsers})`}
                </Button>
              </Box>
            )}

            {/* Empty State */}
            {filteredUsers.length === 0 && searchQuery && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                No users match your search. Try a different query.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </>
  );
}
