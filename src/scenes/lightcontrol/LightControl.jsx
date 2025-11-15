// // LightControl.jsx (brightness per-node only, gateway brightness removed)

// import { useEffect, useState, useRef } from "react";
// import {
//   Box,
//   Typography,
//   useTheme,
//   Button,
//   Slider,
//   TextField,
//   Alert,
//   Select,
//   MenuItem,
//   IconButton,
//   Tooltip,
//   Collapse,
//   List,
//   ListItem,
//   Divider
// } from "@mui/material";
// import { tokens } from "../../theme";
// import Header from "../../components/Header";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";
// // const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// const LightControl = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [gatewaysMap, setGatewaysMap] = useState({}); // key: gateway DB _id => { gateway, nodes, open }
//   const [localBrightness, setLocalBrightness] = useState({}); // keyed by device _id (for slider while dragging)
//   const [pendingDevices, setPendingDevices] = useState([]);
//   const [error, setError] = useState("");

//   const [newLightName, setNewLightName] = useState("");
//   const [newLightLocation, setNewLightLocation] = useState("");
//   const [newLightMac, setNewLightMac] = useState("");
//   const [newLightLat, setNewLightLat] = useState("");
//   const [newLightLon, setNewLightLon] = useState("");

//   const token = localStorage.getItem("accessToken");
//   const mountedRef = useRef(false);

//   const authHeaders = () => ({
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   });

//   // Send brightness-only command. target optional (node.deviceId)
//   const apiCommand = async (gatewayIdOrDbId, brightness, target = undefined) => {
//     const body = {};
//     if (brightness !== undefined) body.brightness = brightness;
//     if (target !== undefined && target !== null && String(target).trim() !== "") body.target = String(target).trim();

//     const res = await fetch(`${API_BASE}/devices/${gatewayIdOrDbId}/command`, {
//       method: "POST",
//       headers: authHeaders(),
//       body: JSON.stringify(body),
//     });

//     if (res.status === 401) throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
//     const data = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(data.message || "Gửi lệnh điều khiển thất bại");
//     return data;
//   };

//   const apiAddDevice = async (name, location, mac, lat, lon) => {
//     const payload = { name, location, mac };
//     if (lat !== undefined && lat !== null && lat !== "") payload.lat = parseFloat(lat);
//     if (lon !== undefined && lon !== null && lon !== "") payload.lon = parseFloat(lon);

//     const res = await fetch(`${API_BASE}/devices`, {
//       method: "POST",
//       headers: authHeaders(),
//       body: JSON.stringify(payload),
//     });

//     if (res.status === 401) throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
//     const data = await res.json();
//     if (!res.ok || !data.ok) throw new Error(data.message || "Thêm thiết bị thất bại");
//     return data.device;
//   };

//   const apiDeleteDevice = async (id) => {
//     const res = await fetch(`${API_BASE}/devices/${id}`, {
//       method: "DELETE",
//       headers: authHeaders(),
//     });
//     if (res.status === 401) throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
//     const data = await res.json();
//     if (!res.ok || !data.ok) throw new Error(data.message || "Xóa thiết bị thất bại");
//   };

//   // Fetch devices and attach nodes to gateways (preserve open state)
//   const fetchDevices = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
//       if (res.status === 401) throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
//       const data = await res.json();
//       if (!res.ok || !data.ok) throw new Error("Lấy danh sách thiết bị thất bại");

//       const prev = gatewaysMap;
//       const gateways = {};
//       const orphanNodes = [];

//       (data.devices || []).forEach((d) => {
//         const dev = {
//           _id: d._id,
//           deviceId: d.deviceId,
//           name: d.name,
//           location: d.location || "",
//           brightness: typeof d.brightness === "number" ? d.brightness : (d.brightness ?? 50),
//           lux: typeof d.lux === "number" ? d.lux : (d.lux ?? undefined),
//           current: typeof d.current === "number" ? d.current : (d.current ?? undefined),
//           lastUpdated: d.lastUpdated ?? null,
//           gps: d.gps || null,
//           gatewayId: d.gatewayId || null,
//           type: d.gatewayId ? "node" : (d.deviceId && d.deviceId.indexOf("ND_") === 0 ? "node" : "gateway"),
//         };

//         if (!dev.gatewayId && dev.type === "gateway") {
//           gateways[dev._id] = gateways[dev._id] || { gateway: dev, nodes: [], open: true };
//           gateways[dev._id].gateway = dev;
//         } else if (dev.type === "node") {
//           orphanNodes.push(dev);
//         } else {
//           gateways[dev._id] = gateways[dev._id] || { gateway: dev, nodes: [], open: true };
//         }
//       });

