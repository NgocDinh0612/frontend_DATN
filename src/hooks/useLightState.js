import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LightStateContext = createContext({
  devices: [],
  fetchDevices: () => {},
  addDevice: () => {},
  toggleDevice: () => {},
  setBrightness: () => {},
  updateLightState: () => {},
});

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";
//const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
export function LightStateProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // Lấy danh sách thiết bị
  const fetchDevices = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/devices`, { headers: authHeaders() });
      if (res.data.ok) {
        console.log("[FETCH DEVICES] Response:", res.data.devices);
        setDevices(res.data.devices);
      }
    } catch (err) {
      console.error("[FETCH DEVICES] Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  }, [navigate, token]);

  // Thêm thiết bị
  const addDevice = useCallback(async (device) => {
    try {
      const res = await axios.post(`${API_BASE}/devices`, device, { headers: authHeaders() });
      if (res.data.ok) {
        setDevices((prev) => [...prev, res.data.device]);
        console.log("[ADD DEVICE]", res.data.device);
      }
    } catch (err) {
      console.error("[ADD DEVICE] Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  }, [navigate, token]);

  // Toggle bật/tắt
  const toggleDevice = useCallback(async (deviceId, relay) => {
    try {
      const res = await axios.post(
        `${API_BASE}/devices/${deviceId}/command`,
        { state: relay },
        { headers: authHeaders() }
      );
      if (res.data.ok) {
        setDevices((prev) =>
          prev.map((d) => (d.deviceId === deviceId ? { ...d, relay } : d))
        );
        console.log("[TOGGLE]", res.data);
      }
    } catch (err) {
      console.error("[TOGGLE] Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  }, [navigate, token]);

  // Chỉnh độ sáng
  const setBrightness = useCallback(async (deviceId, brightness) => {
    try {
      const res = await axios.post(
        `${API_BASE}/devices/${deviceId}/command`,
        { brightness },
        { headers: authHeaders() }
      );
      if (res.data.ok) {
        setDevices((prev) =>
          prev.map((d) => (d.deviceId === deviceId ? { ...d, brightness } : d))
        );
        console.log("[BRIGHTNESS]", res.data);
      }
    } catch (err) {
      console.error("[BRIGHTNESS] Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  }, [navigate, token]);

  // Cập nhật vị trí (gps)
  const updateLightState = useCallback(async (deviceId, update) => {
    try {
      const res = await axios.put(
        `${API_BASE}/devices/${deviceId}`,
        { gps: update.gps },
        { headers: authHeaders() }
      );
      if (res.data.ok) {
        setDevices((prev) =>
          prev.map((d) => (d.deviceId === deviceId ? { ...d, gps: update.gps } : d))
        );
        console.log("[UPDATE DEVICE]", update);
      }
    } catch (err) {
      console.error("[UPDATE DEVICE] Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <LightStateContext.Provider
      value={{
        devices,
        fetchDevices,
        addDevice,
        toggleDevice,
        setBrightness,
        updateLightState,
      }}
    >
      {children}
    </LightStateContext.Provider>
  );
}

export const useLightState = () => useContext(LightStateContext);