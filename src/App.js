
// import { useState, createContext, useContext } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import Topbar from "./scenes/global/Topbar";
// import Sidebar from "./scenes/global/Sidebar";
// import Dashboard from "./scenes/dashboard";
// import Team from "./scenes/team";
// import Contacts from "./scenes/contacts";
// import Bar from "./scenes/bar";
// import Form from "./scenes/form";
// import Line from "./scenes/line";
// import Pie from "./scenes/pie";
// import Geography from "./scenes/geography";
// import { CssBaseline, ThemeProvider } from "@mui/material";
// import { ColorModeContext, useMode } from "./theme";
// import Calendar from "./scenes/calendar/calendar";
// import Login from "./scenes/login/Login";
// import LightControl from "./scenes/lightcontrol/LightControl";
// import ProtectedRoute from "./components/ProtectedRoute";
// import History from "./scenes/history/History";
// import { LightStateProvider } from "./hooks/useLightState";
// const LightStateContext = createContext();

// //  Hàm parse JSON an toàn
// const safeParse = (key, fallback) => {
//   try {
//     const raw = localStorage.getItem(key);
//     if (!raw) return fallback;

//     if (raw === "null" || raw === "undefined") {
//       localStorage.removeItem(key);
//       return fallback;
//     }

//     const parsed = JSON.parse(raw);
//     if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
//     if (typeof fallback === "object" && !Array.isArray(fallback) && typeof parsed !== "object") return fallback;

//     return parsed;
//   } catch (e) {
//     console.error(`Error parsing ${key} from localStorage:`, e);
//     localStorage.removeItem(key);
//     return fallback;
//   }
// };

// function App() {
//   const [theme, colorMode] = useMode();
//   const location = useLocation();
//   const isLoginPage = location.pathname === "/login";

//   const [lightStates, setLightStates] = useState(() =>
//     safeParse("lightStates", {})
//   );

//   const [currentEvents, setCurrentEvents] = useState(() =>
//     safeParse("currentEvents", [])
//   );

//   const [completedEvents, setCompletedEvents] = useState(() =>
//     safeParse("completedEvents", [])
//   );

//   const [lightHistory, setLightHistory] = useState(() =>
//     safeParse("lightHistory", [])
//   );

//   const updateLightStates = (newStates) => {
//     setLightStates(newStates);
//     localStorage.setItem("lightStates", JSON.stringify(newStates));
//   };

//   const updateCurrentEvents = (newEvents) => {
//     setCurrentEvents(newEvents);
//     localStorage.setItem("currentEvents", JSON.stringify(newEvents));
//   };

//   const updateCompletedEvents = (newEvents) => {
//     setCompletedEvents(newEvents);
//     localStorage.setItem("completedEvents", JSON.stringify(newEvents));
//   };

//   const updateLightHistory = (newHistory) => {
//     setLightHistory(newHistory);
//     localStorage.setItem("lightHistory", JSON.stringify(newHistory));
//   };

//   const syncLightStatesWithSchedule = (now) => {
//     const updatedLightStates = { ...lightStates };
//     const activeEvents = currentEvents.filter((event) => {
//       const eventStart = new Date(event.start);
//       const eventEnd = event.end
//         ? new Date(event.end)
//         : event.extendedProps.action === "off"
//         ? new Date(4102444800000)
//         : eventStart;
//       return now >= eventStart && now < eventEnd;
//     });

//     Object.keys(updatedLightStates).forEach((lightId) => {
//       if (
//         updatedLightStates[lightId].manualOverride &&
//         updatedLightStates[lightId].lastManualAction
//       ) {
//         const lastManualActionTime = new Date(updatedLightStates[lightId].lastManualAction);
//         if (now - lastManualActionTime < 5000) {
//           return;
//         }
//       }
//       if (!activeEvents.some((event) => event.extendedProps.lightId === lightId)) {
//         if (!updatedLightStates[lightId].manualOverride) {
//           updatedLightStates[lightId].isOn = false;
//         }
//       }
//     });

