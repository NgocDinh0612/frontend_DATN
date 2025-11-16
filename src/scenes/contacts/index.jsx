// import { 
//   Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
//   TextField, Select, MenuItem, FormControl, InputLabel 
// } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { tokens } from "../../theme";
// import Header from "../../components/Header";
// import { useTheme } from "@mui/material";
// import { useState, useEffect } from "react";
// import axios from "axios";

// const Contacts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
  
//   // DÙNG BIẾN MÔI TRƯỜNG
//   const API_BASE = process.env.REACT_APP_API_URL;

//   const [rows, setRows] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [newUser, setNewUser] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     role: "user",
//   });

//   // Lấy danh sách user từ backend
//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       const res = await axios.get(`${API_BASE}/admin/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const formatted = res.data.map((user, index) => ({
//         id: user._id,
//         email: user.email,
//         role: user.role,
//         verified: user.isVerified ? "Yes" : "No",
//         registrarId: index + 1,
//       }));

//       setRows(formatted);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Submit form tạo user
//   const handleCreateUser = async () => {
//     if (!newUser.email) {
//       alert("Vui lòng nhập Email");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("accessToken");

//       await axios.post(
//         `${API_BASE}/admin/invite-user`,  // DÙNG API_BASE
//         {
//           email: newUser.email,
//           role: newUser.role,
//           firstName: newUser.firstName,
//           lastName: newUser.lastName,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert("Đã gửi lời mời xác nhận đến email người dùng!");
//       setOpen(false);
//       setNewUser({
//         firstName: "",
//         lastName: "",
//         email: "",
//         role: "user",
//       });
//       fetchUsers();
//     } catch (err) {
//       console.error("Error inviting user:", err.response?.data || err.message);
//       alert(err.response?.data?.message || "Lỗi gửi lời mời, kiểm tra log backend.");
//     }
//   };

//   const columns = [
//     { field: "id", headerName: "ID", flex: 1 },
//     { field: "email", headerName: "Email", flex: 1 },
//     { field: "role", headerName: "Role", flex: 1 },
//     { field: "verified", headerName: "Verified", flex: 1 },
//     { field: "registrarId", headerName: "Registrar ID", flex: 1 },
//   ];

//   return (
//     <Box m="20px">
//       <Header title="USERS" subtitle="Manage system users" />

//       <Button
//         variant="contained"
//         color="secondary"
//         onClick={() => setOpen(true)}
//         sx={{ mb: 2, fontWeight: "bold" }}
//       >
//         + Invite User
//       </Button>

//       <Box
//         m="20px 0 0 0"
//         height="70vh"
//         sx={{
//           "& .MuiDataGrid-root": { border: "none" },
//           "& .MuiDataGrid-cell": { borderBottom: "none" },
//           "& .MuiDataGrid-columnHeaders": {
//             backgroundColor: colors.blueAccent[700],
//             borderBottom: "none",
//             color: "white",
//           },
//           "& .MuiDataGrid-virtualScroller": {
//             backgroundColor: colors.primary[400],
//           },
//           "& .MuiDataGrid-footerContainer": {
//             borderTop: "none",
//             backgroundColor: colors.blueAccent[700],
//           },
//         }}
//       >
//         <DataGrid 
//           rows={rows} 
//           columns={columns} 
//           components={{ Toolbar: GridToolbar }} 
//           pageSize={10}
//           rowsPerPageOptions={[10, 20, 50]}
//         />
//       </Box>

//       {/* Dialog tạo user */}
//       <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle sx={{ fontWeight: "bold", color: colors.grey[100] }}>
//           Mời User Mới
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Email"
//             type="email"
//             fullWidth
//             required
//             margin="dense"
//             value={newUser.email}
//             onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//             sx={{ mb: 2 }}
//           />

//           <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
//             <InputLabel>Role</InputLabel>
//             <Select
//               value={newUser.role}
//               label="Role"
//               onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
//             >
//               <MenuItem value="user">User</MenuItem>
//               <MenuItem value="admin">Admin</MenuItem>
//               <MenuItem value="viewer">Viewer</MenuItem>
//             </Select>
//           </FormControl>

