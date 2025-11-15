// // src/pages/dashboard/Dashboard.jsx
// import { Box, Button, IconButton, Typography, Alert, useTheme } from "@mui/material";
// import { tokens } from "../../theme";
// import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
// import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";
// import PeopleIcon from "@mui/icons-material/People";
// import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
// import TrafficIcon from "@mui/icons-material/Traffic";

// import Header from "../../components/Header";
// import StatBox from "../../components/StatBox";
// import RealtimeLineChart from "../../components/RealtimeLineChart";

// import { useNavigate } from "react-router-dom";
// import { useLightState } from "../../App";
// import { useEffect, useState } from "react";
// import { formatDate } from "@fullcalendar/react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // ====== ICONS ======
// delete L.Icon.Default.prototype._getIconUrl;

// const gatewayIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/3534/3534156.png",
//   iconSize: [28, 28],
// });
// const nodeIconOnline = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833593.png",
//   iconSize: [20, 20],
// });
// const nodeIconOffline = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833585.png",
//   iconSize: [20, 20],
// });

// const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

// const Dashboard = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const navigate = useNavigate();
//   const { lightStates, syncLightStatesWithSchedule, currentEvents } = useLightState();
//   const [statusMessage, setStatusMessage] = useState("");

//   // Map states
//   const [gateways, setGateways] = useState([]);
//   const [gatewayNodes, setGatewayNodes] = useState({});
//   const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
//   const [mapError, setMapError] = useState("");

//   // Thêm: danh sách deviceId (node) để vẽ chart
//   const [nodeDeviceIds, setNodeDeviceIds] = useState([]);

//   const token = localStorage.getItem("accessToken");
//   const authHeaders = () => ({
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   });

//   // Fetch devices and build gateways + nodes map
//   const fetchDevices = async () => {
//     try {
//       setMapError("");
//       const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(`GET /devices failed (${res.status}) ${text}`);
//       }
//       const data = await res.json();
//       if (!data.ok || !Array.isArray(data.devices)) {
//         throw new Error("Invalid /devices response");
//       }

//       const all = data.devices;

//       const gwList = all
//         .filter(d => !d.gatewayId && d.gps && d.gps.lat != null && d.gps.lon != null)
//         .map(d => ({
//           ...d,
//           isOnline: typeof d.isOnline === "boolean" ? d.isOnline : (d.lastUpdated ? (Date.now() - new Date(d.lastUpdated).getTime() < 90_000) : true)
//         }));

//       const nodes = all
//         .filter(d => d.gatewayId)
//         .map(d => ({
//           ...d,
//           isOnline: typeof d.isOnline === "boolean" ? d.isOnline : (d.lastUpdated ? (Date.now() - new Date(d.lastUpdated).getTime() < 90_000) : true)
//         }));

//       const map = {};
//       gwList.forEach(gw => { map[gw.deviceId] = []; });
//       nodes.forEach(n => {
//         const gwId = n.gatewayId;
//         if (!gwId) return;
//         if (!map[gwId]) map[gwId] = [];
//         map[gwId].push(n);
//       });

//       setGateways(gwList);
//       setGatewayNodes(map);

//       if (gwList.length > 0) {
//         const avgLat = gwList.reduce((s, d) => s + Number(d.gps.lat), 0) / gwList.length;
//         const avgLon = gwList.reduce((s, d) => s + Number(d.gps.lon), 0) / gwList.length;
//         setMapCenter([avgLat, avgLon]);
//       }

//       // Lấy danh sách deviceId của tất cả node để vẽ chart
//       const nodeIds = nodes.map(n => n.deviceId);
//       setNodeDeviceIds(nodeIds);

//     } catch (err) {
//       console.error("Fetch device error:", err);
//       setMapError(err.message || "Lỗi khi lấy devices");
//       setGateways([]);
//       setGatewayNodes({});
//       setNodeDeviceIds([]);
//     }
//   };

