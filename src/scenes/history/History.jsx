// src/pages/history/History.jsx
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  InputBase,
  IconButton
} from "@mui/material";
import { tokens } from "../../theme";
import { useLightState } from "../../App";
import { useEffect, useState } from "react";
import ArrowDropDownCircleOutlinedIcon from '@mui/icons-material/ArrowDropDownCircleOutlined';

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

const History = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightHistory, completedEvents } = useLightState();

  const [selectedOption, setSelectedOption] = useState("lightHistory");
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setError(null);
      setHistoryData([]);
      try {
        let endpoint = "";
        let params = "";
        switch (selectedOption) {
          case "commands":
            endpoint = "/commands";
            break;
          case "activityLogs":
            endpoint = "/activitylogs";
            break;
          case "users":
            endpoint = "/users";
            break;
          case "schedules":
            endpoint = "/schedules";
            break;
          case "lightStatus":
            endpoint = "/status/history";
            params = "?devices=all&periodMinutes=inf";
            break;
          default:
            return;
        }

        const res = await fetch(`${API_BASE}${endpoint}${params}`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        let data = await res.json();
        if (selectedOption === "lightStatus") {
          data = data.data || [];
        }
        const sortedData = data.sort((a, b) => 
          new Date(b.createdAt || b.createAt || b.lastUpdated || b.start) - 
          new Date(a.createdAt || a.createAt || a.lastUpdated || a.start)
        );
        setHistoryData(sortedData);
      } catch (err) {
        console.error("Fetch history error:", err);
        setError(err.message || "Lỗi khi lấy dữ liệu");
      }
    };

    if (selectedOption !== "lightHistory" && selectedOption !== "completedEvents") {
      fetchHistory();
    } else {
      setHistoryData([]);
      setError(null);
    }
  }, [selectedOption]);

  const calculateTotalActiveTime = (lightId) => {
    const historyForLight = lightHistory.filter((entry) => entry.lightId === lightId && entry.action === "on");
    return historyForLight.reduce((total, entry) => total + entry.duration, 0);
  };

  const renderHistoryContent = () => {
    if (error) {
      return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (historyData.length === 0 && selectedOption !== "lightHistory" && selectedOption !== "completedEvents") {
      return (
        <Box textAlign="center" mt={4}>
          <Typography color={colors.grey[400]}>Không có dữ liệu</Typography>
        </Box>
      );
    }

    // ... (giữ nguyên các case render như cũ)
    // Chỉ thay đổi phần return của từng case để thêm Paper nếu cần
    // Dưới đây là ví dụ cho lightStatus (các case khác giữ nguyên)

    switch (selectedOption) {
      case "completedEvents":
        return (
          <Box>
            <Typography variant="h5" color={colors.grey[100]} sx={{ mb: "15px" }}>
              Lịch sử hẹn giờ
            </Typography>
            <List>
              {completedEvents.map((event, index) => (
                <ListItem
                  key={index}
                  sx={{
                    backgroundColor: event.extendedProps.action === "on" ? colors.greenAccent[600] : colors.redAccent[600],
                    margin: "10px 0",
                    borderRadius: "8px",
                    color: "white"
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Typography color="rgba(255,255,255,0.8)">
                        {new Date(event.start).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {event.end && ` - ${new Date(event.end).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      // Các case khác giữ nguyên, nhưng có thể thêm Paper + borderRadius nếu muốn
      default:
        return (
          <List>
            {historyData.map((entry, index) => (
              <ListItem
                key={index}
                sx={{
                  backgroundColor: colors.primary[600],
                  margin: "8px 0",
                  borderRadius: "8px",
                  border: `1px solid ${colors.grey[700]}`,
                  color: colors.grey[100]
                }}
              >
                <ListItemText
                  primary={entry.deviceId ? `Device: ${entry.deviceId}` : `User: ${entry.username || entry.email}`}
                  secondary={new Date(entry.createdAt || entry.createAt).toLocaleString("vi-VN")}
                />
              </ListItem>
            ))}
          </List>
        );
    }
  };

  return (
    <Box m="20px">
      {/* Header + Select góc phải */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" color={colors.grey[100]} fontWeight="600">
          Lịch sử
        </Typography>

        {/* Select nhỏ gọn, góc phải, có border + icon */}
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: 280,
            backgroundColor: colors.primary[600],
            border: `1px solid ${colors.grey[700]}`,
            borderRadius: "12px",
            overflow: "hidden",
            transition: "all 0.2s",
            '&:hover': {
              borderColor: colors.blueAccent[400],
              boxShadow: `0 0 12px ${colors.blueAccent[800]}40`
            }
          }}
        >
          <InputBase
            sx={{ ml: 2, flex: 1, color: colors.grey[100], fontSize: "0.95rem" }}
            value={
              {
                lightHistory: "Lịch sử bật/tắt",
                commands: "Lịch sử chỉnh đèn",
                activityLogs: "Lịch sử đăng nhập",
                users: "Lịch sử tạo người dùng",
                schedules: "Lịch sử đặt lịch",
                lightStatus: "Lịch sử trạng thái đèn",
                completedEvents: "Lịch sử hẹn giờ"
              }[selectedOption] || "Chọn loại"
            }
            readOnly
          />
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            variant="standard"
            disableUnderline
            IconComponent={ArrowDropDownCircleOutlinedIcon}
            sx={{
              width: 50,
              color: colors.blueAccent[300],
              '& .MuiSvgIcon-root': {
                fontSize: "1.4rem"
              }
            }}
          >
            <MenuItem value="commands">Lịch sử chỉnh đèn</MenuItem>
            <MenuItem value="activityLogs">Lịch sử đăng nhập</MenuItem>
            <MenuItem value="users">Lịch sử tạo người dùng</MenuItem>
            <MenuItem value="schedules">Lịch sử đặt lịch</MenuItem>
            <MenuItem value="lightStatus">Lịch sử trạng thái đèn</MenuItem>
          </Select>
        </Paper>
      </Box>

      {/* Nội dung */}
      <Box>
        {renderHistoryContent()}
      </Box>
    </Box>
  );
};

export default History;