//     activeEvents.forEach((event) => {
//       const lightId = event.extendedProps.lightId;
//       if (!updatedLightStates[lightId]) {
//         updatedLightStates[lightId] = {
//           isOn: false,
//           power: 100,
//           brightness: 50,
//           manualOverride: false,
//           lastOffEvent: null,
//           lastManualAction: null,
//         };
//       }
//       if (
//         !updatedLightStates[lightId].manualOverride ||
//         (updatedLightStates[lightId].lastManualAction &&
//           now - new Date(updatedLightStates[lightId].lastManualAction) >= 5000)
//       ) {
//         updatedLightStates[lightId].isOn = event.extendedProps.action === "on";
//         updatedLightStates[lightId].manualOverride = false;
//         updatedLightStates[lightId].lastOffEvent =
//           event.extendedProps.action === "off" ? event.start : null;
//       }
//     });

//     setLightStates(updatedLightStates);
//     localStorage.setItem("lightStates", JSON.stringify(updatedLightStates));
//     return activeEvents;
//   };

//   return (
//     <ColorModeContext.Provider value={colorMode}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <LightStateContext.Provider
//           value={{
//             lightStates,
//             setLightStates: updateLightStates,
//             currentEvents,
//             setCurrentEvents: updateCurrentEvents,
//             completedEvents,
//             setCompletedEvents: updateCompletedEvents,
//             lightHistory,
//             setLightHistory: updateLightHistory,
//             syncLightStatesWithSchedule,
//           }}
//         >
//           {isLoginPage ? (
//             // Trang login thì chỉ render Login
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="*" element={<Navigate to="/login" />} />
//             </Routes>
//           ) : (
//             // Các trang khác thì render Sidebar + Topbar
//             <div style={{ display: "flex" }}>
//               <Sidebar />
//               <main className="content">
//                 <Topbar />
//                 <Routes>
//                   <Route
//                     path="/"
//                     element={
//                       <ProtectedRoute>
//                         <Dashboard />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/team"
//                     element={
//                       <ProtectedRoute>
//                         <Team />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/contacts"
//                     element={
//                       <ProtectedRoute>
//                         <Contacts />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/form"
//                     element={
//                       <ProtectedRoute>
//                         <Form />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/bar"
//                     element={
//                       <ProtectedRoute>
//                         <Bar />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/pie"
//                     element={
//                       <ProtectedRoute>
//                         <Pie />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/line"
//                     element={
//                       <ProtectedRoute>
//                         <Line />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/calendar"
//                     element={
//                       <ProtectedRoute>
//                         <Calendar />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/geography"
//                     element={
//                       <ProtectedRoute>
//                         <Geography />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/light-control"
//                     element={
//                       <ProtectedRoute>
//                         <LightControl />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/history"
//                     element={
//                       <ProtectedRoute>
//                         <History />
//                       </ProtectedRoute>
//                     }
//                   />
//                 </Routes>
//               </main>
//             </div>
//           )}
//         </LightStateContext.Provider>
//       </ThemeProvider>
//     </ColorModeContext.Provider>
//   );
// }

// export const useLightState = () => useContext(LightStateContext);

// export default App;


import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/Login";
import LightControl from "./scenes/lightcontrol/LightControl";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./scenes/history/History";
import { LightStateProvider } from "./hooks/useLightState";
import CompleteRegistration from "./scenes/pages/CompleteRegistration";
const LightStateContext = createContext();