//   useEffect(() => {
//     if (!token) {
//       setMapError("Bạn chưa đăng nhập.");
//       return;
//     }
//     fetchDevices();

//     const id = setInterval(() => fetchDevices(), 10_000);
//     return () => clearInterval(id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   // Schedule message
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date();
//       const activeEvents = syncLightStatesWithSchedule(now);
//       if (activeEvents.length > 0) {
//         setStatusMessage(
//           `Đang áp dụng lịch trình: ${activeEvents
//             .map(
//               (e) =>
//                 `${e.extendedProps.lightId} (${e.extendedProps.action === "on" ? "Bật" : "Tắt"} từ ${formatDate(e.start, {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   hour12: false,
//                 })}${e.end ? " đến " + formatDate(e.end, { hour: "2-digit", minute: "2-digit", hour12: false }) : ""})`
//             )
//             .join(", ")}` );
//       } else {
//         setStatusMessage("Không có lịch trình đang hoạt động.");
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [syncLightStatesWithSchedule, currentEvents]);

//   // Logout
//   const handleLogout = () => {
//     localStorage.removeItem("isAuthenticated");
//     navigate("/login");
//   };

//   return (
//     <Box m="20px">
//       {/* HEADER */}
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
//         <Box>
//           <Button
//             sx={{
//               backgroundColor: colors.blueAccent[700],
//               color: colors.grey[100],
//               fontSize: "14px",
//               fontWeight: "bold",
//               padding: "10px 20px",
//               mr: 2,
//             }}
//           >
//             <DownloadOutlinedIcon sx={{ mr: "10px" }} />
//             Download Reports
//           </Button>
//           <Button
//             onClick={handleLogout}
//             sx={{
//               backgroundColor: colors.redAccent[500],
//               color: colors.grey[100],
//               fontSize: "14px",
//               fontWeight: "bold",
//               padding: "10px 20px",
//               "&:hover": { backgroundColor: colors.redAccent[600] },
//             }}
//           >
//             Logout
//           </Button>
//         </Box>
//       </Box>

//       {statusMessage && (
//         <Alert severity="info" sx={{ mb: "20px" }}>
//           {statusMessage}
//         </Alert>
//       )}

//       {/* GRID */}
//       <Box
//         display="grid"
//         gridTemplateColumns="repeat(12, 1fr)"
//         gridAutoRows="140px"
//         gap="20px"
//       >
//         {/* ROW 1 */}
//         <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
//           <StatBox
//             title={Object.keys(lightStates).length}
//             subtitle="Tổng số đèn"
//             progress="0.75"
//             increase="+14%"
//             icon={<LightbulbOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//           />
//         </Box>
//         <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
//           <StatBox
//             title="1,200"
//             subtitle="Người dùng"
//             progress="0.50"
//             increase="+21%"
//             icon={<PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//           />
//         </Box>
//         <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
//           <StatBox
//             title="750"
//             subtitle="Đơn hàng"
//             progress="0.30"
//             increase="+5%"
//             icon={<PointOfSaleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//           />
//         </Box>
//         <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
//           <StatBox
//             title="350"
//             subtitle="Lượt truy cập"
//             progress="0.80"
//             increase="+43%"
//             icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//           />
//         </Box>

//         {/* ROW 2 - Realtime chart (CHỈ 10 ĐIỂM CUỐI TRONG 30) */}
//         <Box gridColumn="span 8" gridRow="span 2" backgroundColor={colors.primary[400]} p="15px">
//           <Box display="flex" justifyContent="space-between" alignItems="center" mb="10px">
//             <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
//               Dòng (A) theo thời gian (Realtime)
//             </Typography>
//             <IconButton>
//               <DownloadOutlinedIcon sx={{ fontSize: "26px", color: colors.greenAccent[500] }} />
//             </IconButton>
//           </Box>
//           <Box height="220px">
//             <RealtimeLineChart
//               devices={nodeDeviceIds}
//               periodMinutes={60}
//               maxPoints={30}           // Lấy 30 điểm từ API
//               pollIntervalMs={5000}
//               // Tự cắt 10 điểm cuối trong component
//               sliceLastPoints={10}     // MỚI: chỉ hiển thị 10 điểm cuối
//               pointSize={16}
//               pointLabelYOffset={-18}
//             />
//           </Box>
//         </Box>

