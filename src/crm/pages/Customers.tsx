import * as React from "react";
import Box from "@mui/material/Box";
import UsersTable from "../components/UsersTable";
import EditUserModal from "../components/EditUserModal";

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

export default function Customers() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <UsersTable key={refreshTrigger} onEditUser={handleEditUser} />
      <EditUserModal
        open={modalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