//  Hàm parse JSON an toàn
const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    if (raw === "null" || raw === "undefined") {
      localStorage.removeItem(key);
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === "object" && !Array.isArray(fallback) && typeof parsed !== "object") return fallback;

    return parsed;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";

  const [lightStates, setLightStates] = useState(() =>
    safeParse("lightStates", {})
  );

  const [currentEvents, setCurrentEvents] = useState(() =>
    safeParse("currentEvents", [])
  );

  const [completedEvents, setCompletedEvents] = useState(() =>
    safeParse("completedEvents", [])
  );

  const [lightHistory, setLightHistory] = useState(() =>
    safeParse("lightHistory", [])
  );

  //  Tự động đăng xuất khi hết hạn token hoặc không hoạt động 15 phút
  useEffect(() => {
    const checkTokenAndActivity = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token hết hạn
          console.log(" Token đã hết hạn, đăng xuất...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        }
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    };

    // Kiểm tra mỗi 30 giây
    const interval = setInterval(checkTokenAndActivity, 30000);

    // Kiểm tra hoạt động người dùng
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log("Hết 15 phút không hoạt động → đăng xuất");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      }, 15 * 60 * 1000); // 15 phút
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer();

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate]);

  // ===========================================================
  // Dưới đây giữ nguyên logic của bạn
  // ===========================================================

  const updateLightStates = (newStates) => {
    setLightStates(newStates);
    localStorage.setItem("lightStates", JSON.stringify(newStates));
  };

  const updateCurrentEvents = (newEvents) => {
    setCurrentEvents(newEvents);
    localStorage.setItem("currentEvents", JSON.stringify(newEvents));
  };

  const updateCompletedEvents = (newEvents) => {
    setCompletedEvents(newEvents);
    localStorage.setItem("completedEvents", JSON.stringify(newEvents));
  };

  const updateLightHistory = (newHistory) => {
    setLightHistory(newHistory);
    localStorage.setItem("lightHistory", JSON.stringify(newHistory));
  };

  const syncLightStatesWithSchedule = (now) => {
    const updatedLightStates = { ...lightStates };
    const activeEvents = currentEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end
        ? new Date(event.end)
        : event.extendedProps.action === "off"
        ? new Date(4102444800000)
        : eventStart;
      return now >= eventStart && now < eventEnd;
    });

    Object.keys(updatedLightStates).forEach((lightId) => {
      if (
        updatedLightStates[lightId].manualOverride &&
        updatedLightStates[lightId].lastManualAction
      ) {
        const lastManualActionTime = new Date(
          updatedLightStates[lightId].lastManualAction
        );
        if (now - lastManualActionTime < 5000) {
          return;
        }
      }
      if (!activeEvents.some((event) => event.extendedProps.lightId === lightId)) {
        if (!updatedLightStates[lightId].manualOverride) {
          updatedLightStates[lightId].isOn = false;
        }
      }
    });

    activeEvents.forEach((event) => {
      const lightId = event.extendedProps.lightId;
      if (!updatedLightStates[lightId]) {
        updatedLightStates[lightId] = {
          isOn: false,
          power: 100,
          brightness: 50,
          manualOverride: false,
          lastOffEvent: null,
          lastManualAction: null,
        };
      }
      if (
        !updatedLightStates[lightId].manualOverride ||
        (updatedLightStates[lightId].lastManualAction &&
          now - new Date(updatedLightStates[lightId].lastManualAction) >= 5000)
      ) {
        updatedLightStates[lightId].isOn = event.extendedProps.action === "on";
        updatedLightStates[lightId].manualOverride = false;
        updatedLightStates[lightId].lastOffEvent =
          event.extendedProps.action === "off" ? event.start : null;
      }
    });

    setLightStates(updatedLightStates);
    localStorage.setItem("lightStates", JSON.stringify(updatedLightStates));
    return activeEvents;
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LightStateContext.Provider
          value={{
            lightStates,
            setLightStates: updateLightStates,
            currentEvents,
            setCurrentEvents: updateCurrentEvents,
            completedEvents,
            setCompletedEvents: updateCompletedEvents,
            lightHistory,
            setLightHistory: updateLightHistory,
            syncLightStatesWithSchedule,
          }}
        >
          {isLoginPage || location.pathname === "/complete-registration" ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/complete-registration" element={<CompleteRegistration />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <div style={{ display: "flex" }}>
              <Sidebar />
              <main className="content">
                <Topbar />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <Team />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contacts"
                    element={
                      <ProtectedRoute>
                        <Contacts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/form"
                    element={
                      <ProtectedRoute>
                        <Form />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bar"
                    element={
                      <ProtectedRoute>
                        <Bar />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pie"
                    element={
                      <ProtectedRoute>
                        <Pie />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/line"
                    element={
                      <ProtectedRoute>
                        <Line />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/geography"
                    element={
                      <ProtectedRoute>
                        <Geography />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/light-control"
                    element={
                      <ProtectedRoute>
                        <LightControl />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          )}
        </LightStateContext.Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useLightState = () => useContext(LightStateContext);

export default App;