//       const gatewayDeviceIdToDbId = {};
//       Object.values(gateways).forEach(g => {
//         if (g.gateway && g.gateway.deviceId) gatewayDeviceIdToDbId[g.gateway.deviceId] = g.gateway._id;
//       });

//       orphanNodes.forEach((node) => {
//         const gwDbId = gatewayDeviceIdToDbId[node.gatewayId] || null;
//         if (gwDbId && gateways[gwDbId]) {
//           gateways[gwDbId].nodes.push(node);
//         } else {
//           const pseudoKey = "__UNGROUPED__";
//           if (!gateways[pseudoKey]) {
//             gateways[pseudoKey] = {
//               gateway: { _id: pseudoKey, deviceId: node.gatewayId || "UNKNOWN", name: `Gateway ${node.gatewayId || "?"}`, location: "", brightness: 50 },
//               nodes: [],
//               open: true
//             };
//           }
//           gateways[pseudoKey].nodes.push(node);
//         }
//       });

//       if (Object.keys(gateways).length === 0 && orphanNodes.length > 0) {
//         gateways["__UNGROUPED__"] = {
//           gateway: { _id: "__UNGROUPED__", deviceId: "UNKNOWN", name: "Local Nodes", location: "", brightness: 50 },
//           nodes: orphanNodes,
//           open: true
//         };
//       }

//       Object.keys(gateways).forEach(k => {
//         if (prev && prev[k] && typeof prev[k].open === "boolean") gateways[k].open = prev[k].open;
//       });

//       setGatewaysMap(gateways);
//       setError("");
//     } catch (e) {
//       console.error("[FETCH DEVICES]", e);
//       setError(e.message || "Lỗi khi lấy devices");
//     }
//   };

//   const fetchPendingDevices = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/devices/pending`, { headers: authHeaders() });
//       if (res.status === 401) throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
//       const data = await res.json();
//       if (!res.ok || !data.ok) throw new Error("Lấy danh sách pending thất bại");
//       setPendingDevices(data.devices || []);
//       setError("");
//     } catch (e) {
//       console.error("[FETCH PENDING]", e);
//       setError(e.message || "Lỗi khi lấy pending devices");
//     }
//   };

//   // lifecycle: initial load + polling
//   useEffect(() => {
//     if (!token) {
//       setError("Bạn chưa đăng nhập.");
//       return;
//     }
//     mountedRef.current = true;
//     fetchDevices();
//     fetchPendingDevices();

//     const devicesInterval = setInterval(() => {
//       if (mountedRef.current) fetchDevices();
//     }, 4000); // poll every 4s for quicker UI sync

//     const pendingInterval = setInterval(() => {
//       if (mountedRef.current) fetchPendingDevices();
//     }, 30000);

//     return () => {
//       mountedRef.current = false;
//       clearInterval(devicesInterval);
//       clearInterval(pendingInterval);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   // add device
//   const handleAddLight = async () => {
//     try {
//       if (!newLightName.trim() || !newLightMac) {
//         setError("Vui lòng nhập tên và chọn địa chỉ MAC!");
//         return;
//       }
//       await apiAddDevice(
//         newLightName.trim(),
//         newLightLocation.trim(),
//         newLightMac,
//         newLightLat,
//         newLightLon
//       );

//       setNewLightName("");
//       setNewLightLocation("");
//       setNewLightMac("");
//       setNewLightLat("");
//       setNewLightLon("");
//       setError("");

//       await fetchDevices();
//       await fetchPendingDevices();
//     } catch (e) {
//       console.error("[ADD DEVICE]", e);
//       setError(e.message || "Lỗi khi thêm thiết bị");
//     }
//   };

//   const handleDeleteLight = async (id) => {
//     if (!window.confirm("Xóa thiết bị này?")) return;
//     try {
//       await apiDeleteDevice(id);
//       await fetchDevices();
//       await fetchPendingDevices();
//     } catch (e) {
//       console.error("[DELETE DEVICE]", e);
//       setError(e.message || "Lỗi khi xóa thiết bị");
//     }
//   };