//           <TextField
//             label="First Name"
//             fullWidth
//             required
//             margin="dense"
//             value={newUser.firstName}
//             onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             label="Last Name"
//             fullWidth
//             required
//             margin="dense"
//             value={newUser.lastName}
//             onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
//           />
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Hủy</Button>
//           <Button onClick={handleCreateUser} variant="contained" color="secondary">
//             Gửi lời mời
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Contacts;




//code fix


// Contacts.jsx - Enterprise User Management Dashboard + KPI Cards
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Paper,
//   Stack,
//   Chip,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   Card,
//   CardContent,
//   Grid,
// } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { tokens } from "../../theme";
// import Header from "../../components/Header";
// import { useTheme } from "@mui/material";
// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";
// import PeopleIcon from "@mui/icons-material/People";
// import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
// import PersonIcon from "@mui/icons-material/Person";

// const Contacts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

//   const [rows, setRows] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const [newUser, setNewUser] = useState({
//     email: "",
//     role: "user",
//     firstName: "",
//     lastName: "",
//   });

//   // Lấy danh sách user
//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("accessToken");
//       const res = await axios.get(`${API_BASE}/admin/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const formatted = res.data.map((user, index) => ({
//         id: user._id,
//         email: user.email,
//         role: user.role,
//         verified: user.verified ? "Yes" : "No",
//         registrarId: index + 1,
//       }));

//       setRows(formatted);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // TÍNH TOÁN KPI TỪ DỮ LIỆU THỰC
//   const stats = useMemo(() => {
//     const total = rows.length;
//     const adminCount = rows.filter((r) => r.role === "admin").length;
//     const userCount = rows.filter((r) => r.role === "user" || r.role === "viewer").length;

//     return { total, admin: adminCount, user: userCount };
//   }, [rows]);

//   // Validate form
//   const validate = () => {
//     const err = {};
//     if (!newUser.email) err.email = "Email là bắt buộc";
//     else if (!/\S+@\S+\.\S+/.test(newUser.email)) err.email = "Email không hợp lệ";
//     if (!newUser.firstName) err.firstName = "Họ là bắt buộc";
//     if (!newUser.lastName) err.lastName = "Tên là bắt buộc";
//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   // Gửi lời mời
//   const handleCreateUser = async () => {
//     if (!validate()) return;

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("accessToken");
//       await axios.post(`${API_BASE}/admin/invite-user`, newUser, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       alert("Đã gửi lời mời thành công!");
//       setOpen(false);
//       setNewUser({ email: "", role: "user", firstName: "", lastName: "" });
//       setErrors({});
//       fetchUsers();
//     } catch (err) {
//       const msg = err.response?.data?.message || "Lỗi gửi lời mời";
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     { field: "registrarId", headerName: "STT", width: 70, align: "center" },
//     { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
//     {
//       field: "role",
//       headerName: "Vai trò",
//       flex: 0.8,
//       renderCell: (params) => (
//         <Chip
//           label={params.value}
//           size="small"
//           color={
//             params.value === "admin"
//               ? "error"
//               : params.value === "viewer"
//               ? "warning"
//               : "success"
//           }
//           sx={{ fontWeight: 600, mt: 1 }}
//         />
//       ),
//     },
//     {
//       field: "verified",
//       headerName: "Xác thực",
//       flex: 0.7,
//       renderCell: (params) => (
//         <Chip
//           label={params.value}
//           size="small"
//           color={params.value === "Yes" ? "success" : "default"}
//           sx={{ fontWeight: 600, mt: 1 }}
//         />
//       ),
//     },
//   ];

//   return (
//     <Box m="20px">
//       {/* HEADER */}
//       <Header title="QUẢN LÝ NGƯỜI DÙNG" subtitle="Mời và quản lý tài khoản hệ thống" />

