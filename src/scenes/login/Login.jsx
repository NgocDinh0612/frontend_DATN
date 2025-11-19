// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Box, Button, TextField, Typography } from "@mui/material";
// // import { styled } from "@mui/material/styles";
// // import axios from "axios";

// // //const API_BASE = "https://be-js12.onrender.com/api";
// // const API_BASE = "http://localhost:5000/api";

// // // Styled Button với hiệu ứng hiện đại
// // const StyledButton = styled(Button)(({ theme }) => ({
// //   mt: 3,
// //   py: 1.5,
// //   borderRadius: "8px",
// //   background: "linear-gradient(90deg, #1976d2, #42a5f5)",
// //   color: "#ffffff",
// //   textTransform: "none",
// //   fontSize: "1rem",
// //   fontWeight: 600,
// //   boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
// //   transition: "all 0.3s ease",
// //   "&:hover": {
// //     background: "linear-gradient(90deg, #1565c0, #2196f3)",
// //     transform: "scale(1.05)",
// //     boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)",
// //   },
// // }));

// // const Login = () => {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [error, setError] = useState("");
// //   const navigate = useNavigate();

// //   // Login thường (username/password)
// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     setError("");
// //     try {
// //       const res = await fetch(`${API_BASE}/auth/login`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ username, password }),
// //       });
// //       const data = await res.json();
// //       if (!res.ok) {
// //         setError(data.message || "Đăng nhập thất bại");
// //         return;
// //       }
// //       saveTokensAndGo(data);
// //     } catch (err) {
// //       console.error(err);
// //       setError("Lỗi kết nối tới server");
// //     }
// //   };

// //   // Login Google
// //   const handleGoogleLogin = () => {
// //     // mở popup Google login
// //     const googleAuthUrl = `${API_BASE}/auth/google`;
// //     const popup = window.open(
// //       googleAuthUrl,
// //       "_blank",
// //       "width=500,height=600"
// //     );

// //     // Lắng nghe message từ popup
// //     window.addEventListener("message", (event) => {
// //       if (event.origin !== window.location.origin) return; // chặn origin lạ
// //       const { accessToken, refreshToken, user } = event.data;
// //       if (accessToken) {
// //         saveTokensAndGo({ accessToken, refreshToken });
// //       }
// //     });
// //   };

// //   // Lưu token và chuyển trang
// //   const saveTokensAndGo = (data) => {
// //     const { accessToken, refreshToken } = data;
// //     if (!accessToken) {
// //       setError("Không nhận được token từ server");
// //       return;
// //     }
// //     localStorage.setItem("accessToken", accessToken);
// //     localStorage.setItem("refreshToken", refreshToken);
// //     localStorage.setItem("isAuthenticated", "true");
// //     navigate("/");
// //   };

// //   return (
// //     <Box
// //       display="flex"
// //       justifyContent="center"
// //       alignItems="center"
// //       minHeight="100vh"
// //       sx={{
// //         backgroundColor: "#f5f7fa",
// //         fontFamily: '"Poppins", sans-serif',
// //         animation: "fadeIn 0.5s ease-in-out",
// //         width: "100%",
// //       }}
// //     >
// //       <style>
// //         {`
// //           @keyframes fadeIn {
// //             from { opacity: 0; }
// //             to { opacity: 1; }
// //           }
// //         `}
// //       </style>

// //       <Box
// //         p={4}
// //         sx={{
// //           backgroundColor: "#ffffff",
// //           borderRadius: "16px",
// //           boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
// //           width: { xs: "90%", sm: 400 },
// //           maxWidth: 400,
// //           textAlign: "center",
// //           animation: "fadeIn 0.5s ease-in-out",
// //           margin: "0 auto",
// //         }}
// //       >
// //         <Box mb={3}>
// //           <img
// //             src={process.env.PUBLIC_URL + "/assets/logoskytech.png"}
// //             alt="Logo"
// //             style={{
// //               width: "100px",
// //               height: "100px",
// //               borderRadius: "50%",
// //               display: "block",
// //               margin: "0 auto",
// //             }}
// //           />
// //         </Box>

