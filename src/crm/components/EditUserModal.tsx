import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { User } from "../services/usersApi";

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, firstName: string, lastName: string) => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setFirstName(user.name.first);
      setLastName(user.name.last);
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      onSave(user.login.uuid, firstName, lastName);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="First Name"
          type="text"
          fullWidth
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={{
            mb: 2,
            mt: 1,
            "& input": {
              fontFamily: "Helvetica, Arial, sans-serif",
              minWidth: "300px",
            },
          }}
        />
        <TextField
          margin="dense"
          label="Last Name"
          type="text"
          fullWidth
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={{
            "& input": {
              fontFamily: "Helvetica, Arial, sans-serif",
              minWidth: "300px",
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
