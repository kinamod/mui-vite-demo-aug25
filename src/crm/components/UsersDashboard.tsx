import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditUserDialog from "./EditUserDialog";

const API_BASE = "https://user-api.builder-io.workers.dev/api";

export type ApiUser = {
  login?: { uuid?: string; username?: string; password?: string } | null;
  name?: { title?: string; first?: string; last?: string } | null;
  gender?: string | null;
  location?: {
    street?: { number?: number; name?: string } | null;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string | number;
    coordinates?: { latitude?: number; longitude?: number } | null;
    timezone?: { offset?: string; description?: string } | null;
  } | null;
  email?: string;
  dob?: { date?: string; age?: number } | null;
  registered?: { date?: string; age?: number } | null;
  phone?: string | null;
  cell?: string | null;
  picture?: { large?: string; medium?: string; thumbnail?: string } | null;
  nat?: string | null;
};

function getUserId(u: ApiUser): string | undefined {
  return u?.login?.uuid || u?.login?.username || u?.email || undefined;
}

type ApiListResponse = {
  page: number;
  perPage: number;
  total: number;
  span?: string;
  effectivePage?: number;
  data: ApiUser[];
};

export default function UsersDashboard() {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const perPage = 20;
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingUser, setEditingUser] = React.useState<ApiUser | null>(null);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: "success" | "error" }>(
    { open: false, msg: "", severity: "success" }
  );

  const abortRef = React.useRef<AbortController | null>(null);

  const fetchUsers = React.useCallback(async (pageToLoad: number, reset = false) => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(pageToLoad),
        perPage: String(perPage),
        sortBy: "name.first",
      });
      if (query.trim()) params.set("search", query.trim());
      const res = await fetch(`${API_BASE}/users?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json: ApiListResponse = await res.json();
      setTotal(json.total);
      setUsers((prev) => (reset ? json.data : [...prev, ...json.data]));
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    // initial load
    fetchUsers(1, true);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitSearch: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setUsers([]);
    setPage(1);
    fetchUsers(1, true);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchUsers(next, false);
  };

  const handleEditOpen = (u: ApiUser) => setEditingUser(u);
  const handleEditClose = () => setEditingUser(null);

  const handleUserUpdated = (updatedPartial: Partial<ApiUser>) => {
    const id = updatedPartial && getUserId(updatedPartial as ApiUser);
    setUsers((prev) =>
      prev.map((u) => (getUserId(u) === id ? { ...u, ...updatedPartial, name: { ...u.name, ...updatedPartial.name } } : u))
    );
    setSnack({ open: true, msg: "User updated successfully", severity: "success" });
  };

  const loadedCount = users.length;
  const canLoadMore = loadedCount < total;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" }, mb: 2 }}>
        <Typography variant="h6" sx={{ mr: { sm: 1 } }}>Users</Typography>
        <Box component="form" onSubmit={onSubmitSearch} sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
          <TextField
            size="small"
            placeholder="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", color: "text.secondary", mr: 0.5 }}>
                  <SearchRoundedIcon fontSize="small" />
                </Box>
              ),
            }}
            sx={{ flex: { xs: 1, sm: "0 0 320px" } }}
            aria-label="Search users"
          />
          <Button type="submit" variant="contained" disabled={loading} startIcon={<SearchRoundedIcon />}>
            Search
          </Button>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ width: "100%" }}>
        <TableContainer>
          <Table size="small" aria-label="Users table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 320 }}>
                  <Typography component="span" sx={{ fontWeight: 600 }}>Name</Typography>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Age</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, idx) => {
                const id = getUserId(u) || `${idx}`;
                const fullName = [u?.name?.first, u?.name?.last].filter(Boolean).join(" ");
                return (
                  <TableRow key={id} hover>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{fullName || "—"}</Typography>
                    </TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.location?.city || "—"}</TableCell>
                    <TableCell>{u.location?.country || "—"}</TableCell>
                    <TableCell align="right">{u.dob?.age ?? "—"}</TableCell>
                    <TableCell>{u.registered?.date ? new Date(u.registered.date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <IconButton aria-label={`Edit user ${fullName || id}`} onClick={() => handleEditOpen(u)}>
                        <EditRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading…</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Stack direction="row" sx={{ mt: 2, justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2">{loadedCount} of {total} users</Typography>
        <Button variant="outlined" onClick={loadMore} disabled={loading || !canLoadMore}>
          Load More
        </Button>
      </Stack>

      <EditUserDialog
        open={Boolean(editingUser)}
        user={editingUser}
        onClose={handleEditClose}
        onUpdated={handleUserUpdated}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
