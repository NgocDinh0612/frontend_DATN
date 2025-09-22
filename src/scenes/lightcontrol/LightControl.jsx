import { useEffect, useState } from "react";
import { Box, Typography, useTheme, Button, Slider, TextField, Alert, Select, MenuItem } from "@mui/material";
import { tokens } from "../../theme";
import { useLightState } from "../../App";
import Header from "../../components/Header";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

const LightControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightStates, setLightStates } = useLightState();
  const [localBrightness, setLocalBrightness] = useState({});
  const [newLightName, setNewLightName] = useState("");
  const [newLightLocation, setNewLightLocation] = useState("");
  const [newLightMac, setNewLightMac] = useState("");
  const [pendingDevices, setPendingDevices] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  // -- API helpers --
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_BASE}/devices`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`GET /devices ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error("API get devices failed");

      const mapped = {};
      data.devices.forEach((d) => {
        mapped[d._id] = {
          isOn: !!d.relay,
          brightness: d.brightness || 50,
          name: d.name,
          location: d.location || "",
          deviceId: d.deviceId,
        };
      });
      setLightStates(mapped);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const fetchPendingDevices = async () => {
    try {
      const res = await fetch(`${API_BASE}/devices/pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`GET /devices/pending ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error("API get pending devices failed");
      setPendingDevices(data.devices);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const apiAddDevice = async (name, location, mac) => {
    const res = await fetch(`${API_BASE}/devices`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, location, mac }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.message || "Thêm thiết bị thất bại");
    return data.device;
  };

  const apiDeleteDevice = async (id) => {
    const res = await fetch(`${API_BASE}/devices/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.message || "Xoá thiết bị thất bại");
  };

  const apiToggle = async (id, on) => {
    const res = await fetch(`${API_BASE}/devices/${id}/toggle`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ action: on ? "ON" : "OFF" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.message || "Gửi lệnh bật/tắt thất bại");
  };

  const apiBrightness = async (id, value) => {
    const res = await fetch(`${API_BASE}/devices/${id}/brightness`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.message || "Gửi lệnh độ sáng thất bại");
  };

  // -- lifecycle --
  useEffect(() => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      return;
    }
    fetchDevices();
    fetchPendingDevices();
  }, []);

  // -- UI handlers --
  const handleAddLight = async () => {
    try {
      if (!newLightName.trim() || !newLightMac) {
        setError("Vui lòng nhập tên và chọn địa chỉ MAC!");
        return;
      }
      const d = await apiAddDevice(newLightName.trim(), newLightLocation.trim(), newLightMac);
      setLightStates((prev) => ({
        ...prev,
        [d._id]: {
          isOn: false,
          brightness: 50,
          name: d.name,
          location: d.location || "",
          deviceId: d.deviceId,
        },
      }));
      setPendingDevices((prev) => prev.filter((dev) => dev.deviceId !== newLightMac));
      setNewLightName("");
      setNewLightLocation("");
      setNewLightMac("");
      setError("");
      fetchDevices(); // Cập nhật danh sách thiết bị
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteLight = async (id) => {
    if (!window.confirm("Xoá thiết bị này?")) return;
    try {
      await apiDeleteDevice(id);
      setLightStates((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setLocalBrightness((prev) => {
        const b = { ...prev };
        delete b[id];
        return b;
      });
      fetchPendingDevices(); // Cập nhật danh sách pending
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleLight = async (id) => {
    const newState = !lightStates[id].isOn;
    try {
      await apiToggle(id, newState);
      setLightStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], isOn: newState },
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleBrightnessChange = (id, value) => {
    setLocalBrightness((prev) => ({ ...prev, [id]: value }));
  };

  const handleBrightnessChangeCommitted = async (id, value) => {
    try {
      await apiBrightness(id, value);
      setLightStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], brightness: value },
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box m="20px">
      <Header title="Điều khiển đèn" subtitle="Bật/tắt, điều chỉnh độ sáng và quản lý bóng đèn" />
      <Box mb="20px">
        <Box display="flex" alignItems="center" gap="10px">
          <TextField
            label="Tên thiết bị"
            value={newLightName}
            onChange={(e) => setNewLightName(e.target.value)}
            sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }}
          />
          <TextField
            label="Vị trí (tuỳ chọn)"
            value={newLightLocation}
            onChange={(e) => setNewLightLocation(e.target.value)}
            sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }}
          />
          <Select
            value={newLightMac}
            onChange={(e) => setNewLightMac(e.target.value)}
            displayEmpty
            sx={{ minWidth: 200, color: colors.grey[100], '.MuiSelect-select': { color: colors.grey[100] } }}
          >
            <MenuItem value="" disabled>Chọn địa chỉ MAC</MenuItem>
            {pendingDevices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.deviceId}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" color="success" onClick={handleAddLight} sx={{ height: "40px" }}>
            Thêm bóng đèn
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mt: "10px" }}>{error}</Alert>}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="180px" gap="20px">
        {Object.keys(lightStates).map((id) => {
          const dev = lightStates[id];
          const name = dev.name || `Đèn ${id.slice(-4)}`;
          const brightness = localBrightness[id] ?? dev.brightness ?? 50;
          return (
            <Box
              key={id}
              gridColumn="span 4"
              gridRow="span 2"
              backgroundColor={colors.primary[400]}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p="15px"
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                {name}
              </Typography>
              <Typography color={colors.grey[100]}>MAC: {dev.deviceId}</Typography>
              <Typography color={colors.grey[100]}>
                Trạng thái: {dev.isOn ? "Bật" : "Tắt"}
              </Typography>
              <Box display="flex" gap="10px" mt="10px" mb="10px">
                <Button
                  variant="contained"
                  color={dev.isOn ? "error" : "success"}
                  onClick={() => handleToggleLight(id)}
                >
                  {dev.isOn ? "Tắt" : "Bật"}
                </Button>
                <Button variant="contained" color="error" onClick={() => handleDeleteLight(id)}>
                  Xóa
                </Button>
              </Box>
              <Typography color={colors.grey[100]}>Độ sáng:</Typography>
              <Slider
                value={brightness}
                onChange={(e, v) => handleBrightnessChange(id, v)}
                onChangeCommitted={(e, v) => handleBrightnessChangeCommitted(id, v)}
                min={0}
                max={100}
                step={1}
                sx={{ width: "80%" }}
              />
              <Typography color={colors.grey[100]}>{brightness}%</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default LightControl;