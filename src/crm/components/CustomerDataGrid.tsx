import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, GridColDef, GridCellParams, GridRowsProp } from "@mui/x-data-grid";

// User interface matching the USERS API structure
interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

// Customer data grid props
interface CustomerDataGridProps {
  onEditCustomer: (customer: User) => void;
  onAddCustomer: () => void;
}

// Function to render customer avatar
function renderCustomerAvatar(params: GridCellParams<User>) {
  if (!params.row) return null;
  
  const user = params.row as User;
  const initials = `${user.name.first.charAt(0)}${user.name.last.charAt(0)}`.toUpperCase();
  
  return (
    <Avatar
      src={user.picture?.thumbnail}
      sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
    >
      {initials}
    </Avatar>
  );
}

// Function to render full name
function renderFullName(params: GridCellParams<User>) {
  if (!params.row) return "";
  
  const user = params.row as User;
  return `${user.name.title} ${user.name.first} ${user.name.last}`;
}

// Function to render location
function renderLocation(params: GridCellParams<User>) {
  if (!params.row) return "";
  
  const user = params.row as User;
  return `${user.location.city}, ${user.location.state}, ${user.location.country}`;
}

// Function to render age chip
function renderAge(params: GridCellParams<User>) {
  if (!params.row) return null;
  
  const user = params.row as User;
  return (
    <Chip 
      label={`${user.dob.age} years`} 
      size="small" 
      variant="outlined"
      color="primary"
    />
  );
}

// Function to render gender chip
function renderGender(params: GridCellParams<User>) {
  if (!params.row) return null;
  
  const user = params.row as User;
  return (
    <Chip 
      label={user.gender} 
      size="small" 
      variant="outlined"
      color={user.gender === "male" ? "info" : "secondary"}
    />
  );
}

// Function to render actions
function renderActions(params: GridCellParams<User>, onEdit: (customer: User) => void) {
  if (!params.row) return null;
  
  return (
    <IconButton
      size="small"
      onClick={() => onEdit(params.row as User)}
      aria-label="edit customer"
    >
      <EditIcon fontSize="small" />
    </IconButton>
  );
}

// Function to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CustomerDataGrid({ onEditCustomer, onAddCustomer }: CustomerDataGridProps) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Fetch customers from API
  const fetchCustomers = async (search: string = "", currentPage: number = 0, currentPageSize: number = 20) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (currentPage + 1).toString(), // API uses 1-based pagination
        perPage: currentPageSize.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`https://user-api.builder-io.workers.dev/api/users?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add id field for DataGrid (using uuid)
      const customersWithId = data.data.map((user: User) => ({
        ...user,
        id: user.login.uuid,
      }));
      
      setCustomers(customersWithId);
      setTotalCustomers(data.total);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers(searchQuery, page, pageSize);
  }, [page, pageSize]);

  // Handle search
  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchCustomers(searchQuery, 0, pageSize);
  };

  // Handle search input key press
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Define columns for the data grid
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: renderCustomerAvatar,
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: renderFullName,
      valueGetter: (value, row) => `${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 0.8,
      minWidth: 150,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1.2,
      minWidth: 200,
      renderCell: renderLocation,
      valueGetter: (value, row) => `${row.location.city}, ${row.location.country}`,
    },
    {
      field: "age",
      headerName: "Age",
      width: 100,
      renderCell: renderAge,
      valueGetter: (value, row) => row.dob.age,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: renderGender,
    },
    {
      field: "registered",
      headerName: "Registered",
      width: 120,
      valueGetter: (value, row) => formatDate(row.registered.date),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => renderActions(params, onEditCustomer),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" component="h3">
            Customer Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddCustomer}
            size="small"
          >
            Add Customer
          </Button>
        </Box>
        
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search customers by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" onClick={handleSearch} size="small">
            Search
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total Customers: {totalCustomers.toLocaleString()}
        </Typography>
      </CardContent>
      
      <Box sx={{ flexGrow: 1, p: 2, pt: 0 }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={totalCustomers}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          disableColumnResize
          density="compact"
          checkboxSelection
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          slotProps={{
            filterPanel: {
              filterFormProps: {
                logicOperatorInputProps: {
                  variant: "outlined",
                  size: "small",
                },
                columnInputProps: {
                  variant: "outlined",
                  size: "small",
                  sx: { mt: "auto" },
                },
                operatorInputProps: {
                  variant: "outlined",
                  size: "small",
                  sx: { mt: "auto" },
                },
                valueInputProps: {
                  InputComponentProps: {
                    variant: "outlined",
                    size: "small",
                  },
                },
              },
            },
          }}
        />
      </Box>
    </Card>
  );
}
