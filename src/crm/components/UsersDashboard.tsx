import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { listUsers, updateUser, type User } from "../api/users";

function formatDate(d?: string) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString();
}

export default function UsersDashboard() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [page, setPage] = React.useState(1);
  const perPage = 20;
  const [total, setTotal] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [pendingQuery, setPendingQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [editing, setEditing] = React.useState<{
    open: boolean;
    user: User | null;
    first: string;
    last: string;
    saving: boolean;
  }>({ open: false, user: null, first: "", last: "", saving: false });

  const canLoadMore = total == null ? true : users.length < total;

  const fetchPage = React.useCallback(async (opts: { reset?: boolean; nextPage?: number } = {}) => {
    const targetPage = opts.nextPage ?? (opts.reset ? 1 : page);
    const isLoadMore = !opts.reset && targetPage > 1;
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      const res = await listUsers({ page: targetPage, perPage, search: query || undefined, sortBy: "name.first" });
      setTotal(res.total);
      setPage(targetPage);
      setUsers(prev => (opts.reset ? res.data : [...prev, ...res.data]));
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, perPage, query]);

  React.useEffect(() => {
    fetchPage({ reset: true, nextPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(pendingQuery.trim());
  };

  const openEdit = (u: User) => {
    setEditing({ open: true, user: u, first: u.name.first, last: u.name.last, saving: false });
  };

  const closeEdit = () => setEditing(prev => ({ ...prev, open: false }));

  const saveEdit = async () => {
    if (!editing.user) return;
    try {
      setEditing(prev => ({ ...prev, saving: true }));
      const id = editing.user.login?.uuid || editing.user.login.username || editing.user.email;
      await updateUser(String(id), { name: { first: editing.first, last: editing.last } });
      setUsers(prev => prev.map(u => {
        const uid = u.login?.uuid || u.login.username || u.email;
        const eid = editing.user ? (editing.user.login?.uuid || editing.user.login.username || editing.user.email) : null;
        if (String(uid) === String(eid)) {
          return { ...u, name: { ...u.name, first: editing.first, last: editing.last } };
        }
        return u;
      }));
      setSuccess("User updated successfully");
      setEditing(prev => ({ ...prev, open: false, saving: false }));
    } catch (e: any) {
      setError(e.message || "Failed to update user");
      setEditing(prev => ({ ...prev, saving: false }));
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Users
      </Typography>

      <Box component="form" onSubmit={onSearchSubmit} aria-label="Search users" sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            id="user-search"
            label="Search by name, email, or city"
            placeholder="e.g. John, jane@example.com"
            value={pendingQuery}
            onChange={(e) => setPendingQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="Search" edge="end" type="submit">
                    <SearchRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            aria-describedby="user-search-helper"
          />
          <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />} aria-label="Submit search">
            Search
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} aria-label="Users table">
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => {
              const key = u.login?.uuid || u.login.username || u.email;
              return (
                <TableRow key={String(key)} hover tabIndex={0} role="row">
                  <TableCell>
                    <span className="user-name-text">{u.name.first} {u.name.last}</span>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.location?.city || ""}</TableCell>
                  <TableCell>{u.dob?.age ?? ""}</TableCell>
                  <TableCell>{formatDate(u.registered?.date)}</TableCell>
                  <TableCell align="right">
                    <Button variant="text" size="small" startIcon={<EditRoundedIcon />} onClick={() => openEdit(u)} aria-label={`Edit ${u.name.first} ${u.name.last}`}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {total != null ? `${users.length} of ${total} loaded` : `${users.length} loaded`}
        </Typography>
        <Box>
          <Button
            onClick={() => fetchPage({ nextPage: page + 1 })}
            disabled={!canLoadMore || loadingMore || loading}
            variant="outlined"
          >
            {loadingMore ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      </Stack>

      <Dialog open={editing.open} onClose={closeEdit} aria-labelledby="edit-user-title" fullWidth maxWidth="sm">
        <DialogTitle id="edit-user-title">Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="First name"
              value={editing.first}
              onChange={(e) => setEditing(prev => ({ ...prev, first: e.target.value }))}
              inputProps={{ "aria-label": "First name", className: "name-input-wide user-name-text" }}
            />
            <TextField
              label="Last name"
              value={editing.last}
              onChange={(e) => setEditing(prev => ({ ...prev, last: e.target.value }))}
              inputProps={{ "aria-label": "Last name", className: "name-input-wide user-name-text" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={editing.saving}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained" disabled={editing.saving}>
            {editing.saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" variant="filled" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>

      {loading && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Stack>
      )}
    </Box>
  );
}