//       {/* 3 KPI CARDS – DOANH NGHIỆP */}
//       <Grid container spacing={2} mb={4}>
//         {[
//           {
//             title: "TỔNG NGƯỜI DÙNG",
//             value: stats.total,
//             icon: <PeopleIcon sx={{ fontSize: 36, color: "#64748b" }} />,
//             color: "#1e293b",
//             subtitle: "Tổng tài khoản",
//           },
//           {
//             title: "ADMIN",
//             value: stats.admin,
//             icon: <AdminPanelSettingsIcon sx={{ fontSize: 36, opacity: 0.9 }} />,
//             color: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
//             textColor: "white",
//             subtitle: "Quyền cao nhất",
//           },
//           {
//             title: "USER",
//             value: stats.user,
//             icon: <PersonIcon sx={{ fontSize: 36, opacity: 0.9 }} />,
//             color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//             textColor: "white",
//             subtitle: "Người dùng thường",
//           },
//         ].map((kpi, i) => (
//           <Grid item xs={12} sm={4} key={i}>
//             <Card
//               sx={{
//                 bgcolor: kpi.color,
//                 borderRadius: 2.5,
//                 overflow: "hidden",
//                 height: "100%",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   transform: "translateY(-6px)",
//                   boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
//                 },
//               }}
//             >
//               <CardContent sx={{ p: 3 }}>
//                 <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//                   <Box>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         color: kpi.textColor || "#94a3b8",
//                         fontWeight: 500,
//                         fontSize: "0.75rem",
//                         letterSpacing: "0.5px",
//                       }}
//                     >
//                       {kpi.title}
//                     </Typography>
//                     <Typography
//                       variant="h4"
//                       sx={{
//                         color: kpi.textColor || "#f8fafc",
//                         fontWeight: 700,
//                         mt: 0.5,
//                         fontSize: "2rem",
//                       }}
//                     >
//                       {kpi.value}
//                     </Typography>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         color: kpi.textColor ? "rgba(255,255,255,0.7)" : "#10b981",
//                         mt: 0.5,
//                         fontSize: "0.7rem",
//                       }}
//                     >
//                       {kpi.subtitle}
//                     </Typography>
//                   </Box>
//                   {kpi.icon}
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* NÚT MỜI USER */}
//       <Box mb={3}>
//         <Tooltip title="Mời người dùng mới">
//           <Button
//             variant="contained"
//             startIcon={<PersonAddIcon />}
//             onClick={() => setOpen(true)}
//             sx={{
//               bgcolor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//               color: "white",
//               fontWeight: 600,
//               textTransform: "none",
//               px: 3,
//               py: 1.2,
//               borderRadius: 2,
//               boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
//               "&:hover": {
//                 bgcolor: "linear-gradient(135deg, #059669 0%, #047857 100%)",
//                 boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
//               },
//             }}
//           >
//             Mời Người Dùng
//           </Button>
//         </Tooltip>
//       </Box>

//       {/* BẢNG DỮ LIỆU */}
//       <Paper
//         elevation={0}
//         sx={{
//           bgcolor: colors.primary[400],
//           border: `1px solid ${colors.grey[800]}`,
//           borderRadius: 3,
//           overflow: "hidden",
//         }}
//       >
//         <Box height="60vh">
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             loading={loading}
//             components={{ Toolbar: GridToolbar }}
//             pageSize={10}
//             rowsPerPageOptions={[10, 25, 50]}
//             disableSelectionOnClick
//             sx={{
//               "& .MuiDataGrid-columnHeaders": {
//                 bgcolor: colors.blueAccent[700],
//                 color: "#e2e8f0",
//                 fontWeight: 600,
//                 borderBottom: "none",
//               },
//               "& .MuiDataGrid-cell": {
//                 borderBottom: `1px solid ${colors.grey[800]}`,
//                 py: 1.5,
//               },
//               "& .MuiDataGrid-row:hover": {
//                 bgcolor: colors.primary[500],
//               },
//               "& .MuiDataGrid-footerContainer": {
//                 bgcolor: colors.blueAccent[700],
//                 borderTop: "none",
//               },
//               "& .MuiCircularProgress-root": {
//                 color: "#10b981",
//               },
//             }}
//           />
//         </Box>
//       </Paper>

//       {/* DIALOG MỜI USER */}
//       <Dialog
//         open={open}
//         onClose={() => !loading && setOpen(false)}
//         fullWidth
//         maxWidth="sm"
//         fullScreen={isMobile}
//       >
//         <DialogTitle sx={{ bgcolor: colors.primary[400], pb: 2 }}>
//           <Stack direction="row" alignItems="center" gap={1}>
//             <PersonAddIcon sx={{ color: "#10b981" }} />
//             <Typography variant="h6" fontWeight={600}>
//               Mời Người Dùng Mới
//             </Typography>
//           </Stack>
//         </DialogTitle>

