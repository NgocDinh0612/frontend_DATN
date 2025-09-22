import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
const API_BASE = "http://localhost:5000/api";
// Styled Button với hiệu ứng hiện đại
const StyledButton = styled(Button)(({ theme }) => ({
  mt: 3,
  py: 1.5,
  borderRadius: "8px",
  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
  color: "#ffffff",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(90deg, #1565c0, #2196f3)",
    transform: "scale(1.05)",
    boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)",
  },
}));
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }
      const { accessToken } = data;
      if (!accessToken) {
        setError("Không nhận được token từ server");
        return;
      }
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", data.refreshToken); 
      localStorage.setItem("isAuthenticated", "true");

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối tới server");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: "#f5f7fa",
        fontFamily: '"Poppins", sans-serif',
        animation: "fadeIn 0.5s ease-in-out",
        width: "100%",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      <Box
        p={4}
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          width: { xs: "90%", sm: 400 },
          maxWidth: 400,
          textAlign: "center",
          animation: "fadeIn 0.5s ease-in-out",
          margin: "0 auto",
        }}
      >
        <Box mb={3}>
          <img
            src="../../assets/image.png"
            alt="Logo"
            style={{ width: "100px", height: "100px", borderRadius: "50%", display: "block", margin: "0 auto" }}
          />
        </Box>

        <Typography
          variant="h4"
          mb={2}
          color="#05814fff"
          fontWeight="bold"
          sx={{ fontFamily: '"Poppins", sans-serif' }}
        >
          SKYTECH
        </Typography>

        <Typography
          variant="h6"
          mb={4}
          color="#666"
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}
        >
          Đăng Nhập Vào Hệ Thống
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                "& input": { color: "#333" },
              },
              "& .MuiInputLabel-root": { color: "#666" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                "& input": { color: "#333" },
              },
              "& .MuiInputLabel-root": { color: "#666" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
            }}
          />
          {error && (
            <Typography
              color="#d32f2f"
              mt={1}
              sx={{ fontSize: "0.9rem", fontFamily: '"Poppins", sans-serif' }}
            >
              {error}
            </Typography>
          )}
          <StyledButton
            fullWidth
            type="submit"
            variant="contained"
          >
            Đăng Nhập
          </StyledButton>
        </form>
      </Box>
    </Box>
  );
};

export default Login;