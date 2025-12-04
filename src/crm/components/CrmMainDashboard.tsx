import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Copyright from "../../dashboard/internals/components/Copyright";
import CrmStatCard from "./CrmStatCard";
import CrmRecentDealsTable from "./CrmRecentDealsTable";
import CrmUpcomingTasks from "./CrmUpcomingTasks";
import CrmSalesChart from "./CrmSalesChart";
import CrmLeadsBySourceChart from "./CrmLeadsBySourceChart";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

// Sample data for other stat cards
const otherStatCardsData = [
  {
    title: "Deals Won",
    value: "$542K",
    interval: "Last 30 days",
    trend: "up",
    trendValue: "+23%",
    data: [
      400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680,
      700, 720, 740, 760, 780, 800, 820, 840, 860, 880, 900, 920, 940, 960, 980,
    ],
  },
  {
    title: "New Leads",
    value: "456",
    interval: "Last 30 days",
    trend: "up",
    trendValue: "+12%",
    data: [
      300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440,
      450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590,
    ],
  },
  {
    title: "Conversion Rate",
    value: "28%",
    interval: "Last 30 days",
    trend: "down",
    trendValue: "-5%",
    data: [
      35, 33, 32, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 29, 28, 27, 26, 25, 24, 23, 22,
    ],
  },
];

export default function CrmMainDashboard() {
  const [totalCustomers, setTotalCustomers] = React.useState<number | null>(
    null,
  );
  const [loadingCustomers, setLoadingCustomers] = React.useState(true);

  React.useEffect(() => {
    const fetchTotalCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await fetch(`${API_BASE_URL}/users?page=1&perPage=1`);
        if (!response.ok) {
          throw new Error("Failed to fetch total customers");
        }
        const data = await response.json();
        setTotalCustomers(data.total);
      } catch (error) {
        console.error("Error fetching total customers:", error);
        setTotalCustomers(0);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchTotalCustomers();
  }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header with action buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}
      >
        <Typography variant="h5" component="h2">
          Dashboard Overview
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{ mr: 1 }}
          >
            New Lead
          </Button>
          <Button variant="outlined" startIcon={<AddRoundedIcon />}>
            New Deal
          </Button>
        </Box>
      </Stack>

      {/* Stats Cards row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <CrmStatCard
            title="Total Customers"
            value={
              loadingCustomers
                ? "..."
                : totalCustomers?.toLocaleString() || "0"
            }
            interval="From Users API"
            trend="up"
            trendValue="+15%"
            data={[
              200, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460,
              480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720,
              740, 760, 780, 800,
            ]}
          />
        </Grid>
        {otherStatCardsData.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <CrmStatCard
              title={card.title}
              value={card.value}
              interval={card.interval}
              trend={card.trend as "up" | "down"}
              trendValue={card.trendValue}
              data={card.data}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <CrmSalesChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrmLeadsBySourceChart />
        </Grid>
      </Grid>

      {/* Tables & Other content */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <CrmRecentDealsTable />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            <CrmUpcomingTasks />
          </Stack>
        </Grid>
      </Grid>

      <Copyright sx={{ mt: 3, mb: 4 }} />
    </Box>
  );
}