//         <DialogContent sx={{ bgcolor: colors.primary[400], pt: 3 }}>
//           <Stack spacing={2.5}>
//             <TextField
//               label="Email"
//               type="email"
//               fullWidth
//               required
//               value={newUser.email}
//               onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//               error={!!errors.email}
//               helperText={errors.email}
//               disabled={loading}
//             />

//             <FormControl fullWidth required>
//               <InputLabel>Vai trò</InputLabel>
//               <Select
//                 value={newUser.role}
//                 onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
//                 disabled={loading}
//               >
//                 <MenuItem value="user">User</MenuItem>
//                 <MenuItem value="admin">Admin</MenuItem>
//                 <MenuItem value="viewer">Viewer</MenuItem>
//               </Select>
//             </FormControl>

//             <TextField
//               label="Họ"
//               fullWidth
//               required
//               value={newUser.firstName}
//               onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
//               error={!!errors.firstName}
//               helperText={errors.firstName}
//               disabled={loading}
//             />

//             <TextField
//               label="Tên"
//               fullWidth
//               required
//               value={newUser.lastName}
//               onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
//               error={!!errors.lastName}
//               helperText={errors.lastName}
//               disabled={loading}
//             />
//           </Stack>
//         </DialogContent>

//         <DialogActions sx={{ bgcolor: colors.primary[400], p: 2, gap: 1 }}>
//           <Button onClick={() => setOpen(false)} disabled={loading} sx={{ color: colors.grey[300] }}>
//             Hủy
//           </Button>
//           <Button
//             onClick={handleCreateUser}
//             variant="contained"
//             disabled={loading}
//             startIcon={loading ? null : <PersonAddIcon />}
//             sx={{
//               bgcolor: "#10b981",
//               "&:hover": { bgcolor: "#059669" },
//               minWidth: 100,
//             }}
//           >
//             {loading ? "Đang gửi..." : "Mời"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Contacts;


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
  Paper,
  Stack,
  Chip,
  Tooltip,
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const [newUser, setNewUser] = useState({
    email: "",
    role: "user",
    firstName: "",
    lastName: "",
  });

  // HÀM GỌI API CÓ REFRESH TOKEN TỰ ĐỘNG
  const apiCall = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      return await axios({
        url: `${API_BASE}${url}`,
        headers: { Authorization: `Bearer ${token}` },
        ...options,
      });
    } catch (err) {
      if (err.response?.status === 401 && refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
          const newToken = res.data.accessToken;
          localStorage.setItem("accessToken", newToken);

          return await axios({
            url: `${API_BASE}${url}`,
            headers: { Authorization: `Bearer ${newToken}` },
            ...options,
          });
        } catch (refreshErr) {
          setAlert({ open: true, message: "Phiên hết hạn. Vui lòng đăng nhập lại!", severity: "error" });
          setTimeout(() => {
            localStorage.clear();
            window.location.href = "/login";
          }, 2000);
          throw refreshErr;
        }
      }
      throw err;
    }
  };

  // LẤY DANH SÁCH USER
  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await apiCall("/admin/users");
      const formatted = res.data.map((user, index) => ({
        id: user._id,
        email: user.email,
        role: user.role,
        verified: user.isVerified ? "Yes" : "No",
        registrarId: index + 1,
      }));
      setRows(formatted);
    } catch (err) {
      if (err.response?.status === 403) {
        setAlert({ open: true, message: "Bạn không có quyền truy cập!", severity: "error" });
      } else {
        setAlert({ open: true, message: "Lỗi tải dữ liệu. Vui lòng thử lại.", severity: "error" });
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // TÍNH TOÁN KPI
  const stats = useMemo(() => {
    const total = rows.length;
    const adminCount = rows.filter((r) => r.role === "admin").length;
    const userCount = rows.filter((r) => r.role === "user" || r.role === "viewer").length;
    return { total, admin: adminCount, user: userCount };
  }, [rows]);

  // VALIDATE FORM
  const validate = () => {
    const err = {};
    if (!newUser.email) err.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(newUser.email)) err.email = "Email không hợp lệ";
    if (!newUser.firstName) err.firstName = "Họ là bắt buộc";
    if (!newUser.lastName) err.lastName = "Tên là bắt buộc";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // GỬI LỜI MỜI
  const handleCreateUser = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await apiCall("/admin/invite-user", {
        method: "POST",
        data: {
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      });

      setAlert({ open: true, message: "Đã gửi lời mời thành công!", severity: "success" });
      setOpen(false);
      setNewUser({ email: "", role: "user", firstName: "", lastName: "" });
      setErrors({});
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi gửi lời mời. Vui lòng thử lại.";
      setAlert({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "registrarId", headerName: "STT", width: 70, align: "center" },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "role",
      headerName: "Vai trò",
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === "admin"
              ? "error"
              : params.value === "viewer"
              ? "warning"
              : "success"
          }
          sx={{ fontWeight: 600, mt: 1 }}
        />
      ),
    },
    {
      field: "verified",
      headerName: "Xác thực",
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Yes" ? "success" : "default"}
          sx={{ fontWeight: 600, mt: 1 }}
        />
      ),
    },
  ];

  return (
    <Box m="20px">
      {/* ALERT */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Header title="QUẢN LÝ NGƯỜI DÙNG" subtitle="Mời và quản lý tài khoản hệ thống" />

      {/* KPI CARDS */}
      <Grid container spacing={2} mb={4}>
        {[
          {
            title: "TỔNG NGƯỜI DÙNG",
            value: stats.total,
            icon: <PeopleIcon sx={{ fontSize: 36, color: "#64748b" }} />,
            color: "#1e293b",
            subtitle: "Tổng tài khoản",
          },
          {
            title: "ADMIN",
            value: stats.admin,
            icon: <AdminPanelSettingsIcon sx={{ fontSize: 36, opacity: 0.9 }} />,
            color: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            textColor: "white",
            subtitle: "Quyền cao nhất",
          },
          {
            title: "USER",
            value: stats.user,
            icon: <PersonIcon sx={{ fontSize: 36, opacity: 0.9 }} />,
            color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            textColor: "white",
            subtitle: "Người dùng thường",
          },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card
              sx={{
                bgcolor: kpi.color,
                borderRadius: 2.5,
                overflow: "hidden",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: kpi.textColor || "#94a3b8",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {kpi.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: kpi.textColor || "#f8fafc",
                        fontWeight: 700,
                        mt: 0.5,
                        fontSize: "2rem",
                      }}
                    >
                      {kpi.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: kpi.textColor ? "rgba(255,255,255,0.7)" : "#10b981",
                        mt: 0.5,
                        fontSize: "0.7rem",
                      }}
                    >
                      {kpi.subtitle}
                    </Typography>
                  </Box>
                  {kpi.icon}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* NÚT MỜI USER */}
      <Box mb={3}>
        <Tooltip title="Mời người dùng mới">
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              "&:hover": {
                bgcolor: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
              },
            }}
          >
            Mời Người Dùng
          </Button>
        </Tooltip>
      </Box>

      {/* BẢNG DỮ LIỆU */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: colors.primary[400],
          border: `1px solid ${colors.grey[800]}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box height="60vh">
          <DataGrid
            rows={rows}
            columns={columns}
            loading={fetching}
            components={{ Toolbar: GridToolbar }}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: colors.blueAccent[700],
                color: "#e2e8f0",
                fontWeight: 600,
                borderBottom: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${colors.grey[800]}`,
                py: 1.5,
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: colors.primary[500],
              },
              "& .MuiDataGrid-footerContainer": {
                bgcolor: colors.blueAccent[700],
                borderTop: "none",
              },
              "& .MuiCircularProgress-root": {
                color: "#10b981",
              },
            }}
          />
        </Box>
      </Paper>

      {/* DIALOG MỜI USER */}
      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: colors.primary[400], pb: 2 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <PersonAddIcon sx={{ color: "#10b981" }} />
            <Typography variant="h6" fontWeight={600}>
              Mời Người Dùng Mới
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: colors.primary[400], pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />

            <FormControl fullWidth required>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                disabled={loading}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Họ"
              fullWidth
              required
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
            />

            <TextField
              label="Tên"
              fullWidth
              required
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ bgcolor: colors.primary[400], p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} disabled={loading} sx={{ color: colors.grey[300] }}>
            Hủy
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              minWidth: 100,
            }}
          >
            {loading ? "Đang gửi..." : "Mời"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;