//         {/* Trạng thái bóng đèn */}
//         <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} overflow="auto">
//           <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
//             <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
//               Trạng thái bóng đèn
//             </Typography>
//           </Box>
//           <Box p="15px">
//             {Object.keys(lightStates).length === 0 ? (
//               <Typography color={colors.grey[300]} variant="body2">Chưa có dữ liệu đèn</Typography>
//             ) : (
//               Object.keys(lightStates).map((lightId) => (
//                 <Box key={lightId} mb="15px" sx={{ display: "flex", alignItems: "center" }}>
//                   {lightStates[lightId].isOn ? (
//                     <LightbulbIcon sx={{ color: colors.greenAccent[500], fontSize: "24px", mr: "10px" }} />
//                   ) : (
//                     <LightbulbOutlinedIcon sx={{ color: colors.grey[500], fontSize: "24px", mr: "10px" }} />
//                   )}
//                   <Box>
//                     <Typography color={colors.grey[100]} variant="h6">
//                       Bóng đèn {lightId}
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       color={lightStates[lightId].isOn ? colors.greenAccent[500] : colors.redAccent[500]}
//                     >
//                       Trạng thái: {lightStates[lightId].isOn ? "Bật" : "Tắt"}
//                     </Typography>
//                     <Typography variant="body2" color={colors.grey[300]}>
//                       Độ sáng: {lightStates[lightId].brightness}%
//                     </Typography>
//                   </Box>
//                 </Box>
//               ))
//             )}
//           </Box>
//         </Box>

//         {/* ROW 3 - SMALL REAL MAP */}
//         <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} padding="20px">
//           <Typography variant="h5" fontWeight="600" sx={{ marginBottom: "15px" }}>
//             Bản đồ đèn (nhỏ)
//           </Typography>

//           {mapError ? (
//             <Alert severity="error">{mapError}</Alert>
//           ) : (
//             <Box height="200px" borderRadius="8px" overflow="hidden">
//               <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 {gateways.map((gw) => (
//                   <Marker key={gw._id} position={[gw.gps.lat, gw.gps.lon]} icon={gatewayIcon}>
//                     <Popup minWidth={220}>
//                       <Box>
//                         <Typography variant="h6" sx={{ color: colors.greenAccent[400], mb: 0.5 }}>{gw.name || gw.deviceId}</Typography>
//                         <Typography variant="body2" color={colors.grey[200]}>MAC: {gw.deviceId}</Typography>
//                         <Typography variant="body2" color={colors.grey[200]}>Vị trí: {gw.location || "Chưa xác định"}</Typography>
//                         <Box sx={{ height: 8 }} />
//                         <Typography variant="subtitle2" color={colors.blueAccent[200]}>Nodes:</Typography>

//                         {(!gatewayNodes[gw.deviceId] || gatewayNodes[gw.deviceId].length === 0) ? (
//                           <Typography variant="body2" color={colors.grey[300]}>Không có node</Typography>
//                         ) : (
//                           gatewayNodes[gw.deviceId].map(n => (
//                             <Box key={n.deviceId} sx={{ display: "flex", justifyContent: "space-between", gap: 8, mt: 1 }}>
//                               <Box>
//                                 <Typography variant="body2" sx={{ fontWeight: 700 }}>{n.deviceId}</Typography>
//                                 <Typography variant="caption" color={colors.grey[300]}>Lux: {n.lux ?? "—"} • I: {n.current ?? "—"}A</Typography>
//                               </Box>
//                               <Box sx={{ display: "flex", alignItems: "center" }}>
//                                 <Box sx={{
//                                   width: 10,
//                                   height: 10,
//                                   borderRadius: "50%",
//                                   backgroundColor: n.isOnline ? colors.greenAccent[400] : colors.redAccent[400],
//                                   mr: 1
//                                 }} />
//                                 <Typography variant="caption" color={n.isOnline ? colors.greenAccent[200] : colors.redAccent[200]}>
//                                   {n.isOnline ? "Online" : "Offline"}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                           ))
//                         )}
//                       </Box>
//                     </Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;




