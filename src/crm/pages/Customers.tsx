import * as React from "react";
import Box from "@mui/material/Box";
import UsersTable from "../components/UsersTable";
import EditUserModal from "../components/EditUserModal";
import { User } from "../../services/usersApi";

export default function Customers() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [refreshKey, setRefreshKey] = React.useState<number>(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateSuccess = () => {
    // Trigger a refresh of the users table
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, p: 3 }}>
      <UsersTable key={refreshKey} onEditUser={handleEditUser} />
      
      <EditUserModal
        open={isModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSuccess={handleUpdateSuccess}
      />
    </Box>
  );
}
