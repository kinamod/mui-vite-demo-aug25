import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { ApiUser } from "./UsersDashboard";

const API_BASE = "https://user-api.builder-io.workers.dev/api";

function getUserId(u: ApiUser | null | undefined): string | undefined {
  return u?.login?.uuid || u?.login?.username || u?.email || undefined;
}

type Props = {
  open: boolean;
  user: ApiUser | null;
  onClose: () => void;
  onUpdated: (updated: Partial<ApiUser>) => void;
};

export default function EditUserDialog({ open, user, onClose, onUpdated }: Props) {
  const [first, setFirst] = React.useState("");
  const [last, setLast] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFirst(user?.name?.first || "");
    setLast(user?.name?.last || "");
    setError(null);
  }, [user]);

  const handleSave = async () => {
    const id = getUserId(user);
    if (!id) {
      setError("Missing user identifier");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: { first: first || undefined, last: last || undefined } }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Update failed: ${res.status}`);
      }
      onUpdated({ ...user, name: { ...user?.name, first, last } });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const fullName = [user?.name?.first, user?.name?.last].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="edit-user-title" fullWidth maxWidth="sm">
      <DialogTitle id="edit-user-title">Edit User</DialogTitle>
      <DialogContent dividers>
        {user && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">{fullName || user.email || "Unnamed user"}</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First name"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                inputProps={{ "aria-label": "First name" }}
                sx={{ width: 320, '& .MuiInputBase-input': { fontFamily: 'Helvetica, Arial, sans-serif' } }}
              />
              <TextField
                label="Last name"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                inputProps={{ "aria-label": "Last name" }}
                sx={{ width: 320, '& .MuiInputBase-input': { fontFamily: 'Helvetica, Arial, sans-serif' } }}
              />
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={18} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