///code fix


// // src/scenes/dashboard/index.jsx
// import { Box, Button, Typography, Alert, useTheme, Skeleton, Chip, Stack } from "@mui/material";
// import { tokens } from "../../theme";
// import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";
// import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
// import DeviceHubIcon from "@mui/icons-material/DeviceHub";
// import Header from "../../components/Header";
// import StatBox from "../../components/StatBox";
// import RealtimeLineChart from "../../components/RealtimeLineChart";
// import { useNavigate } from "react-router-dom";
// import { useLightState } from "../../App";
// import { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix Leaflet icon
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// const gatewayIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/3534/3534156.png",
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
//   popupAnchor: [0, -40],
// });

// const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

// const Dashboard = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const navigate = useNavigate();
//   const { lightStates, syncLightStatesWithSchedule } = useLightState();

//   const [gatewaysMap, setGatewaysMap] = useState({});
//   const [statusMessage, setStatusMessage] = useState("");
//   const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("accessToken");
//   const mountedRef = useRef(false);

//   const authHeaders = useCallback(() => ({
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   }), [token]);

//   const fetchDevices = useCallback(async () => {
//     if (!token) {
//       setError("Chưa đăng nhập");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
//       if (!res.ok) throw new Error("Lỗi tải thiết bị");

//       const { devices } = await res.json();
//       const prev = gatewaysMap;
//       const gateways = {};
//       const orphanNodes = [];

//       devices.forEach(d => {
//         const dev = {
//           _id: d._id,
//           deviceId: d.deviceId,
//           name: d.name || d.deviceId,
//           location: d.location || "",
//           brightness: d.brightness ?? 50,
//           lux: d.lux ?? null,
//           current: d.current ?? null,
//           lastUpdated: d.lastUpdated,
//           gps: d.gps || null,
//           gatewayId: d.gatewayId || null,
//           isOnline: d.lastUpdated ? (Date.now() - new Date(d.lastUpdated).getTime() < 90000) : false,
//         };

//         if (!dev.gatewayId) {
//           gateways[dev._id] = gateways[dev._id] || { gateway: dev, nodes: [], open: true };
//         } else {
//           orphanNodes.push(dev);
//         }
//       });

//       const gwMap = {};
//       Object.values(gateways).forEach(g => gwMap[g.gateway.deviceId] = g.gateway._id);

//       orphanNodes.forEach(n => {
//         const gwId = gwMap[n.gatewayId] || "__UNGROUPED__";
//         if (!gateways[gwId]) {
//           gateways[gwId] = {
//             gateway: { _id: gwId, deviceId: n.gatewayId, name: `Gateway ${n.gatewayId}`, isOnline: false },
//             nodes: [],
//             open: true
//           };
//         }
//         gateways[gwId].nodes.push(n);
//       });

//       Object.keys(gateways).forEach(k => {
//         if (prev[k]?.open !== undefined) gateways[k].open = prev[k].open;
//       });

//       setGatewaysMap(gateways);

//       const validGws = Object.values(gateways).map(g => g.gateway).filter(g => g.gps?.lat && g.gps?.lon);
//       if (validGws.length > 0) {
//         const avgLat = validGws.reduce((s, g) => s + g.gps.lat, 0) / validGws.length;
//         const avgLon = validGws.reduce((s, g) => s + g.gps.lon, 0) / validGws.length;
//         setMapCenter([avgLat, avgLon]);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, authHeaders, gatewaysMap]);