//   // Brightness: node commit
//   const handleBrightnessNodeCommitted = async (gatewayDbId, node, value) => {
//     try {
//       setLocalBrightness(prev => ({ ...prev, [node._id]: value }));
//       setGatewaysMap(prev => {
//         const copy = { ...prev };
//         if (!copy[gatewayDbId]) return prev;
//         copy[gatewayDbId] = {
//           ...copy[gatewayDbId],
//           nodes: copy[gatewayDbId].nodes.map(n => n._id === node._id ? { ...n, brightness: value } : n)
//         };
//         return copy;
//       });

//       await apiCommand(gatewayDbId, value, node.deviceId);
//       // polling will refresh authoritative state
//     } catch (e) {
//       console.error("[NODE BRIGHTNESS]", e);
//       setError(e.message || "Lỗi khi đặt brightness cho node");
//     }
//   };

//   // slider local change (for responsive UI while dragging)
//   const handleLocalBrightnessChange = (deviceId, value) => {
//     setLocalBrightness(prev => ({ ...prev, [deviceId]: value }));
//   };

//   // toggle collapse
//   const toggleGatewayOpen = (gatewayKey) => {
//     setGatewaysMap(prev => ({ ...prev, [gatewayKey]: { ...prev[gatewayKey], open: !prev[gatewayKey].open } }));
//   };

//   const formatLastUpdated = (s) => {
//     if (!s) return "—";
//     try {
//       const d = new Date(s);
//       return d.toLocaleString();
//     } catch {
//       return String(s);
//     }
//   };

//   return (
//     <Box m="20px">
//       <Header title="Điều khiển đèn" subtitle="Chỉ điều khiển độ sáng (brightness) — hiển thị Lux & Current" />

//       {/* Add device form */}
//       <Box mb="20px">
//         <Box display="flex" alignItems="center" gap="10px" flexWrap="wrap">
//           <TextField label="Tên thiết bị" value={newLightName} onChange={(e) => setNewLightName(e.target.value)}
//             sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }} />
//           <TextField label="Vị trí mô tả" value={newLightLocation} onChange={(e) => setNewLightLocation(e.target.value)}
//             sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }} />
//           <TextField label="Vĩ độ (lat)" value={newLightLat} onChange={(e) => setNewLightLat(e.target.value)}
//             sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }} />
//           <TextField label="Kinh độ (lon)" value={newLightLon} onChange={(e) => setNewLightLon(e.target.value)}
//             sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }} />
//           <Select value={newLightMac} onChange={(e) => setNewLightMac(e.target.value)} displayEmpty
//             sx={{ minWidth: 200, color: colors.grey[100], ".MuiSelect-select": { color: colors.grey[100] } }}>
//             <MenuItem value="" disabled>Chọn địa chỉ MAC</MenuItem>
//             {pendingDevices.map((device) => <MenuItem key={device.deviceId} value={device.deviceId}>{device.deviceId}</MenuItem>)}
//           </Select>
//           <Button variant="contained" color="success" onClick={handleAddLight}>Thêm thiết bị</Button>
//         </Box>
//         {error && <Alert severity="error" sx={{ mt: "10px" }}>{error}</Alert>}
//       </Box>

//       {/* Gateways list */}
//       <Box display="flex" flexDirection="column" gap="16px"
//         sx={{ maxHeight: "70vh", overflowY: "auto", padding: "10px", backgroundColor: colors.primary[400], borderRadius: "8px" }}>
//         {Object.keys(gatewaysMap).length === 0 ? (
//           <Typography color={colors.grey[100]} variant="h6" textAlign="center">
//             Chưa có thiết bị nào. Hãy thêm thiết bị từ danh sách pending ở trên.
//           </Typography>
//         ) : (
//           Object.keys(gatewaysMap).map((gwKey) => {
//             const entry = gatewaysMap[gwKey];
//             const gw = entry.gateway;
//             const nodes = entry.nodes || [];

//             return (
//               <Box key={gwKey} sx={{ padding: "12px", backgroundColor: colors.grey[900], borderRadius: "12px" }}>
//                 <Box display="flex" alignItems="center" justifyContent="space-between" gap="12px">
//                   <Box display="flex" alignItems="center" gap="12px">
//                     <LightbulbIcon sx={{ color: colors.greenAccent[500], fontSize: 28 }} />
//                     <Box>
//                       <Typography color={colors.grey[100]} variant="h6">{gw.name || gw.deviceId}</Typography>
//                       <Typography color={colors.grey[300]} variant="body2">Gateway: {gw.deviceId}</Typography>
//                     </Box>
//                   </Box>

