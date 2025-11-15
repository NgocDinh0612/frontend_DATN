// import { Box, CircularProgress } from "@mui/material";
// import Header from "../../components/Header";
// import RealtimeLineChart from "../../components/RealtimeLineChart";
// import { useEffect, useState } from "react";

// const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

// const Line = () => {
//   const [devices, setDevices] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type":"application/json" } : { "Content-Type":"application/json" };

//     fetch(`${API_BASE}/devices`, { headers })
//       .then(r => r.json())
//       .then(json => {
//         if (json && json.ok && Array.isArray(json.devices)) {
//           // lấy tất cả node (có gatewayId)
//           const nodes = json.devices.filter(d => d.gatewayId).map(d => d.deviceId);
//           setDevices(nodes);
//         } else {
//           setDevices([]);
//         }
//       })
//       .catch(err => {
//         console.error("Fetch devices error:", err);
//         setDevices([]);
//       });
//   }, []);

//   return (
//     <Box m="20px">
//       <Header title="Line Chart" subtitle="Dòng điện theo thời gian (Realtime)" />
//       <Box height="75vh">
//         {devices === null ? <CircularProgress /> : <RealtimeLineChart devices={devices} periodMinutes={43200} maxPoints={10000} pollIntervalMs={5000} />}
//       </Box>
//     </Box>
//   );
// };

// export default Line;



///code fix



// Line.jsx - Enterprise IoT Current Monitoring Dashboard (3 KPI Cards)
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import { useEffect, useState, useMemo, useCallback } from "react";
import RealtimeLineChart from "../../components/RealtimeLineChart";
import DevicesIcon from "@mui/icons-material/Devices";
import PowerIcon from "@mui/icons-material/Power";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import RefreshIcon from "@mui/icons-material/Refresh";
import { tokens } from "../../theme";

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

