import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography } from "@mui/material";

// LẤY BASE URL TỪ .env
const API_BASE = process.env.REACT_APP_API_URL;

export default function CompleteRegistration() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const [form, setForm] = useState({
    username: "",
    password: "",
    contact: "",
  });

  const handleComplete = async () => {
    try {
      await axios.post(`${API_BASE}/auth/complete-registration`, {
        email,
        ...form,
      });
      alert("Tạo tài khoản thành công, hãy đăng nhập lại!");
      window.location.href = "/auth";
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi hoàn tất đăng ký");
    }
  };

  return (
    <Box sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h5">Hoàn tất đăng ký cho {email}</Typography>
      <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2, maxWidth: 400, mx: "auto" }}>
        <TextField
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <TextField
          label="Số điện thoại"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
        <Button variant="contained" onClick={handleComplete}>
          Hoàn tất đăng ký
        </Button>
      </Box>
    </Box>
  );
}