// //         <Typography
// //           variant="h4"
// //           mb={2}
// //           color="#05814fff"
// //           fontWeight="bold"
// //           sx={{ fontFamily: '"Poppins", sans-serif' }}
// //         >
// //           SKYTECH
// //         </Typography>

// //         <Typography
// //           variant="h6"
// //           mb={4}
// //           color="#666"
// //           sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}
// //         >
// //           Đăng Nhập Vào Hệ Thống
// //         </Typography>

// //         <form onSubmit={handleLogin}>
// //           <TextField
// //             fullWidth
// //             label="Tên tài khoản"
// //             value={username}
// //             onChange={(e) => setUsername(e.target.value)}
// //             margin="normal"
// //             variant="outlined"
// //             sx={{
// //               "& .MuiOutlinedInput-root": {
// //                 borderRadius: "8px",
// //                 "& fieldset": { borderColor: "#e0e0e0" },
// //                 "&:hover fieldset": { borderColor: "#1976d2" },
// //                 "&.Mui-focused fieldset": { borderColor: "#1976d2" },
// //                 "& input": { color: "#333" },
// //               },
// //               "& .MuiInputLabel-root": { color: "#666" },
// //               "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
// //             }}
// //           />
// //           <TextField
// //             fullWidth
// //             label="Mật khẩu"
// //             type="password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             margin="normal"
// //             variant="outlined"
// //             sx={{
// //               "& .MuiOutlinedInput-root": {
// //                 borderRadius: "8px",
// //                 "& fieldset": { borderColor: "#e0e0e0" },
// //                 "&:hover fieldset": { borderColor: "#1976d2" },
// //                 "&.Mui-focused fieldset": { borderColor: "#1976d2" },
// //                 "& input": { color: "#333" },
// //               },
// //               "& .MuiInputLabel-root": { color: "#666" },
// //               "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
// //             }}
// //           />
// //           {error && (
// //             <Typography
// //               color="#d32f2f"
// //               mt={1}
// //               sx={{ fontSize: "0.9rem", fontFamily: '"Poppins", sans-serif' }}
// //             >
// //               {error}
// //             </Typography>
// //           )}
// //           <StyledButton fullWidth type="submit" variant="contained">
// //             Đăng Nhập
// //           </StyledButton>
// //         </form>

// //         <Typography mt={2} mb={1} color="#666" fontSize="0.9rem">
// //           Hoặc
// //         </Typography>

// //         <StyledButton
// //           fullWidth
// //           variant="contained"
// //           onClick={handleGoogleLogin}
// //           sx={{
// //             background: "linear-gradient(90deg, #db4437, #ff6f61)",
// //             "&:hover": {
// //               background: "linear-gradient(90deg, #c23321, #e65a4f)",
// //             },
// //           }}
// //         >
// //           Đăng nhập với Google
// //         </StyledButton>
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default Login;









// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, Button, TextField, Typography } from "@mui/material";
// import { styled } from "@mui/material/styles";

// //const API_BASE = "http://localhost:5000/api";
// const API_BASE = "https://be-js12.onrender.com/api";



// // Styled Button với hiệu ứng hiện đại
// const StyledButton = styled(Button)(({ theme }) => ({
//   mt: 3,
//   py: 1.5,
//   borderRadius: "8px",
//   background: "linear-gradient(90deg, #1976d2, #42a5f5)",
//   color: "#ffffff",
//   textTransform: "none",
//   fontSize: "1rem",
//   fontWeight: 600,
//   boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
//   transition: "all 0.3s ease",
//   "&:hover": {
//     background: "linear-gradient(90deg, #1565c0, #2196f3)",
//     transform: "scale(1.05)",
//     boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)",
//   },
// }));

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   // Login thường
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.message || "Đăng nhập thất bại");
//         return;
//       }
//       saveTokensAndGo(data);
//     } catch (err) {
//       console.error(err);
//       setError("Lỗi kết nối tới server");
//     }
//   };

//   // Login Google
//   const handleGoogleLogin = () => {
//     const googleAuthUrl = `${API_BASE}/auth/google`;
//     const popup = window.open(
//       googleAuthUrl,
//       "_blank",
//       "width=500,height=600"
//     );

//     window.addEventListener("message", (event) => {
//       if (event.origin !== window.location.origin) return; 
//       const { accessToken, refreshToken } = event.data;
//       if (accessToken) {
//         saveTokensAndGo({ accessToken, refreshToken });
//       }
//     });
//   };

