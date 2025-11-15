// import { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Alert,
//   useTheme,
//   CircularProgress,
//   Card,
//   CardContent,
//   Divider
// } from "@mui/material";
// import { tokens } from "../../theme";
// import Header from "../../components/Header";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Xóa icon default
// delete L.Icon.Default.prototype._getIconUrl;

// // ICON Gateway
// const gatewayIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/3534/3534156.png",
//   iconSize: [40, 40],
// });

// // ICON Node online
// const nodeIconOnline = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833593.png",
//   iconSize: [35, 35],
// });

// // ICON Node offline
// const nodeIconOffline = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833585.png",
//   iconSize: [35, 35],
// });

// // API backend
// const API_BASE =
//   process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

// const Geography = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [devices, setDevices] = useState([]);
//   const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [gatewayNodes, setGatewayNodes] = useState({});

//   const token = localStorage.getItem("accessToken");

//   const authHeaders = () => ({
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   });

//   // lấy danh sách thiết bị
//   const fetchDevices = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
//       if (res.status === 401) throw new Error("Hết phiên đăng nhập!");

//       const data = await res.json();
//       if (!res.ok || !data.ok) throw new Error("API /devices failed");

//       const valid = (data.devices || []).filter((d) => d.gps?.lat && d.gps?.lon);

//       setDevices(valid);

//       // load node theo gateway
//       valid.forEach(async (gw) => {
//         if (gw.isGateway) {
//           const r = await fetch(`${API_BASE}/devices/${gw.deviceId}`, {
//             headers: authHeaders(),
//           });
//           const dt = await r.json();
//           setGatewayNodes((prev) => ({
//             ...prev,
//             [gw.deviceId]: dt.devices || [],
//           }));
//         }
//       });