//   useEffect(() => {
//     if (!mountedRef.current) {
//       mountedRef.current = true;
//       fetchDevices();
//       const i1 = setInterval(fetchDevices, 4000);
//       return () => clearInterval(i1);
//     }
//   }, [fetchDevices]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date();
//       const active = syncLightStatesWithSchedule(now);
//       if (active.length > 0) {
//         const msg = active.map(e => {
//           const start = new Date(e.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
//           const action = e.extendedProps.action === "on" ? "Bật" : "Tắt";
//           return `${e.extendedProps.lightId} ${action} ${start}`;
//         }).join(" • ");
//         setStatusMessage(`Lịch: ${msg}`);
//       } else {
//         setStatusMessage("Không có lịch");
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [syncLightStatesWithSchedule]);

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   const nodeDeviceIds = useMemo(() => {
//     const ids = [];
//     Object.values(gatewaysMap).forEach(entry => {
//       entry.nodes.forEach(node => {
//         if (node.deviceId) ids.push(node.deviceId);
//       });
//     });
//     return ids;
//   }, [gatewaysMap]);

//   const totalGateways = useMemo(() => Object.keys(gatewaysMap).length, [gatewaysMap]);
//   const totalNodes = useMemo(() => {
//     let count = 0;
//     Object.values(gatewaysMap).forEach(g => count += g.nodes.length);
//     return count;
//   }, [gatewaysMap]);

//   return (
//     <Box m="20px">
//       {/* HEADER */}
//       <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
//         <Header title="DASHBOARD" subtitle="Tổng quan hệ thống đèn thông minh" />
//         <Stack direction="row" spacing={1}>
//           <Button startIcon={<DownloadOutlinedIcon />} sx={{ bgcolor: colors.blueAccent[700], color: "white", fontWeight: "bold" }}>
//             Báo cáo
//           </Button>
//           <Button onClick={handleLogout} sx={{ bgcolor: colors.redAccent[600], color: "white", fontWeight: "bold" }}>
//             Đăng xuất
//           </Button>
//         </Stack>
//       </Box>

//       {/* STATUS */}
//       {statusMessage && (
//         <Alert icon={<LightbulbIcon />} severity="info" sx={{ mt: 2, borderRadius: 2 }}>
//           {statusMessage}
//         </Alert>
//       )}

//       {error && (
//         <Alert severity="error" sx={{ mt: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {/* GRID */}
//       <Box
//         display="grid"
//         gridTemplateColumns="repeat(12, 1fr)"
//         gridAutoRows="140px"
//         gap="20px"
//         mt="20px"
//       >
//         {/* KPI 1: TỔNG GATEWAY */}
//         <Box gridColumn="span 6" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
//           <Box display="flex" alignItems="center" gap={2}>
//             <DeviceHubIcon sx={{ color: colors.blueAccent[600], fontSize: 40 }} />
//             <Box>
//               <Typography variant="h4" fontWeight={700} color={colors.grey[100]}>
//                 {totalGateways}
//               </Typography>
//               <Typography variant="body2" color={colors.grey[400]} fontWeight={500}>
//                 Tổng số Gateway
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* KPI 2: TỔNG ĐÈN */}
//         <Box gridColumn="span 6" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
//           <Box display="flex" alignItems="center" gap={2}>
//             <LightbulbOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: 40 }} />
//             <Box>
//               <Typography variant="h4" fontWeight={700} color={colors.grey[100]}>
//                 {totalNodes}
//               </Typography>
//               <Typography variant="body2" color={colors.grey[400]} fontWeight={500}>
//                 Tổng số đèn
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* BIỂU ĐỒ DÒNG ĐIỆN */}
//         <Box gridColumn="span 6" gridRow="span 3" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
//           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//             <Typography variant="h5" fontWeight={600} color={colors.grey[100]}>
//               Dòng điện realtime
//             </Typography>
//             <Chip label={`${nodeDeviceIds.length} node`} color="success" size="small" />
//           </Box>
//           <Box height={280}>
//             {loading ? (
//               <Skeleton variant="rectangular" height="100%" animation="wave" sx={{ borderRadius: 2 }} />
//             ) : nodeDeviceIds.length === 0 ? (
//               <Box textAlign="center" pt={8}>
//                 <LightbulbOutlinedIcon sx={{ fontSize: 60, color: colors.grey[500] }} />
//                 <Typography color={colors.grey[400]} mt={2} variant="h6">
//                   Chưa có dữ liệu dòng điện
//                 </Typography>
//               </Box>
//             ) : (
//               <RealtimeLineChart
//                 devices={nodeDeviceIds}
//                 periodMinutes={3}
//                 maxPoints={30}
//                 pollIntervalMs={5000}
//                 yScale={{
//                   type: "linear",
//                   min: 0,
//                   max: 1.0,
//                   stacked: false,
//                   tickAmount: 11,
//                 }}
//                 annotations={[]}
//               />
//             )}
//           </Box>
//         </Box>

