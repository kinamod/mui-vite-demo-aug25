import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import EditIcon from "@mui/icons-material/Edit";
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

const StyledTableContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#F5F6FA",
  borderRadius: "8px",
  overflow: "hidden",
  marginTop: "24px",
}));

const TableHeader = styled(Box)({
  display: "grid",
  gridTemplateColumns: "215px 346px 250px 163px 77px 107px",
  backgroundColor: "#FCFCFC",
  borderBottom: "0.5px solid #0B0E14",
  height: "36px",
  alignItems: "center",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 500,
});

const TableRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "215px 346px 250px 163px 77px 107px",
  borderBottom: "0.5px solid #0B0E14",
  height: "53px",
  alignItems: "center",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 400,
});

const SearchButton = styled(Button)({
  background: "rgba(0, 42, 113, 1)",
  backgroundColor: "rgba(0, 42, 113, 1)",
  border: "1px solid #333C4D",
  borderRadius: "8px",
  color: "#FFF",
  fontFamily: "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "24.5px",
  textTransform: "none",
  height: "40px",
  padding: "0 24px",
  "&:hover": {
    backgroundColor: "rgba(0, 42, 113, 0.9)",
  },
  boxShadow: "0 1px 0 #47536B, 0 -1px 0 #000",
});

const LoadMoreButton = styled(Button)({
  border: "1px solid #DADEE7",
  borderRadius: "8px",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  color: "#000",
  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24.5px",
  textTransform: "none",
  height: "40px",
  padding: "0 16px",
  margin: "16px auto",
  display: "block",
});

const EditButton = styled(IconButton)({
  border: "1px solid #DADEE7",
  borderRadius: "8px",
  backgroundColor: "rgba(245, 246, 250, 0.30)",
  width: "40px",
  height: "40px",
});

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentSearch, setCurrentSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  const perPage = 20;

  const fetchUsers = async (searchTerm: string = "", pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        perPage: perPage.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`
      );
      const data = await response.json();

      if (pageNum === 1) {
        setUsers(data.data || []);
      } else {
        setUsers((prev) => [...prev, ...(data.data || [])]);
      }
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    setCurrentSearch(searchQuery);
    setPage(1);
    fetchUsers(searchQuery, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(currentSearch, nextPage);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      country: user.location.country,
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${editingUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: editFormData.firstName,
              last: editFormData.lastName,
            },
            email: editFormData.email,
            location: {
              city: editFormData.city,
              country: editFormData.country,
            },
          }),
        }
      );

      if (response.ok) {
        // Refresh the users list
        fetchUsers(currentSearch, 1);
        setPage(1);
        handleCloseModal();
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1161px", p: 0 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "36px",
          mb: "16px",
        }}
      >
        Customers
      </Typography>

      <Typography
        variant="h6"
        sx={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "26.68px",
          mb: "16px",
        }}
      >
        Users
      </Typography>

      <Box sx={{ display: "flex", gap: "8px", mb: "24px", alignItems: "center" }}>
        <TextField
          placeholder="Search users by name, email, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            width: "363px",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              borderRadius: "8px",
              border: "1px solid rgba(194, 201, 214, 0.40)",
              backgroundColor: "#FCFCFC",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "16px",
              "& fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          Search
        </SearchButton>
      </Box>

      <StyledTableContainer>
        <TableHeader>
          <Box sx={{ pl: "16px" }}>Name</Box>
          <Box sx={{ pl: "16px" }}>Email</Box>
          <Box sx={{ pl: "16px" }}>City</Box>
          <Box sx={{ pl: "16px" }}>Country</Box>
          <Box sx={{ textAlign: "right", pr: "16px" }}>Age</Box>
          <Box sx={{ textAlign: "center" }}>Actions</Box>
        </TableHeader>

        {users.map((user) => (
          <TableRow key={user.login.uuid}>
            <Box sx={{ pl: "16px" }}>
              {user.name.first} {user.name.last}
            </Box>
            <Box sx={{ pl: "16px" }}>{user.email}</Box>
            <Box sx={{ pl: "16px" }}>{user.location.city}</Box>
            <Box sx={{ pl: "16px" }}>{user.location.country}</Box>
            <Box sx={{ textAlign: "right", pr: "16px" }}>{user.dob.age}</Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <EditButton onClick={() => handleEditClick(user)}>
                <EditIcon sx={{ fontSize: "20px", color: "#0B0E14" }} />
              </EditButton>
            </Box>
          </TableRow>
        ))}
      </StyledTableContainer>

      {users.length < total && (
        <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </LoadMoreButton>
      )}

      <Dialog
        open={!!editingUser}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Edit User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px" }}>
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) => handleFormChange("firstName", e.target.value)}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => handleFormChange("lastName", e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              fullWidth
            />
            <TextField
              label="City"
              value={editFormData.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
              fullWidth
            />
            <TextField
              label="Country"
              value={editFormData.country}
              onChange={(e) => handleFormChange("country", e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button
            onClick={handleCloseModal}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#05070A",
              "&:hover": {
                backgroundColor: "#0B0E14",
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