//       // auto center map
//       if (valid.length > 0) {
//         const avgLat = valid.reduce((s, d) => s + d.gps.lat, 0) / valid.length;
//         const avgLon = valid.reduce((s, d) => s + d.gps.lon, 0) / valid.length;
//         setMapCenter([avgLat, avgLon]);
//       }
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!token) {
//       setError("Bạn chưa đăng nhập.");
//       setLoading(false);
//       return;
//     }
//     fetchDevices();
//   }, []);

//   return (
//     <Box m="20px">
//       <Header
//         title="Bản đồ thiết bị"
//         subtitle="Vị trí và trạng thái của các đèn thông minh"
//       />

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {loading ? (
//         <Box
//           display="flex"
//           justifyContent="center"
//           alignItems="center"
//           height="60vh"
//         >
//           <CircularProgress />
//         </Box>
//       ) : (
//         <Box
//           height="75vh"
//           border={`1px solid ${colors.grey[400]}`}
//           borderRadius="10px"
//           overflow="hidden"
//         >
//           <MapContainer center={mapCenter} zoom={13} style={{ height: "100%" }}>
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />

//             {devices.map((device) => (
//               <Marker
//                 key={device._id}
//                 position={[device.gps.lat, device.gps.lon]}
//                 icon={
//                   device.isGateway
//                     ? gatewayIcon
//                     : device.isOnline
//                     ? nodeIconOnline
//                     : nodeIconOffline
//                 }
//               >
//                 <Popup>
//                   <Card sx={{ width: 240, p: 1 }}>
//                     <CardContent>
//                       <Typography
//                         variant="h6"
//                         color={colors.greenAccent[400]}
//                         sx={{ mb: 1 }}
//                       >
//                         {device.name || device.deviceId}
//                       </Typography>

//                       <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                         MAC: {device.deviceId}
//                       </Typography>
//                       <Typography variant="body2">
//                         Vị trí: {device.location || "Chưa xác định"}
//                       </Typography>

//                       {/* GATEWAY */}
//                       {device.isGateway && (
//                         <>
//                           <Divider sx={{ my: 1 }} />
//                           <Typography
//                             variant="body2"
//                             color={colors.blueAccent[300]}
//                           >
//                             Các Node:
//                           </Typography>

//                           {(gatewayNodes[device.deviceId] || []).length === 0 ? (
//                             <Typography variant="body2" color={colors.grey[200]}>
//                               Không có node
//                             </Typography>
//                           ) : (
//                             gatewayNodes[device.deviceId].map((n) => (
//                               <Typography
//                                 key={n.deviceId}
//                                 variant="body2"
//                                 sx={{ fontSize: 13 }}
//                               >
//                                 {n.deviceId} → {n.brightness}% | Lux: {n.lux} | I:
//                                 {n.current}A
//                               </Typography>
//                             ))
//                           )}
//                         </>
//                       )}

//                       {/* NODE */}
//                       {!device.isGateway && (
//                         <>
//                           <Divider sx={{ my: 1 }} />

//                           <Typography variant="body2">
//                             Trạng thái:{" "}
//                             {device.isOnline ? "Online ✅" : "Offline ❌"}
//                           </Typography>
//                           <Typography variant="body2">
//                             Độ sáng: {device.brightness}%
//                           </Typography>
//                           <Typography variant="body2">
//                             Lux: {device.lux}
//                           </Typography>
//                           <Typography variant="body2">
//                             Dòng: {device.current}A
//                           </Typography>
//                         </>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default Geography;





//code fix



import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Skeleton,
  useTheme,
  Button,
  Snackbar,
} from "@mui/material";
import {
  WiRain,
  WiDaySunny,
  WiCloudy,
  WiThunderstorm,
  WiDayRain,
} from "react-icons/wi";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import OpacityIcon from "@mui/icons-material/Opacity";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "../../theme";

// Fix icon
delete L.Icon.Default.prototype._getIconUrl;

// Icons
const gatewayIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3534/3534156.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const nodeOnlineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833593.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const nodeOfflineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833585.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// APIs
const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";
const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

// Map controller component
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

// Smart Recommendations Component
function SmartRecommendations({ devices, forecast, onAction }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [expanded, setExpanded] = useState(true);

  const generateRecommendations = () => {
    const recommendations = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 1. Gợi ý dựa trên hoàng hôn
    if (forecast && forecast[0]) {
      const sunsetTime = forecast[0].sunset;
      const [sunsetHour, sunsetMin] = sunsetTime.split(":").map(Number);
      const minutesUntilSunset = (sunsetHour * 60 + sunsetMin) - (currentHour * 60 + currentMinute);

      if (minutesUntilSunset > 0 && minutesUntilSunset <= 30) {
        recommendations.push({
          type: "sunset",
          priority: "high",
          icon: WbSunnyIcon,
          color: "#f59e0b",
          title: "Sắp đến giờ hoàng hôn",
          message: `Hoàng hôn lúc ${sunsetTime}. Nên bật đèn trong ${minutesUntilSunset} phút nữa.`,
          action: "Bật tất cả đèn 100%",
          actionValue: { brightness: 100, all: true }
        });
      }
    }

    // 2. Gợi ý dựa trên thời tiết
    if (forecast && forecast[0]?.precipitation > 60) {
      recommendations.push({
        type: "rain",
        priority: "medium",
        icon: OpacityIcon,
        color: "#3b82f6",
        title: "Cảnh báo mưa",
        message: `Xác suất mưa ${forecast[0].precipitation}%. Trời sẽ tối sớm hơn, nên tăng độ sáng.`,
        action: "Tăng độ sáng lên 80%",
        actionValue: { brightness: 80, all: true }
      });
    }

    // 3. Gợi ý tiết kiệm điện dựa trên lux
    const highLuxDevices = devices.filter(d => 
      d.lux > 300 && 
      d.brightness > 50 && 
      d.type === "node"
    );
    
    if (highLuxDevices.length > 0 && currentHour >= 6 && currentHour <= 17) {
      recommendations.push({
        type: "energy",
        priority: "low",
        icon: BatteryChargingFullIcon,
        color: "#22c55e",
        title: "Tiết kiệm điện năng",
        message: `${highLuxDevices.length} đèn có cường độ sáng môi trường cao (>300 lux). Giảm độ sáng để tiết kiệm điện.`,
        action: "Giảm xuống 30%",
        actionValue: { brightness: 30, devices: highLuxDevices }
      });
    }

    // 4. Cảnh báo đèn bất thường
    const abnormalDevices = devices.filter(d => {
      const avgCurrent = 0.5;
      return d.current && d.current > avgCurrent * 1.2;
    });

    if (abnormalDevices.length > 0) {
      recommendations.push({
        type: "warning",
        priority: "high",
        icon: WarningIcon,
        color: "#ef4444",
        title: "Cảnh báo dòng điện bất thường",
        message: `${abnormalDevices.length} đèn có dòng điện cao hơn bình thường: ${abnormalDevices.slice(0, 2).map(d => d.name || d.deviceId).join(", ")}${abnormalDevices.length > 2 ? "..." : ""}`,
        action: "Xem chi tiết",
        actionValue: { devices: abnormalDevices }
      });
    }

    // 5. Gợi ý chế độ đêm
    if (currentHour >= 23 || currentHour <= 5) {
      const brightDevices = devices.filter(d => d.brightness > 40 && d.type === "node");
      if (brightDevices.length > 0) {
        recommendations.push({
          type: "night",
          priority: "medium",
          icon: TrendingDownIcon,
          color: "#8b5cf6",
          title: "Chế độ đêm",
          message: `${brightDevices.length} đèn đang sáng quá mức cần thiết vào ban đêm. Giảm xuống 20% để tiết kiệm.`,
          action: "Bật chế độ đêm",
          actionValue: { brightness: 20, all: true }
        });
      }
    }

    // 6. Gợi ý dựa trên offline devices
    const offlineDevices = devices.filter(d => {
      if (!d.lastUpdated) return true;
      return (Date.now() - new Date(d.lastUpdated).getTime()) > 60000;
    });

    if (offlineDevices.length > 0) {
      recommendations.push({
        type: "offline",
        priority: "high",
        icon: WarningIcon,
        color: "#ef4444",
        title: "Thiết bị mất kết nối",
        message: `${offlineDevices.length} thiết bị offline: ${offlineDevices.slice(0, 3).map(d => d.name || d.deviceId).join(", ")}${offlineDevices.length > 3 ? "..." : ""}`,
        action: "Xem danh sách",
        actionValue: { devices: offlineDevices }
      });
    }

    // 7. Gợi ý dựa trên nhiệt độ
    if (forecast && forecast[0]) {
      if (forecast[0].tempMax > 35) {
        recommendations.push({
          type: "heat",
          priority: "low",
          icon: WbSunnyIcon,
          color: "#f59e0b",
          title: "Nhiệt độ cao",
          message: `Nhiệt độ cao nhất hôm nay ${forecast[0].tempMax}°C. Tiết kiệm điện bằng cách giảm độ sáng vào ban ngày.`,
          action: "Giảm độ sáng",
          actionValue: { brightness: 40, all: true }
        });
      }
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#fee2e2";
      case "medium": return "#fef3c7";
      case "low": return "#dcfce7";
      default: return "#f3f4f6";
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <LightbulbIcon sx={{ color: "#22d3ee", fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
            Gợi ý thông minh
          </Typography>
          <Chip 
            label={recommendations.length} 
            size="small"
            sx={{ bgcolor: "#22d3ee", color: "white", fontWeight: 600 }}
          />
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLessIcon sx={{ color: "#94a3b8" }} /> : <ExpandMoreIcon sx={{ color: "#94a3b8" }} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {recommendations.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              ✅ Hệ thống đang hoạt động tốt, không có gợi ý nào
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}>
            {recommendations.map((rec, idx) => {
              const Icon = rec.icon;
              return (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `2px solid ${rec.color}`,
                    background: getPriorityColor(rec.priority),
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Icon sx={{ color: rec.color, fontSize: 24, mt: 0.5 }} />
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                          {rec.title}
                        </Typography>
                        <Chip
                          label={rec.priority === "high" ? "Quan trọng" : rec.priority === "medium" ? "Trung bình" : "Thấp"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            bgcolor: rec.color,
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#334155", mb: 1 }}>
                        {rec.message}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onAction && onAction(rec)}
                        sx={{
                          bgcolor: rec.color,
                          color: "white",
                          fontSize: "0.75rem",
                          textTransform: "none",
                          "&:hover": { bgcolor: rec.color, opacity: 0.9 },
                        }}
                      >
                        {rec.action}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}

// Device Popup Component
function DevicePopup({ device, nodes, forecast, loadingForecast }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getWeatherIcon = (code) => {
    const map = {
      0: WiDaySunny, 1: WiDaySunny, 2: WiCloudy, 3: WiCloudy,
      45: WiCloudy, 48: WiCloudy, 51: WiDayRain, 53: WiDayRain,
      55: WiDayRain, 61: WiRain, 63: WiRain, 65: WiRain,
      80: WiRain, 81: WiRain, 95: WiThunderstorm,
    };
    return map[code] || WiCloudy;
  };

  const isGateway = device.type === "gateway" || !device.gatewayId;
  const isOnline = device.lastUpdated 
    ? (Date.now() - new Date(device.lastUpdated).getTime()) < 60000 
    : false;

  return (
    <Box sx={{ width: 320, p: 2, background: "#1e293b", color: "#e2e8f0", borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#22d3ee" }}>
          {device.name || device.deviceId}
        </Typography>
        <Chip
          label={isOnline ? "Online" : "Offline"}
          size="small"
          sx={{
            backgroundColor: isOnline ? "#22c55e" : "#ef4444",
            color: "white",
            fontWeight: 600,
            height: 22,
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1.5 }}>
        {device.location || "Không xác định"}
      </Typography>

      {!isGateway && (
        <>
          <Divider sx={{ borderColor: "#334155", mb: 1.5 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="#94a3b8">Độ sáng</Typography>
              <Typography variant="body1" sx={{ color: "#22d3ee", fontWeight: 600 }}>
                {device.brightness ?? 50}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={device.brightness ?? 50}
                sx={{ mt: 0.5, height: 6, borderRadius: 1, backgroundColor: "#334155" }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="#94a3b8">Cường độ sáng</Typography>
              <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                {device.lux ?? "—"} lux
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="#94a3b8">Dòng điện</Typography>
              <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                {device.current !== undefined ? `${device.current}A` : "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="#94a3b8">MAC</Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                {device.deviceId}
              </Typography>
            </Box>
          </Box>
          
          {device.lastUpdated && (
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 1 }}>
              Cập nhật: {new Date(device.lastUpdated).toLocaleString("vi-VN")}
            </Typography>
          )}
        </>
      )}

      {isGateway && nodes && (
        <>
          <Divider sx={{ borderColor: "#334155", mb: 1.5 }} />
          <Typography variant="body2" sx={{ color: "#fbbf24", fontWeight: 600, mb: 1 }}>
            Gateway • {nodes.length} Node
          </Typography>
          {nodes.length > 0 && (
            <Box sx={{ maxHeight: 120, overflow: "auto" }}>
              {nodes.slice(0, 5).map((n) => {
                const nodeOnline = n.lastUpdated 
                  ? (Date.now() - new Date(n.lastUpdated).getTime()) < 60000 
                  : false;
                return (
                  <Box key={n.deviceId} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      {n.name || n.deviceId}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: nodeOnline ? "#22c55e" : "#ef4444" }}>
                        {n.brightness ?? 50}%
                      </Typography>
                      <Typography variant="caption" color="#94a3b8">
                        {n.lux ?? "—"} lux
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </>
      )}

      {loadingForecast && (
        <>
          <Divider sx={{ borderColor: "#334155", my: 1.5 }} />
          <Box>
            <Skeleton variant="text" sx={{ bgcolor: "#334155" }} />
            <Skeleton variant="rectangular" height={80} sx={{ bgcolor: "#334155", mt: 1 }} />
          </Box>
        </>
      )}

      {!loadingForecast && forecast && (
        <>
          <Divider sx={{ borderColor: "#334155", my: 1.5 }} />
          <Typography variant="body2" sx={{ color: "#fbbf24", fontWeight: 600, mb: 1 }}>
            Dự báo 3 ngày
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8", fontSize: "0.7rem", p: 0.5, border: 0 }}>Ngày</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontSize: "0.7rem", p: 0.5, border: 0 }}>TT</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontSize: "0.7rem", p: 0.5, border: 0 }}>Mưa</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontSize: "0.7rem", p: 0.5, border: 0 }}>Nhiệt độ</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontSize: "0.7rem", p: 0.5, border: 0 }}>Hoàng hôn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.map((day, i) => {
                  const Icon = getWeatherIcon(day.weatherCode);
                  return (
                    <TableRow key={i}>
                      <TableCell sx={{ p: 0.5, fontSize: "0.7rem", border: 0, color: "#e2e8f0" }}>
                        {day.date}
                      </TableCell>
                      <TableCell sx={{ p: 0.5, border: 0 }}>
                        <Icon style={{ fontSize: "1.2rem", color: "#22d3ee" }} />
                      </TableCell>
                      <TableCell sx={{ p: 0.5, fontSize: "0.7rem", border: 0, color: day.precipitation > 50 ? "#ef4444" : "#22c55e" }}>
                        {day.precipitation}%
                      </TableCell>
                      <TableCell sx={{ p: 0.5, fontSize: "0.7rem", border: 0, color: "#e2e8f0" }}>
                        {day.tempMin}°-{day.tempMax}°
                      </TableCell>
                      <TableCell sx={{ p: 0.5, fontSize: "0.7rem", border: 0, color: "#e2e8f0" }}>
                        {day.sunset}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [devices, setDevices] = useState([]);
  const [gatewaysMap, setGatewaysMap] = useState({});
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const forecastCache = useRef({});
  const mountedRef = useRef(false);
  const token = localStorage.getItem("accessToken");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // API command to control brightness
  const apiCommand = async (gatewayIdOrDbId, brightness, target = undefined) => {
    const body = {};
    if (brightness !== undefined) body.brightness = brightness;
    if (target !== undefined && target !== null && String(target).trim() !== "") {
      body.target = String(target).trim();
    }

    const res = await fetch(`${API_BASE}/devices/${gatewayIdOrDbId}/command`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (res.status === 401) throw new Error("Phiên đăng nhập hết hạn!");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Gửi lệnh điều khiển thất bại");
    return data;
  };

  // Handle recommendation action
  const handleRecommendationAction = async (recommendation) => {
    try {
      const { actionValue } = recommendation;

      if (actionValue.all) {
        // Apply to all gateways
        const gateways = Object.values(gatewaysMap);
        for (const gw of gateways) {
          if (gw.gateway && gw.gateway._id) {
            await apiCommand(gw.gateway._id, actionValue.brightness);
          }
        }
        setSnackbar({ 
          open: true, 
          message: `✅ Đã áp dụng độ sáng ${actionValue.brightness}% cho tất cả thiết bị` 
        });
      } else if (actionValue.devices) {
        // Apply to specific devices
        for (const device of actionValue.devices) {
          // Find gateway for this device
          const gateway = Object.values(gatewaysMap).find(gw => 
            gw.nodes.some(n => n._id === device._id)
          );
          if (gateway) {
            await apiCommand(
              gateway.gateway._id, 
              actionValue.brightness || 50, 
              device.deviceId
            );
          }
        }
        setSnackbar({ 
          open: true, 
          message: `✅ Đã áp dụng cho ${actionValue.devices.length} thiết bị` 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: "ℹ️ Xem chi tiết trong danh sách thiết bị" 
        });
      }

      // Refresh devices after 1s
      setTimeout(() => {
        fetchDevices();
      }, 1000);
    } catch (e) {
      console.error("[RECOMMENDATION ACTION]", e);
      setSnackbar({ 
        open: true, 
        message: `❌ Lỗi: ${e.message}` 
      });
    }
  };

  // Fetch forecast with cache
  const fetchForecast = async (lat, lon) => {
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    
    if (forecastCache.current[key]) {
      setForecast(forecastCache.current[key]);
      setLoadingForecast(false);
      return;
    }

    try {
      setLoadingForecast(true);
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        daily: "weathercode,precipitation_probability_max,temperature_2m_max,temperature_2m_min,sunset",
        timezone: "Asia/Ho_Chi_Minh",
        forecast_days: 3,
      });

      const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
      const data = await res.json();

      if (data.daily) {
        const days = data.daily.time.map((date, i) => ({
          date: new Date(date).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" }),
          weatherCode: data.daily.weathercode[i],
          precipitation: data.daily.precipitation_probability_max[i],
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          sunset: new Date(data.daily.sunset[i]).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        }));
        
        forecastCache.current[key] = days;
        setForecast(days);
      }
    } catch (err) {
      console.error("Forecast error:", err);
    } finally {
      setLoadingForecast(false);
    }
  };

  // Fetch devices
  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
      if (res.status === 401) throw new Error("Hết phiên đăng nhập!");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("Lỗi tải thiết bị");

      const gateways = {};
      const orphanNodes = [];
      const allDevices = [];

      (data.devices || []).forEach((d) => {
        const dev = {
          _id: d._id,
          deviceId: d.deviceId,
          name: d.name,
          location: d.location || "",
          brightness: typeof d.brightness === "number" ? d.brightness : (d.brightness ?? 50),
          lux: typeof d.lux === "number" ? d.lux : (d.lux ?? undefined),
          current: typeof d.current === "number" ? d.current : (d.current ?? undefined),
          lastUpdated: d.lastUpdated ?? null,
          gps: d.gps || null,
          gatewayId: d.gatewayId || null,
          type: d.gatewayId ? "node" : (d.deviceId && d.deviceId.indexOf("ND_") === 0 ? "node" : "gateway"),
        };

        if (dev.gps?.lat && dev.gps?.lon) {
          allDevices.push(dev);

          if (!dev.gatewayId && dev.type === "gateway") {
            gateways[dev._id] = gateways[dev._id] || { gateway: dev, nodes: [] };
            gateways[dev._id].gateway = dev;
          } else if (dev.type === "node") {
            orphanNodes.push(dev);
          }
        }
      });

      // Map gateway deviceId to DB _id
      const gatewayDeviceIdToDbId = {};
      Object.values(gateways).forEach(g => {
        if (g.gateway && g.gateway.deviceId) {
          gatewayDeviceIdToDbId[g.gateway.deviceId] = g.gateway._id;
        }
      });

      // Attach orphan nodes to their gateways
      orphanNodes.forEach((node) => {
        const gwDbId = gatewayDeviceIdToDbId[node.gatewayId] || null;
        if (gwDbId && gateways[gwDbId]) {
          gateways[gwDbId].nodes.push(node);
        }
      });

      setDevices(allDevices);
      setGatewaysMap(gateways);

      // Calculate center
      if (allDevices.length > 0) {
        const avgLat = allDevices.reduce((sum, d) => sum + d.gps.lat, 0) / allDevices.length;
        const avgLon = allDevices.reduce((sum, d) => sum + d.gps.lon, 0) / allDevices.length;
        setMapCenter([avgLat, avgLon]);
      }

      setError("");
    } catch (e) {
      console.error("[FETCH DEVICES]", e);
      setError(e.message || "Lỗi khi lấy devices");
    } finally {
      setLoading(false);
    }
  };

  // Lifecycle with polling
  useEffect(() => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }

    mountedRef.current = true;
    fetchDevices();

    const interval = setInterval(() => {
      if (mountedRef.current) fetchDevices();
    }, 4000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [token]);

  // Handle marker click
  const handleMarkerClick = (device) => {
    setSelectedDevice(device);
    setLoadingForecast(true);
    fetchForecast(device.gps.lat, device.gps.lon);
  };

  // Filter devices
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = !searchTerm || 
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isOnline = d.lastUpdated 
        ? (Date.now() - new Date(d.lastUpdated).getTime()) < 60000 
        : false;

      const isGateway = d.type === "gateway" || !d.gatewayId;
      
      const matchStatus = filterStatus === "all" ||
        (filterStatus === "online" && isOnline) ||
        (filterStatus === "offline" && !isOnline) ||
        (filterStatus === "gateway" && isGateway);

      return matchSearch && matchStatus;
    });
  }, [devices, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const online = devices.filter(d => {
      if (!d.lastUpdated) return false;
      return (Date.now() - new Date(d.lastUpdated).getTime()) < 60000;
    }).length;

    return {
      total: devices.length,
      gateways: devices.filter(d => d.type === "gateway" || !d.gatewayId).length,
      online: online,
      offline: devices.length - online,
    };
  }, [devices]);

  return (
    <Box sx={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ color: "#22d3ee", fontWeight: 600 }}>
            Bản đồ
          </Typography>
          <Chip label={`${stats.total} thiết bị`} sx={{ bgcolor: "#1e293b", color: "#94a3b8" }} />
          <Chip 
            label={`${stats.online} online`} 
            sx={{ bgcolor: "#22c55e20", color: "#22c55e", fontWeight: 600 }} 
          />
        </Box>

        {/* Search & Filter */}
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            placeholder="Tìm kiếm thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: 250,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1e293b",
                color: "#e2e8f0",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#22d3ee" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <CloseIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box display="flex" gap={0.5}>
            {["all", "online", "offline", "gateway"].map(status => (
              <Chip
                key={status}
                label={status === "all" ? "Tất cả" : status === "online" ? "Online" : status === "offline" ? "Offline" : "Gateway"}
                onClick={() => setFilterStatus(status)}
                sx={{
                  bgcolor: filterStatus === status ? "#22d3ee20" : "#1e293b",
                  color: filterStatus === status ? "#22d3ee" : "#94a3b8",
                  border: filterStatus === status ? "1px solid #22d3ee" : "1px solid #334155",
                  fontWeight: filterStatus === status ? 600 : 400,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#334155" },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, backgroundColor: "#fee2e2", color: "#991b1b" }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress size={50} sx={{ color: "#22d3ee" }} />
        </Box>
      ) : (
        <Box>
          <Paper
            elevation={0}
            sx={{
              height: "60vh",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid #334155",
            position: "relative",
          }}
        >
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <MapController center={mapCenter} />

            {filteredDevices.map((device) => {
              const isGateway = device.type === "gateway" || !device.gatewayId;
              const isOnline = device.lastUpdated 
                ? (Date.now() - new Date(device.lastUpdated).getTime()) < 60000 
                : false;

              return (
                <Marker
                  key={device._id}
                  position={[device.gps.lat, device.gps.lon]}
                  icon={isGateway ? gatewayIcon : isOnline ? nodeOnlineIcon : nodeOfflineIcon}
                  eventHandlers={{ click: () => handleMarkerClick(device) }}
                >
                  <Popup>
                    <DevicePopup
                      device={device}
                      nodes={gatewaysMap[device._id]?.nodes}
                      forecast={selectedDevice?._id === device._id ? forecast : null}
                      loadingForecast={selectedDevice?._id === device._id && loadingForecast}
                    />
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Stats Panel */}
          <Paper
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 2,
              width: 260,
              zIndex: 1000,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{ p: 2, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => setStatsCollapsed(!statsCollapsed)}
            >
              <Typography variant="h6" sx={{ color: "#22d3ee", fontWeight: 600 }}>
                Thống kê
              </Typography>
              <IconButton size="small">
                <FilterListIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
              </IconButton>
            </Box>

            <Collapse in={!statsCollapsed}>
              <Box sx={{ px: 2, pb: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="#94a3b8">Tổng thiết bị</Typography>
                    <Typography variant="h5" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                      {stats.total}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94a3b8">Gateway</Typography>
                    <Typography variant="h5" sx={{ color: "#fbbf24", fontWeight: 600 }}>
                      {stats.gateways}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94a3b8">Online</Typography>
                    <Typography variant="h5" sx={{ color: "#22c55e", fontWeight: 600 }}>
                      {stats.online}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94a3b8">Offline</Typography>
                    <Typography variant="h5" sx={{ color: "#ef4444", fontWeight: 600 }}>
                      {stats.offline}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#334155", my: 1.5 }} />

                {/* Legend */}
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 1 }}>
                  Chú thích
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: "#fbbf24", borderRadius: "50%" }} />
                    <Typography variant="caption" color="#94a3b8">Gateway</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: "#22c55e", borderRadius: "50%" }} />
                    <Typography variant="caption" color="#94a3b8">Node Online</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: "#ef4444", borderRadius: "50%" }} />
                    <Typography variant="caption" color="#94a3b8">Node Offline</Typography>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Paper>

          {/* Quick Actions */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <IconButton
              sx={{
                bgcolor: "#1e293b",
                border: "1px solid #334155",
                "&:hover": { bgcolor: "#334155" },
              }}
              onClick={() => {
                if (devices.length > 0) {
                  const avgLat = devices.reduce((sum, d) => sum + d.gps.lat, 0) / devices.length;
                  const avgLon = devices.reduce((sum, d) => sum + d.gps.lon, 0) / devices.length;
                  setMapCenter([avgLat, avgLon]);
                }
              }}
            >
              <MyLocationIcon sx={{ color: "#22d3ee" }} />
            </IconButton>
          </Box>
        </Paper>

        {/* Smart Recommendations - Below Map */}
        <Box sx={{ mt: 2 }}>
          <SmartRecommendations 
            devices={devices} 
            forecast={forecast} 
            onAction={handleRecommendationAction}
          />
        </Box>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #334155",
          }
        }}
      />
    </Box>
  );
};

export default Geography;