import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useState } from "react";
import axios from "axios";

const AuthPage = () => {
  const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";
  //const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const [form, setForm] = useState({ username: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);

  // Local login
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, form);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      alert("Đăng nhập thành công!");
      window.location.href = "/"; // chuyển về dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  // Local register
  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE}/auth/register`, form);
      alert("Đăng ký thành công, vui lòng đăng nhập!");
      setIsRegister(false);
    } catch (err) {
      alert(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  // Google login popup
const handleGoogleLogin = () => {
  // Mở popup đăng nhập Google
  const popup = window.open(
    `${API_BASE}/auth/google`,
    "googleLogin",
    "width=500,height=600,scrollbars=yes,resizable=yes"
  );

  // Kiểm tra popup có bị chặn không
  if (!popup) {
    alert("Popup bị chặn! Vui lòng cho phép popup để đăng nhập bằng Google.");
    return;
  }

  // Listener nhận message từ backend
  const listener = (event) => {
    // Bước 1: Chỉ chấp nhận message từ chính frontend đang chạy
    if (event.origin !== window.location.origin) {
      console.warn("postMessage bị chặn từ origin:", event.origin);
      return;
    }

    // Bước 2: Kiểm tra dữ liệu hợp lệ
    const { accessToken, refreshToken, user } = event.data || {};
    if (!accessToken || !refreshToken) {
      console.warn("Dữ liệu token không hợp lệ:", event.data);
      return;
    }

    // Bước 3: Lưu token + user vào localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    // Bước 4: Dọn dẹp
    window.removeEventListener("message", listener);
    if (popup && !popup.closed) popup.close();

    // Bước 5: Thông báo + chuyển hướng
    alert("Đăng nhập Google thành công!");
    window.location.href = "/";
  };

  // Đăng ký listener
  window.addEventListener("message", listener);

  // Tự động đóng popup nếu treo quá 15s
  const timeout = setTimeout(() => {
    if (popup && !popup.closed) {
      popup.close();
      alert("Đăng nhập Google bị gián đoạn. Vui lòng thử lại.");
    }
    window.removeEventListener("message", listener);
  }, 15000);

  // Dọn dẹp timeout khi thành công
  const originalListener = listener;
  window.addEventListener("message", function cleanup(e) {
    if (e.data.accessToken) {
      clearTimeout(timeout);
      window.removeEventListener("message", cleanup);
    }
  });
};

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f4f6f8"
    >
      <Paper sx={{ p: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h4" textAlign="center" mb={2}>
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </Typography>

        <TextField
          label="Username"
          fullWidth
          margin="dense"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="dense"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={isRegister ? handleRegister : handleLogin}
        >
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={handleGoogleLogin}
        >
          Đăng nhập với Google
        </Button>

        <Typography
          variant="body2"
          textAlign="center"
          mt={2}
          sx={{ cursor: "pointer", color: "blue" }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Đã có tài khoản? Đăng nhập ngay"
            : "Chưa có tài khoản? Đăng ký"}
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthPage;