//   // Lưu token và chuyển trang
//   const saveTokensAndGo = (data) => {4
//     const { accessToken, refreshToken } = data;
//     if (!accessToken) {
//       setError("Không nhận được token từ server");
//       return;
//     }
//     localStorage.setItem("accessToken", accessToken);
//     localStorage.setItem("refreshToken", refreshToken);
//     localStorage.setItem("isAuthenticated", "true");
//     navigate("/"); // chuyển sang dashboard hoặc trang chính
//   };

//   return (
//     <Box
//       display="flex"
//       justifyContent="center"
//       alignItems="center"
//       minHeight="100vh"
//       sx={{
//         backgroundColor: "#f5f7fa",
//         fontFamily: '"Poppins", sans-serif',
//         animation: "fadeIn 0.5s ease-in-out",
//         width: "100%",
//       }}
//     >
//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
//         `}
//       </style>

//       <Box
//         p={4}
//         sx={{
//           backgroundColor: "#ffffff",
//           borderRadius: "16px",
//           boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
//           width: { xs: "90%", sm: 400 },
//           maxWidth: 400,
//           textAlign: "center",
//           animation: "fadeIn 0.5s ease-in-out",
//           margin: "0 auto",
//         }}
//       >
//         <Box mb={3}>
//           <img
//             src={process.env.PUBLIC_URL + "/assets/logoskytech.png"}
//             alt="Logo"
//             style={{
//               width: "100px",
//               height: "100px",
//               borderRadius: "50%",
//               display: "block",
//               margin: "0 auto",
//             }}
//           />
//         </Box>

//         <Typography
//           variant="h4"
//           mb={2}
//           color="#05814fff"
//           fontWeight="bold"
//           sx={{ fontFamily: '"Poppins", sans-serif' }}
//         >
//           SKYTECH
//         </Typography>

//         <Typography
//           variant="h6"
//           mb={4}
//           color="#666"
//           sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}
//         >
//           Đăng Nhập Vào Hệ Thống
//         </Typography>

//         <form onSubmit={handleLogin}>
//           <TextField
//             fullWidth
//             label="Tên tài khoản"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             margin="normal"
//             variant="outlined"
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 "& fieldset": { borderColor: "#e0e0e0" },
//                 "&:hover fieldset": { borderColor: "#1976d2" },
//                 "&.Mui-focused fieldset": { borderColor: "#1976d2" },
//                 "& input": { color: "#333" },
//               },
//               "& .MuiInputLabel-root": { color: "#666" },
//               "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
//             }}
//           />
//           <TextField
//             fullWidth
//             label="Mật khẩu"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             margin="normal"
//             variant="outlined"
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 "& fieldset": { borderColor: "#e0e0e0" },
//                 "&:hover fieldset": { borderColor: "#1976d2" },
//                 "&.Mui-focused fieldset": { borderColor: "#1976d2" },
//                 "& input": { color: "#333" },
//               },
//               "& .MuiInputLabel-root": { color: "#666" },
//               "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
//             }}
//           />
//           {error && (
//             <Typography
//               color="#d32f2f"
//               mt={1}
//               sx={{ fontSize: "0.9rem", fontFamily: '"Poppins", sans-serif' }}
//             >
//               {error}
//             </Typography>
//           )}
//           <StyledButton fullWidth type="submit" variant="contained">
//             Đăng Nhập
//           </StyledButton>
//         </form>

//         <Typography mt={2} mb={1} color="#666" fontSize="0.9rem">
//           Hoặc
//         </Typography>

//         <StyledButton
//           fullWidth
//           variant="contained"
//           onClick={handleGoogleLogin}
//           sx={{
//             background: "linear-gradient(90deg, #db4437, #ff6f61)",
//             "&:hover": {
//               background: "linear-gradient(90deg, #c23321, #e65a4f)",
//             },
//           }}
//         >
//           Đăng nhập với Google
//         </StyledButton>
//       </Box>
//     </Box>
//   );
// };

// export default Login;



///code fix


// src/pages/Login.jsx
import { useState, useEffect } from "react"; // ← THÊM useEffect
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";

