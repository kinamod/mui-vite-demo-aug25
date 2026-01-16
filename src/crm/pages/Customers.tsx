/**
 * Customers Page Component
 * 
 * Main page component for the Customers section of the CRM.
 * This page displays the Users table and manages the edit user modal.
 * 
 * Features:
 * - Integrates UsersTable component for displaying user data
 * - Manages EditUserModal state for editing user information
 * - Handles data refresh after user updates
 * - Provides callback functions to child components
 * 
 * Architecture:
 * - Parent component that orchestrates UsersTable and EditUserModal
 * - Manages modal open/close state
 * - Tracks selected user for editing
 * - Triggers table refresh after successful edits
 * 
 * @see PRD: Customer Dashboard Enhancement – Users View
 */

import * as React from "react";
import Box from "@mui/material/Box";
import UsersTable from "../components/UsersTable";
import EditUserModal from "../components/EditUserModal";

/**
 * User interface definition matching the Users API structure
 * Represents a user with their personal and location information
 */
interface User {
  login: {
    uuid: string; // Unique identifier for the user
    username: string; // User's login username
  };
  name: {
    title: string; // Title (Mr., Ms., etc.)
    first: string; // First name
    last: string; // Last name
  };
  email: string; // User's email address
  location: {
    city: string; // City of residence
    country: string; // Country of residence
  };
  dob: {
    age: number; // User's age
  };
}

/**
 * Customers Page Component
 * 
 * Main container for the Customers/Users management interface.
 * Coordinates the UsersTable and EditUserModal components.
 * 
 * @returns {JSX.Element} Rendered customers page
 */
export default function Customers() {
  // State: Currently selected user for editing (null when no user is selected)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  // State: Controls the visibility of the edit modal
  const [modalOpen, setModalOpen] = React.useState(false);
  
  // State: Refresh trigger for the UsersTable component
  // Incrementing this value forces the table to re-fetch data
  // Uses the "key" prop pattern for controlled re-mounting
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  /**
   * Callback: Handles edit button click from UsersTable
   * Opens the modal and sets the selected user
   * 
   * @param {User} user - The user object to edit
   */
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  /**
   * Callback: Handles modal close action
   * Closes the modal and clears the selected user
   */
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Callback: Triggered after successful user update
   * Increments the refresh trigger to force UsersTable to re-fetch data
   * This ensures the table displays the most current user information
   */
  const handleUserUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Users Table Component */}
      {/* Key prop: Forces component remount when refreshTrigger changes */}
      {/* This triggers a fresh data fetch after user updates */}
      <UsersTable key={refreshTrigger} onEditUser={handleEditUser} />
      
      {/* Edit User Modal Component */}
      {/* Rendered but hidden when modalOpen is false */}
      <EditUserModal
        open={modalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
