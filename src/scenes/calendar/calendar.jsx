// src/pages/calendar/Calendar.jsx
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

const pad2 = (n) => String(n).padStart(2, "0");
const nowPlusMinutes = (mins = 5) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d;
};
const toHHMMSS = (date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
const toHHMM = (date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const buildLocalDate = (dateStr, timeStr) => {
  // dateStr: YYYY-MM-DD, timeStr: HH:mm or HH:mm:ss
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return new Date(NaN);
  const [y, mo, d] = parts;
  const timeParts = timeStr.split(":").map(Number);
  const hh = timeParts[0] ?? 0;
  const mm = timeParts[1] ?? 0;
  const ss = timeParts[2] ?? 0;
  return new Date(y, mo - 1, d, hh, mm, ss);
};

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD"
  const [gateways, setGateways] = useState([]); // Danh sách gateways
  const [nodes, setNodes] = useState([]); // Nodes dynamic theo gateway
  const [form, setForm] = useState({
    gatewayId: "",
    deviceId: "",
    brightness: 50,
    startTime: "08:00:00", // HH:mm:ss
    endTime: "20:00:00", // HH:mm:ss (not used by backend automatically)
    action: "on",
    repeat: "none",
    daysOfWeek: [], // [0..6]
    endDate: "", // YYYY-MM-DD optional
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const calendarRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch gateways
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const res = await axios.get(`${API_BASE}/devices?type=gateway`, { headers });
        setGateways(res.data.devices || []);
      } catch (err) {
        console.error("Lỗi lấy gateways:", err);
      }
    };
    fetchGateways();
  }, []);

  // Fetch nodes when gateway changes
  useEffect(() => {
    const fetchNodes = async () => {
      if (!form.gatewayId) {
        setNodes([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/devices?gatewayId=${encodeURIComponent(form.gatewayId)}&type=node`, { headers });
        setNodes(res.data.devices || []);
      } catch (err) {
        console.error("Lỗi lấy nodes:", err);
      }
    };
    fetchNodes();
  }, [form.gatewayId]);

  // Fetch schedules and convert to calendar events
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/schedule`, { headers });
      const data = Array.isArray(res.data.schedules) ? res.data.schedules : [];

      const calendarEvents = data.map((s) => {
        // unified response (backend returns unified objects)
        // s may contain: type:'oneshot' + scheduledAt, or type:'recurring' + nextOccurrence
        const startRaw = s.scheduledAt || s.nextOccurrence || s.nextOccurrenceDate || null;
        const start = startRaw ? new Date(startRaw).toLocaleString("sv-SE").replace(" ", "T") : null;
        const title = s.title || (s.type === "oneshot"
          ? `${s.deviceId} → ${s.params?.value ?? s.brightness ?? 0}%`
          : `${s.deviceId} → ${s.schedule?.brightness ?? s.brightness ?? 0}% (${s.schedule?.repeat ?? s.repeat ?? s.type})`);
        return {
          id: s._id,
          title,
          start,
          extendedProps: s,
        };
      }).filter(ev => ev.start !== null);

      setEvents(calendarEvents);
    } catch (err) {
      console.error("Lỗi lấy lịch:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // handle calendar click/select
  const handleDateClick = (info) => {
    // Can receive select or dateClick. Normalize to YYYY-MM-DD.
    let dateStr = null;

    if (!info) {
      setMsg({ type: "error", text: "Ngày chọn không hợp lệ!" });
      return;
    }

    if (typeof info.startStr === "string" && info.startStr.length > 0) {
      dateStr = info.startStr.split("T")[0];
    } else if (typeof info.dateStr === "string" && info.dateStr.length > 0) {
      dateStr = info.dateStr.split("T")[0];
    } else if (info.start instanceof Date && !isNaN(info.start.getTime())) {
      const d = info.start;
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else if (info.date instanceof Date && !isNaN(info.date.getTime())) {
      const d = info.date;
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setMsg({ type: "error", text: "Ngày chọn không hợp lệ!" });
      return;
    }

    const defaultStart = nowPlusMinutes(5);
    setSelectedDate(dateStr);
    setOpen(true);
    setMsg({ type: "", text: "" });
    setForm({
      gatewayId: "",
      deviceId: "",
      brightness: 50,
      startTime: toHHMMSS(defaultStart),
      endTime: "20:00:00",
      action: "on",
      repeat: "none",
      daysOfWeek: [],
      endDate: "",
    });
  };

  // Save schedule (one-shot OR recurring)
  const handleSave = async () => {
    setMsg({ type: "", text: "" });

    if (!form.gatewayId) {
      setMsg({ type: "error", text: "Vui lòng chọn Gateway!" });
      return;
    }
    if (!form.deviceId) {
      setMsg({ type: "error", text: "Vui lòng chọn Node!" });
      return;
    }
    if (form.repeat === "weekly" && (!Array.isArray(form.daysOfWeek) || form.daysOfWeek.length === 0)) {
      setMsg({ type: "error", text: "Vui lòng chọn ngày trong tuần cho lặp weekly!" });
      return;
    }

    // Validate time format (allow HH:mm or HH:mm:ss)
    const timeRegexFull = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    const timeRegexShort = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!(timeRegexFull.test(form.startTime) || timeRegexShort.test(form.startTime))) {
      setMsg({ type: "error", text: "Định dạng giờ không hợp lệ (HH:mm hoặc HH:mm:ss)!" });
      return;
    }

    if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      setMsg({ type: "error", text: "Ngày chọn không hợp lệ!" });
      return;
    }

    const payload = {
      gatewayId: form.gatewayId,
      deviceId: form.deviceId,
      brightness: Number(form.brightness),
      action: form.action,
      repeat: form.repeat,
      daysOfWeek: form.repeat === "weekly" ? form.daysOfWeek : undefined,
      active: true,
    };

    if (form.repeat === "none") {
      // One-shot: build local date and send ISO UTC
      const localDate = buildLocalDate(selectedDate, form.startTime);
      if (isNaN(localDate.getTime())) {
        setMsg({ type: "error", text: "Ngày/Giờ không hợp lệ!" });
        return;
      }
      const now = new Date();
      if (localDate.getTime() <= now.getTime() + 60 * 1000) {
        setMsg({ type: "error", text: "Vui lòng chọn thời gian cách hiện tại ít nhất 1 phút!" });
        return;
      }
      // toISOString() will convert to UTC (backend expects ISO datetime)
      payload.scheduledAt = localDate.toISOString();
    } else {
      // Recurring: send time (HH:mm) and startDate
      payload.time = form.startTime.length >= 5 ? form.startTime.slice(0, 5) : form.startTime;
      payload.startDate = selectedDate;
      if (form.endDate) {
        const e = new Date(form.endDate);
        if (!isNaN(e.getTime())) payload.endDate = e.toISOString();
      }
    }

    console.log("📤 Gửi payload:", payload);

    try {
      const res = await axios.post(`${API_BASE}/schedule`, payload, { headers });
      if (res.data && res.data.ok) {
        setMsg({ type: "success", text: "Đặt lịch thành công!" });
        fetchSchedules();
        setOpen(false);
      } else {
        setMsg({ type: "error", text: res.data?.message || "Lỗi server" });
      }
    } catch (err) {
      console.error("❌ Lỗi POST:", err.response?.data || err);
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Lỗi server",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm({
      gatewayId: "",
      deviceId: "",
      brightness: 50,
      startTime: "08:00:00",
      endTime: "20:00:00",
      action: "on",
      repeat: "none",
      daysOfWeek: [],
      endDate: "",
    });
    setMsg({ type: "", text: "" });
  };

  const handleDelete = async (info) => {
    // info is eventClick argument; ids are schedule/command _id returned by backend
    if (!window.confirm(`Xóa lịch "${info.event.title}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/schedule/${info.event.id}`, { headers });
      info.event.remove();
      fetchSchedules();
      setMsg({ type: "success", text: "Đã xóa lịch." });
    } catch (err) {
      console.error("Xóa lỗi:", err);
      setMsg({ type: "error", text: "Không thể xóa lịch" });
    }
  };

  const handleDaysChange = (day) => {
    const updatedDays = form.daysOfWeek.includes(day)
      ? form.daysOfWeek.filter((d) => d !== day)
      : [...form.daysOfWeek, day];
    setForm({ ...form, daysOfWeek: updatedDays });
  };

  return (
    <Box m="20px">
      <Header title="Lịch hẹn giờ" subtitle="Đặt độ sáng theo giờ" />

      <Box height="75vh">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
          }}
          initialView="dayGridMonth"
          selectable
          select={handleDateClick}
          dateClick={handleDateClick}
          eventClick={handleDelete}
          events={events}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt lịch: {selectedDate}</DialogTitle>
        <DialogContent>
          {msg.type && (
            <Alert severity={msg.type} sx={{ mb: 2 }}>
              {msg.text}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Gateway</InputLabel>
            <Select
              value={form.gatewayId}
              onChange={(e) => setForm({ ...form, gatewayId: e.target.value, deviceId: "" })}
            >
              <MenuItem value="">(Chọn gateway)</MenuItem>
              {gateways.map((g) => (
                <MenuItem key={g.deviceId} value={g.deviceId}>
                  {g.name || g.deviceId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }} disabled={!form.gatewayId}>
            <InputLabel>Node</InputLabel>
            <Select
              value={form.deviceId}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
            >
              <MenuItem value="">(Chọn node)</MenuItem>
              {nodes.map((n) => (
                <MenuItem key={n.deviceId} value={n.deviceId}>
                  {n.name || n.deviceId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Độ sáng (%)"
            type="number"
            fullWidth
            value={form.brightness}
            onChange={(e) => setForm({ ...form, brightness: Number(e.target.value) })}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Giờ bắt đầu (HH:mm:ss)"
            type="text"
            fullWidth
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Ví dụ: 08:00 hoặc 08:00:00"
          />

          <TextField
            label="Giờ kết thúc (HH:mm:ss) - (tùy chọn)"
            type="text"
            fullWidth
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Backend hiện không tự tắt; nhập để tạo schedule kết thúc nếu cần (frontend có thể tạo schedule reset)"
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
            >
              <MenuItem value="on">On</MenuItem>
              <MenuItem value="off">Off</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Lặp lại</InputLabel>
            <Select
              value={form.repeat}
              onChange={(e) => setForm({ ...form, repeat: e.target.value, daysOfWeek: [] })}
            >
              <MenuItem value="none">Không lặp</MenuItem>
              <MenuItem value="daily">Hàng ngày</MenuItem>
              <MenuItem value="weekly">Hàng tuần</MenuItem>
              <MenuItem value="monthly">Hàng tháng</MenuItem>
              <MenuItem value="yearly">Hàng năm</MenuItem>
            </Select>
          </FormControl>

          {form.repeat === "weekly" && (
            <FormGroup row sx={{ mb: 2 }}>
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(0)} onChange={() => handleDaysChange(0)} />} label="CN" />
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(1)} onChange={() => handleDaysChange(1)} />} label="T2" />
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(2)} onChange={() => handleDaysChange(2)} />} label="T3" />
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(3)} onChange={() => handleDaysChange(3)} />} label="T4" />
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(4)} onChange={() => handleDaysChange(4)} />} label="T5" />
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(5)} onChange={() => handleDaysChange(5)} />} label="T6" />
              <FormControlLabel control={<Checkbox checked={form.daysOfWeek.includes(6)} onChange={() => handleDaysChange(6)} />} label="T7" />
            </FormGroup>
          )}

          {form.repeat !== "none" && (
            <>
              <Typography variant="body2" sx={{ mt: 1, mb: 1, color: "text.secondary" }}>
                Bắt đầu từ ngày: <strong>{selectedDate}</strong>
              </Typography>
              <TextField
                label="Kết thúc (tùy chọn) - YYYY-MM-DD"
                type="date"
                fullWidth
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