const API_BASE = "https://be-js12.onrender.com/api";

// Styled Components - Giữ nguyên 100%
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
  padding: theme.spacing(2),
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
}));

const LoginCard = styled(Box)(({ theme }) => ({
  background: "#ffffff",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
  padding: theme.spacing(5),
  width: "100%",
  maxWidth: 420,
  textAlign: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.12)",
  },
}));

const Logo = styled("img")({
  width: 90,
  height: 90,
  borderRadius: "50%",
  border: "4px solid transparent",
  background: "linear-gradient(white, white) padding-box, linear-gradient(90deg, #1976d2, #42a5f5) border-box",
  padding: 4,
  objectFit: "contain",
});

const GradientButton = styled(Button)(({ theme }) => ({
  mt: 3,
  py: 1.6,
  borderRadius: "12px",
  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
  color: "#ffffff",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(90deg, #1565c0, #2196f3)",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(25, 118, 210, 0.4)",
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  mt: 2,
  py: 1.6,
  borderRadius: "12px",
  background: "#ffffff",
  color: "#333",
  border: "1px solid #dadce0",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "#f8f9fa",
    borderColor: "#c6c6c6",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f9fbfd",
    transition: "all 0.3s ease",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#1976d2" },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
    },
  },
  "& .MuiInputLabel-root": { color: "#64748b", fontWeight: 500 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
}));

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // CHỈ SỬA PHẦN NÀY – LUÔN LUÔN NGHE postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "https://be-js12.onrender.com") return;

      if (event.data && event.data.accessToken) {
        const { accessToken, refreshToken, user } = event.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken || "");
        if (user) localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");
        navigate("/");
      }

      if (event.data?.type === "pending") {
        navigate("/light-control");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }
      saveTokensAndGo(data);
    } catch (err) {
      setError("Lỗi kết nối tới server");
    }
  };

  // CHỈ MỞ POPUP – KHÔNG ĐĂNG KÝ LISTENER Ở ĐÂY NỮA
  const handleGoogleLogin = () => {
    const googleAuthUrl = "https://be-js12.onrender.com/api/auth/google";
    const popup = window.open(
      googleAuthUrl,
      "google-login",
      "width=500,height=600,left=200,top=200"
    );

    if (!popup) {
      alert("Vui lòng cho phép popup để đăng nhập bằng Google!");
    }
  };

  const saveTokensAndGo = ({ accessToken, refreshToken }) => {
    if (!accessToken) {
      setError("Không nhận được token");
      return;
    }
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken || "");
    localStorage.setItem("isAuthenticated", "true");
    navigate("/");
  };

  return (
    <LoginContainer>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .login-card { animation: fadeIn 0.6s ease-out; }
        `}
      </style>

      <LoginCard className="login-card">
        <Box mb={3}>
          <Logo
            src={process.env.PUBLIC_URL + "/assets/user2.png"}
            alt="SKYTECH"
          />
        </Box>

        <Typography variant="h4" fontWeight={700} color="#1e293b" mb={0.5} letterSpacing="-0.5px">
          SKYTECH
        </Typography>
        <Typography variant="body1" color="#64748b" mb={4} fontWeight={500}>
          Hệ thống quản lý đèn thông minh
        </Typography>

        <Box component="form" onSubmit={handleLogin}>
          <StyledTextField
            fullWidth
            label="Tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <StyledTextField
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          {error && (
            <Typography color="#ef4444" mt={2} fontSize="0.9rem" fontWeight={500}>
              {error}
            </Typography>
          )}

          <GradientButton fullWidth type="submit">
            Đăng Nhập
          </GradientButton>
        </Box>

        <Box position="relative" my={3}>
          <Box
            sx={{
              height: "1px",
              backgroundColor: "#e2e8f0",
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
            }}
          />
          <Typography variant="caption" bgcolor="white" px={2} color="#94a3b8" position="relative">
            Hoặc
          </Typography>
        </Box>

        <GoogleButton fullWidth onClick={handleGoogleLogin} startIcon={<GoogleIcon />}>
          Tiếp tục với Google
        </GoogleButton>

        <Typography variant="caption" color="#94a3b8" mt={4} display="block">
          © 2025 SKYTECH. All rights reserved.
        </Typography>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;