//         {/* BẢN ĐỒ HỆ THỐNG */}
//         <Box gridColumn="span 6" gridRow="span 3" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
//           <Typography variant="h5" fontWeight={600} color={colors.grey[100]} mb={2}>
//             Bản đồ hệ thống đèn
//           </Typography>
//           {loading ? (
//             <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
//           ) : Object.keys(gatewaysMap).length === 0 ? (
//             <Box textAlign="center" pt={8}>
//               <Typography color={colors.grey[400]} variant="h6">
//                 Chưa có gateway nào được thêm
//               </Typography>
//             </Box>
//           ) : (
//             <Box height={280} borderRadius={2} overflow="hidden" boxShadow={6}>
//               <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                 />
//                 {Object.values(gatewaysMap).map(entry => {
//                   const gw = entry.gateway;
//                   if (!gw.gps?.lat || !gw.gps?.lon) return null;
//                   return (
//                     <Marker key={gw._id} position={[gw.gps.lat, gw.gps.lon]} icon={gatewayIcon}>
//                       <Popup>
//                         <Box minWidth={240} p={1}>
//                           <Typography fontWeight={700} color={colors.blueAccent[300]} variant="subtitle1">
//                             {gw.name}
//                           </Typography>
//                           <Typography fontSize="0.85rem" color={colors.grey[300]}>
//                             MAC: {gw.deviceId}
//                           </Typography>
//                           <Typography fontSize="0.85rem" color={colors.grey[300]}>
//                             Vị trí: {gw.location || "Chưa xác định"}
//                           </Typography>
//                           <Box mt={1} pt={1} borderTop={`1px solid ${colors.grey[700]}`}>
//                             <Typography fontSize="0.8rem" fontWeight={600} color={colors.greenAccent[400]}>
//                               {entry.nodes.length} node{entry.nodes.length > 1 ? "s" : ""}
//                             </Typography>
//                             {entry.nodes.slice(0, 5).map(n => (
//                               <Box key={n._id} fontSize="0.75rem" color={colors.grey[300]} mt={0.5}>
//                                 • {n.name} ({n.brightness}%)
//                               </Box>
//                             ))}
//                             {entry.nodes.length > 5 && (
//                               <Typography fontSize="0.7rem" color={colors.grey[500]} mt={0.5}>
//                                 ...và {entry.nodes.length - 5} node khác
//                               </Typography>
//                             )}
//                           </Box>
//                         </Box>
//                       </Popup>
//                     </Marker>
//                   );
//                 })}
//               </MapContainer>
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;