//                   <Box display="flex" alignItems="center" gap="8px">
//                     <IconButton onClick={() => toggleGatewayOpen(gwKey)}><Tooltip title="Expand nodes">{entry.open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</Tooltip></IconButton>
//                     <Button variant="outlined" color="error" onClick={() => handleDeleteLight(gw._id)}>Xóa</Button>
//                   </Box>
//                 </Box>

//                 <Collapse in={entry.open} timeout="auto" unmountOnExit>
//                   <Divider sx={{ mt: 2, mb: 2 }} />
//                   <Typography variant="subtitle2" color={colors.grey[300]}>Nodes:</Typography>
//                   <List>
//                     {nodes.length === 0 ? (
//                       <ListItem><Typography color={colors.grey[400]}>Không có node gắn với gateway này</Typography></ListItem>
//                     ) : nodes.map((n) => {
//                       const nb = localBrightness[n._id] ?? n.brightness ?? 50;
//                       return (
//                         <ListItem key={n._id} sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8, mb: 1 }}>
//                           <Box display="flex" alignItems="center" justifyContent="space-between">
//                             <Box display="flex" alignItems="center" gap={1}>
//                               <LightbulbIcon sx={{ color: colors.greenAccent[500] }} />
//                               <Box>
//                                 <Typography color={colors.grey[100]} variant="body1">{n.name || n.deviceId}</Typography>
//                                 <Typography variant="caption" color={colors.grey[400]}>{n.deviceId} • {n.location || "Chưa đặt"}</Typography>
//                               </Box>
//                             </Box>

//                             <Box textAlign="right">
//                               <Typography variant="caption" color={colors.grey[400]}>Lux: <strong style={{ color: colors.grey[100] }}>{n.lux ?? "—"}</strong></Typography>
//                               <br />
//                               <Typography variant="caption" color={colors.grey[400]}>Current: <strong style={{ color: colors.grey[100] }}>{n.current !== undefined ? `${n.current} A` : "—"}</strong></Typography>
//                               <br />
//                               <Typography variant="caption" color={colors.grey[400]}>Cập nhật: <strong style={{ color: colors.grey[100] }}>{n.lastUpdated ? formatLastUpdated(n.lastUpdated) : "—"}</strong></Typography>
//                             </Box>
//                           </Box>

//                           <Box sx={{ width: 420, ml: 4 }}>
//                             <Slider
//                               value={typeof nb === "number" ? nb : 0}
//                               onChange={(e, v) => handleLocalBrightnessChange(n._id, v)}
//                               onChangeCommitted={(e, v) => handleBrightnessNodeCommitted(gw._id, n, v)}
//                               min={0} max={100} step={1} valueLabelDisplay="auto"
//                               sx={{ color: colors.greenAccent[500], "& .MuiSlider-thumb": { backgroundColor: colors.greenAccent[500] } }}
//                             />
//                             <Typography color={colors.grey[300]} variant="caption">Độ sáng: {Math.round(nb)}%</Typography>
//                           </Box>
//                         </ListItem>
//                       );
//                     })}
//                   </List>
//                 </Collapse>
//               </Box>
//             );
//           })
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default LightControl;



// src/scenes/lightcontrol/LightControl.jsx
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  useTheme,
  Button,
  Slider,
  TextField,
  Alert,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  Lightbulb as BulbOnIcon,
  LightbulbOutlined as BulbOffIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  DeviceHub as GatewayIcon,
  Power as PowerOnIcon,
  PowerOff as PowerOffIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

const LightControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [gatewaysMap, setGatewaysMap] = useState({});
  const [localBrightness, setLocalBrightness] = useState({});
  const [pendingDevices, setPendingDevices] = useState([]);
  const [error, setError] = useState("");

  // Add form
  const [newLightName, setNewLightName] = useState("");
  const [newLightLocation, setNewLightLocation] = useState("");
  const [newLightMac, setNewLightMac] = useState("");
  const [newLightLat, setNewLightLat] = useState("");
  const [newLightLon, setNewLightLon] = useState("");

  const token = localStorage.getItem("accessToken");
  const mountedRef = useRef(false);
  const scrollRef = useRef(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // API
  const apiCommand = async (gatewayId, brightness, target) => {
    const body = { brightness };
    if (target) body.target = target;
    const res = await fetch(`${API_BASE}/devices/${gatewayId}/command`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Lỗi lệnh");
    return await res.json();
  };

  const apiAddDevice = async (name, location, mac, lat, lon) => {
    const payload = { name, location, mac };
    if (lat) payload.lat = parseFloat(lat);
    if (lon) payload.lon = parseFloat(lon);
    const res = await fetch(`${API_BASE}/devices`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Thêm thất bại");
    return (await res.json()).device;
  };

  const apiDeleteDevice = async (id) => {
    const res = await fetch(`${API_BASE}/devices/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Xóa thất bại");
  };

  // Fetch
  const fetchDevices = async () => {
    try {
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
          gateways[gwId] = { gateway: { _id: gwId, deviceId: n.gatewayId, name: `Gateway ${n.gatewayId}`, isOnline: false }, nodes: [], open: true };
        }
        gateways[gwId].nodes.push(n);
      });

      Object.keys(gateways).forEach(k => {
        if (prev[k]?.open !== undefined) gateways[k].open = prev[k].open;
      });

      setGatewaysMap(gateways);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchPendingDevices = async () => {
    try {
      const res = await fetch(`${API_BASE}/devices/pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Lỗi pending");
      const { devices } = await res.json();
      setPendingDevices(devices || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fix: Thêm dependency để tránh warning
  useEffect(() => {
    if (!token) { setError("Chưa đăng nhập"); return; }
    mountedRef.current = true;
    fetchDevices();
    fetchPendingDevices();

    const i1 = setInterval(fetchDevices, 4000);
    const i2 = setInterval(fetchPendingDevices, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(i1);
      clearInterval(i2);
    };
  }, [token, fetchDevices, fetchPendingDevices]); // Đã thêm

  const handleAddLight = async () => {
    if (!newLightName || !newLightMac) return setError("Nhập tên và MAC");
    try {
      await apiAddDevice(newLightName, newLightLocation, newLightMac, newLightLat, newLightLon);
      setNewLightName(""); setNewLightLocation(""); setNewLightMac(""); setNewLightLat(""); setNewLightLon("");
      await fetchDevices();
      await fetchPendingDevices();
    } catch (e) { setError(e.message); }
  };

  const handleDeleteLight = async (id) => {
    if (!window.confirm("Xóa thiết bị?")) return;
    try { await apiDeleteDevice(id); await fetchDevices(); } catch (e) { setError(e.message); }
  };

  const handleBrightnessCommit = async (gwId, node, value) => {
    try {
      setLocalBrightness(prev => ({ ...prev, [node._id]: value }));
      await apiCommand(gwId, value, node.deviceId);
    } catch (e) { setError(e.message); }
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  const formatTime = (s) => s ? new Date(s).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

  return (
    <Box m="20px">
      <Header title="ĐIỀU KHIỂN ĐÈN THÔNG MINH" subtitle="Quản lý độ sáng từng node • Hiển thị ngang" />

      {/* ADD FORM */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: colors.primary[400], borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color={colors.grey[100]}>
          <AddIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Thêm thiết bị mới
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField fullWidth label="Tên đèn" value={newLightName} onChange={e => setNewLightName(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><BulbOnIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField fullWidth label="Vị trí" value={newLightLocation} onChange={e => setNewLightLocation(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField fullWidth label="Lat" value={newLightLat} onChange={e => setNewLightLat(e.target.value)} />
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField fullWidth label="Lon" value={newLightLon} onChange={e => setNewLightLon(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Select fullWidth value={newLightMac} onChange={e => setNewLightMac(e.target.value)} displayEmpty
              sx={{ color: colors.grey[100] }}>
              <MenuItem value="" disabled>Chọn MAC</MenuItem>
              {pendingDevices.map(d => <MenuItem key={d.deviceId} value={d.deviceId}>{d.deviceId}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button fullWidth variant="contained" color="success" onClick={handleAddLight}
              sx={{ height: 56, fontWeight: 600 }}>
              Thêm
            </Button>
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <Box position="relative">
        <IconButton onClick={scrollLeft} sx={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", zIndex: 10, bgcolor: "#1e293b", color: "white", "&:hover": { bgcolor: "#334155" } }}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={scrollRight} sx={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", zIndex: 10, bgcolor: "#1e293b", color: "white", "&:hover": { bgcolor: "#334155" } }}>
          <ChevronRightIcon />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            pb: 2,
            px: 1,
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-track": { bgcolor: colors.primary[500] },
            "&::-webkit-scrollbar-thumb": { bgcolor: colors.greenAccent[500], borderRadius: 4 },
          }}
        >
          {Object.keys(gatewaysMap).length === 0 ? (
            <Paper sx={{ minWidth: 400, p: 4, textAlign: "center", bgcolor: colors.primary[400], borderRadius: 3 }}>
              <Typography color={colors.grey[400]}>Chưa có thiết bị. Thêm từ form trên.</Typography>
            </Paper>
          ) : (
            Object.entries(gatewaysMap).map(([key, entry]) => {
              const gw = entry.gateway;
              const nodes = entry.nodes || [];
              const isOnline = gw.isOnline ?? false;

              return (
                <Card
                  key={key}
                  sx={{
                    minWidth: 420,
                    width: 420,
                    bgcolor: isOnline ? "linear-gradient(135deg, #1e40af 0%, #1e293b 100%)" : "#2d1b1b",
                    color: "white",
                    borderRadius: 3,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: "0 16px 35px rgba(0,0,0,0.4)" },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Gateway Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Stack direction="row" alignItems="center" gap={2}>
                        <GatewayIcon sx={{ fontSize: 36, color: isOnline ? "#10b981" : "#ef4444" }} />
                        <Box>
                          <Typography variant="h6" fontWeight={700} noWrap>{gw.name}</Typography>
                          <Typography variant="caption" color={colors.grey[300]}>{gw.deviceId}</Typography>
                        </Box>
                      </Stack>
                      <Stack alignItems="flex-end" gap={0.5}>
                        <Chip
                          icon={isOnline ? <PowerOnIcon /> : <PowerOffIcon />}
                          label={isOnline ? "ONLINE" : "OFFLINE"}
                          size="small"
                          sx={{ bgcolor: isOnline ? "#10b981" : "#ef4444", color: "white", fontSize: "0.65rem" }}
                        />
                        <Typography variant="caption" color={colors.grey[400]}>
                          {nodes.length} node{nodes.length > 1 ? "s" : ""}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Nodes Horizontal List */}
                    <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                      {nodes.map((node, i) => {
                        const val = localBrightness[node._id] ?? node.brightness ?? 50;
                        const isOn = val > 0;

                        return (
                          <Box
                            key={node._id}
                            sx={{
                              p: 2,
                              bgcolor: colors.primary[500],
                              borderRadius: 2,
                              mb: 1.5,
                              border: `1px solid ${colors.grey[700]}`,
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                              <Stack direction="row" alignItems="center" gap={1.5}>
                                {isOn ? <BulbOnIcon sx={{ color: "#fbbf24", fontSize: 28 }} /> : <BulbOffIcon sx={{ color: "#64748b", fontSize: 28 }} />}
                                <Box>
                                  <Typography variant="subtitle2" color={colors.grey[100]}>{node.name}</Typography>
                                  <Typography variant="caption" color={colors.grey[400]}>{node.deviceId}</Typography>
                                </Box>
                              </Stack>
                              <IconButton size="small" onClick={() => handleDeleteLight(node._id)} sx={{ color: "#ef4444" }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>

                            {/* Stats */}
                            <Stack direction="row" justifyContent="space-between" mb={1.5} sx={{ fontSize: "0.8rem" }}>
                              <Box>
                                <Typography variant="caption" color={colors.grey[300]}>Lux: <strong style={{ color: "#fbbf24" }}>{node.lux ?? "—"}</strong></Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color={colors.grey[300]}>Dòng: <strong style={{ color: "#3b82f6" }}>{node.current ? `${node.current}A` : "—"}</strong></Typography>
                              </Box>
                              <Box textAlign="right">
                                <Typography variant="caption" color={colors.grey[400]}>{formatTime(node.lastUpdated)}</Typography>
                              </Box>
                            </Stack>

                            {/* Slider */}
                            <Slider
                              value={val}
                              onChange={(_, v) => setLocalBrightness(prev => ({ ...prev, [node._id]: v }))}
                              onChangeCommitted={(_, v) => handleBrightnessCommit(gw._id, node, v)}
                              min={0} max={100} step={1}
                              valueLabelDisplay="auto"
                              sx={{
                                color: "#10b981",
                                height: 8,
                                "& .MuiSlider-thumb": { width: 20, height: 20, bgcolor: "#10b981" },
                                "& .MuiSlider-track": { bgcolor: "#10b981" },
                                "& .MuiSlider-rail": { bgcolor: "#334155" },
                              }}
                            />
                            <Typography variant="caption" color={colors.grey[300]} textAlign="right" mt={0.5}>
                              <strong>{Math.round(val)}%</strong>
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, bgcolor: colors.primary[600], justifyContent: "center" }}>
                    <Button size="small" startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => handleDeleteLight(gw._id)}>
                      Xóa Gateway
                    </Button>
                  </CardActions>
                </Card>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LightControl;