const Line = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [devices, setDevices] = useState(null);
  const [allDevicesData, setAllDevicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDevices = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const headers = token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE}/devices`, { headers });
      const json = await res.json();

      if (json && json.ok && Array.isArray(json.devices)) {
        const nodes = json.devices.filter((d) => d.gatewayId);
        setDevices(nodes.map((d) => d.deviceId));
        setAllDevicesData(nodes);
      } else {
        setDevices([]);
        setAllDevicesData([]);
      }
    } catch (err) {
      console.error("Fetch devices error:", err);
      setDevices([]);
      setAllDevicesData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const stats = useMemo(() => {
    if (!allDevicesData.length)
      return { total: 0, avgCurrent: 0, maxCurrent: 0, online: 0, activePower: 0 };

    const validCurrents = allDevicesData
      .filter((d) => typeof d.current === "number" && d.current >= 0)
      .map((d) => d.current);

    const onlineCount = allDevicesData.filter((d) => {
      if (!d.lastUpdated) return false;
      return Date.now() - new Date(d.lastUpdated).getTime() < 60000;
    }).length;

    const avg = validCurrents.length
      ? validCurrents.reduce((a, b) => a + b, 0) / validCurrents.length
      : 0;

    return {
      total: allDevicesData.length,
      avgCurrent: avg,
      maxCurrent: validCurrents.length ? Math.max(...validCurrents) : 0,
      online: onlineCount,
    };
  }, [allDevicesData]);

  const formatCurrent = (val) => (val !== undefined ? val.toFixed(3) : "0.000");

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" gap={2}>
              <PowerIcon sx={{ color: "#10b981", fontSize: 36 }} />
              <Typography
                variant="h4"
                sx={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                Giám Sát Dòng Điện
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
              IoT Realtime • Phạm vi: 0.000 – 1.000 A • Cập nhật mỗi 5s
            </Typography>
          </Box>

          <Tooltip title="Làm mới dữ liệu">
            <IconButton
              onClick={fetchDevices}
              disabled={refreshing}
              sx={{
                bgcolor: "#1e293b",
                color: "#94a3b8",
                "&:hover": { bgcolor: "#334155", color: "#22d3ee" },
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 18,
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress size={50} thickness={4} sx={{ color: "#10b981" }} />
        </Box>
      ) : (
        <>
          {/* 3 KPI Cards – ĐÃ XÓA CARD HOẠT ĐỘNG */}
          <Grid container spacing={2} mb={4}>
            {[
              {
                title: "TỔNG THIẾT BỊ",
                value: stats.total,
                icon: <DevicesIcon sx={{ fontSize: 36, color: "#64748b" }} />,
                progress: stats.total > 0 ? (stats.online / stats.total) * 100 : 0,
                subtitle: `${stats.online} online`,
                color: "#1e293b",
              },
              {
                title: "DÒNG ĐIỆN TB",
                value: `${formatCurrent(stats.avgCurrent)} A`,
                icon: <AnalyticsIcon sx={{ fontSize: 36, opacity: 0.8 }} />,
                subtitle: "±0.001A",
                color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                textColor: "white",
              },
              {
                title: "DÒNG CAO NHẤT",
                value: `${formatCurrent(stats.maxCurrent)} A`,
                icon: <PowerIcon sx={{ fontSize: 36, opacity: 0.8 }} />,
                subtitle: "Peak",
                color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                textColor: "white",
              },
            ].map((kpi, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card
                  sx={{
                    bgcolor: kpi.color,
                    borderRadius: 2.5,
                    overflow: "hidden",
                    height: "100%",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: kpi.textColor || "#94a3b8",
                            fontWeight: 500,
                            fontSize: "0.75rem",
                          }}
                        >
                          {kpi.title}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color: kpi.textColor || "#f8fafc",
                            fontWeight: 700,
                            mt: 0.5,
                            fontSize: "1.35rem",
                          }}
                        >
                          {kpi.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: kpi.textColor ? "rgba(255,255,255,0.7)" : "#10b981",
                            mt: 0.5,
                            fontSize: "0.7rem",
                          }}
                        >
                          {kpi.subtitle}
                        </Typography>
                      </Box>
                      {kpi.icon}
                    </Stack>
                    {kpi.progress !== undefined && (
                      <LinearProgress
                        variant="determinate"
                        value={kpi.progress}
                        sx={{
                          mt: 1.5,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "#334155",
                          "& .MuiLinearProgress-bar": { bgcolor: "#10b981" },
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Biểu đồ – giữ nguyên */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              mb: 4,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 600 }}>
                  Biểu Đồ Dòng Điện Thời Gian Thực
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  10.000 điểm • Cập nhật mỗi 5 giây • {devices?.length || 0} thiết bị
                </Typography>
              </Box>
              <Chip
                size="small"
                icon={<PowerIcon sx={{ fontSize: 14 }} />}
                label="Realtime"
                sx={{
                  bgcolor: "#10b98120",
                  color: "#10b981",
                  border: "1px solid #10b981",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              />
            </Box>

            <Box
              sx={{
                height: { xs: "45vh", md: "55vh" },
                bgcolor: "#0f172a",
                borderRadius: 2,
                border: "1px solid #334155",
                p: 2,
                position: "relative",
              }}
            >
              {devices === null ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress sx={{ color: "#10b981" }} />
                </Box>
              ) : (
                <RealtimeLineChart
                  devices={devices}
                  periodMinutes={3}
                  maxPoints={30}
                  pollIntervalMs={5000}
                  yScale={{
                    type: "linear",
                    min: 0,
                    max: 1.0,
                    stacked: false,
                    tickAmount: 11,
                  }}
                  annotations={[]}
                />
              )}
            </Box>

            <Stack direction="row" justifyContent="space-between" mt={2} px={1}>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Di chuột để xem chi tiết • Click legend để ẩn/hiện
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Dữ liệu được làm mịn tự động
              </Typography>
            </Stack>
          </Paper>

          {/* Device List */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 3,
              p: { xs: 2, md: 3 },
            }}
          >
            <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 600, mb: 2 }}>
              Thiết Bị ({allDevicesData.length})
            </Typography>
            <Grid container spacing={1.5}>
              {allDevicesData.map((device, idx) => {
                const isOnline =
                  device.lastUpdated && Date.now() - new Date(device.lastUpdated).getTime() < 60000;
                const current = device.current !== undefined ? device.current : null;

                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={device.deviceId || idx}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "#0f172a",
                        borderRadius: 2,
                        border: `1px solid ${isOnline ? "#10b981" : "#475569"}`,
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: isOnline ? "#34d399" : "#94a3b8",
                          bgcolor: "#1e293b",
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#f8fafc",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {device.name || device.deviceId}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: current !== null ? "#10b981" : "#64748b",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                        }}
                      >
                        {current !== null ? `${formatCurrent(current)} A` : "—"}
                      </Typography>
                      <Chip
                        label={isOnline ? "ON" : "OFF"}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 18,
                          fontSize: "0.6rem",
                          bgcolor: isOnline ? "#10b98120" : "#64748b20",
                          color: isOnline ? "#10b981" : "#94a3b8",
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

// Spin animation
const style = document.createElement("style");
style.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Line;