// src/scenes/dashboard/index.jsx
import { Box, Button, Typography, Alert, useTheme, Skeleton, Chip, Stack } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import RealtimeLineChart from "../../components/RealtimeLineChart";
import { useNavigate } from "react-router-dom";
import { useLightState } from "../../App";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const gatewayIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3534/3534156.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { lightStates, syncLightStatesWithSchedule } = useLightState();

  const [gatewaysMap, setGatewaysMap] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const mountedRef = useRef(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchDevices = useCallback(async () => {
    if (!token) {
      setError("Chưa đăng nhập");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Lỗi tải thiết bị");

      const { devices } = await res.json();
      const prev = gatewaysMap;
      const gateways = {};
      const orphanNodes = [];

      devices.forEach(d => {
        const dev = {
          _id: d._id,
          deviceId: d.deviceId,
          name: d.name || d.deviceId,
          location: d.location || "",
          brightness: d.brightness ?? 50,
          lux: d.lux ?? null,
          current: d.current ?? null,
          lastUpdated: d.lastUpdated,
          gps: d.gps || null,
          gatewayId: d.gatewayId || null,
          isOnline: d.lastUpdated ? (Date.now() - new Date(d.lastUpdated).getTime() < 90000) : false,
        };

        if (!dev.gatewayId) {
          gateways[dev._id] = gateways[dev._id] || { gateway: dev, nodes: [], open: true };
        } else {
          orphanNodes.push(dev);
        }
      });

      const gwMap = {};
      Object.values(gateways).forEach(g => gwMap[g.gateway.deviceId] = g.gateway._id);

      orphanNodes.forEach(n => {
        const gwId = gwMap[n.gatewayId] || "__UNGROUPED__";
        if (!gateways[gwId]) {
          gateways[gwId] = {
            gateway: { _id: gwId, deviceId: n.gatewayId, name: `Gateway ${n.gatewayId}`, isOnline: false },
            nodes: [],
            open: true
          };
        }
        gateways[gwId].nodes.push(n);
      });

      Object.keys(gateways).forEach(k => {
        if (prev[k]?.open !== undefined) gateways[k].open = prev[k].open;
      });

      setGatewaysMap(gateways);

      const validGws = Object.values(gateways).map(g => g.gateway).filter(g => g.gps?.lat && g.gps?.lon);
      if (validGws.length > 0) {
        const avgLat = validGws.reduce((s, g) => s + g.gps.lat, 0) / validGws.length;
        const avgLon = validGws.reduce((s, g) => s + g.gps.lon, 0) / validGws.length;
        setMapCenter([avgLat, avgLon]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders, gatewaysMap]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      fetchDevices();
      const i1 = setInterval(fetchDevices, 4000);
      return () => clearInterval(i1);
    }
  }, [fetchDevices]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const active = syncLightStatesWithSchedule(now);
      if (active.length > 0) {
        const msg = active.map(e => {
          const start = new Date(e.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          const action = e.extendedProps.action === "on" ? "Bật" : "Tắt";
          return `${e.extendedProps.lightId} ${action} ${start}`;
        }).join(" • ");
        setStatusMessage(`Lịch: ${msg}`);
      } else {
        setStatusMessage("Không có lịch");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [syncLightStatesWithSchedule]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const nodeDeviceIds = useMemo(() => {
    const ids = [];
    Object.values(gatewaysMap).forEach(entry => {
      entry.nodes.forEach(node => {
        if (node.deviceId) ids.push(node.deviceId);
      });
    });
    return ids;
  }, [gatewaysMap]);

  const totalGateways = useMemo(() => Object.keys(gatewaysMap).length, [gatewaysMap]);
  const totalNodes = useMemo(() => {
    let count = 0;
    Object.values(gatewaysMap).forEach(g => count += g.nodes.length);
    return count;
  }, [gatewaysMap]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Header title="DASHBOARD" subtitle="Tổng quan hệ thống đèn thông minh" />
        <Stack direction="row" spacing={1}>
          <Button startIcon={<DownloadOutlinedIcon />} sx={{ bgcolor: colors.blueAccent[700], color: "white", fontWeight: "bold" }}>
            Báo cáo
          </Button>
          <Button onClick={handleLogout} sx={{ bgcolor: colors.redAccent[600], color: "white", fontWeight: "bold" }}>
            Đăng xuất
          </Button>
        </Stack>
      </Box>

      {/* STATUS */}
      {statusMessage && (
        <Alert icon={<LightbulbIcon />} severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          {statusMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* GRID */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mt="20px"
      >
        {/* KPI 1: TỔNG GATEWAY */}
        <Box gridColumn="span 6" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <DeviceHubIcon sx={{ color: colors.blueAccent[600], fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight={700} color={colors.grey[100]}>
                {totalGateways}
              </Typography>
              <Typography variant="body2" color={colors.grey[400]} fontWeight={500}>
                Tổng số Gateway
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* KPI 2: TỔNG ĐÈN */}
        <Box gridColumn="span 6" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <LightbulbOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight={700} color={colors.grey[100]}>
                {totalNodes}
              </Typography>
              <Typography variant="body2" color={colors.grey[400]} fontWeight={500}>
                Tổng số đèn
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* BIỂU ĐỒ DÒNG ĐIỆN */}
        <Box gridColumn="span 6" gridRow="span 3" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={600} color={colors.grey[100]}>
              Dòng điện realtime
            </Typography>
            <Chip label={`${nodeDeviceIds.length} node`} color="success" size="small" />
          </Box>
          <Box height={280}>
            {loading ? (
              <Skeleton variant="rectangular" height="100%" animation="wave" sx={{ borderRadius: 2 }} />
            ) : nodeDeviceIds.length === 0 ? (
              <Box textAlign="center" pt={8}>
                <LightbulbOutlinedIcon sx={{ fontSize: 60, color: colors.grey[500] }} />
                <Typography color={colors.grey[400]} mt={2} variant="h6">
                  Chưa có dữ liệu dòng điện
                </Typography>
              </Box>
            ) : (
              <RealtimeLineChart
                devices={nodeDeviceIds}
                periodMinutes={43200}
                maxPoints={10000}
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
        </Box>

        {/* BẢN ĐỒ HỆ THỐNG */}
        <Box gridColumn="span 6" gridRow="span 3" bgcolor={colors.primary[400]} p={3} borderRadius={2}>
          <Typography variant="h5" fontWeight={600} color={colors.grey[100]} mb={2}>
            Bản đồ hệ thống đèn
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          ) : Object.keys(gatewaysMap).length === 0 ? (
            <Box textAlign="center" pt={8}>
              <Typography color={colors.grey[400]} variant="h6">
                Chưa có gateway nào được thêm
              </Typography>
            </Box>
          ) : (
            <Box height={280} borderRadius={2} overflow="hidden" boxShadow={6}>
              <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {Object.values(gatewaysMap).map(entry => {
                  const gw = entry.gateway;
                  if (!gw.gps?.lat || !gw.gps?.lon) return null;
                  return (
                    <Marker key={gw._id} position={[gw.gps.lat, gw.gps.lon]} icon={gatewayIcon}>
                      <Popup>
                        <Box minWidth={240} p={1}>
                          <Typography fontWeight={700} color={colors.blueAccent[300]} variant="subtitle1">
                            {gw.name}
                          </Typography>
                          <Typography fontSize="0.85rem" color={colors.grey[300]}>
                            MAC: {gw.deviceId}
                          </Typography>
                          <Typography fontSize="0.85rem" color={colors.grey[300]}>
                            Vị trí: {gw.location || "Chưa xác định"}
                          </Typography>
                          <Box mt={1} pt={1} borderTop={`1px solid ${colors.grey[700]}`}>
                            <Typography fontSize="0.8rem" fontWeight={600} color={colors.greenAccent[400]}>
                              {entry.nodes.length} node{entry.nodes.length > 1 ? "s" : ""}
                            </Typography>
                            {entry.nodes.slice(0, 5).map(n => (
                              <Box key={n._id} fontSize="0.75rem" color={colors.grey[300]} mt={0.5}>
                                • {n.name} ({n.brightness}%)
                              </Box>
                            ))}
                            {entry.nodes.length > 5 && (
                              <Typography fontSize="0.7rem" color={colors.grey[500]} mt={0.5}>
                                ...và {entry.nodes.length - 5} node khác
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;