// src/components/RealtimeLineChart.jsx
import React, { useEffect, useState, useRef } from "react";
import { ResponsiveLine } from "@nivo/line";
import { CircularProgress, Box, Typography } from "@mui/material";

const API_BASE = process.env.REACT_APP_API_URL || "https://be-js12.onrender.com/api";

function downsampleArray(arr, maxPoints) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  const out = [];
  for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
  const last = arr[arr.length - 1];
  if (out.length === 0 || out[out.length - 1].ts !== last.ts) out.push(last);
  return out;
}

const RealtimeLineChart = ({
  devices = [],
  periodMinutes = 43200,
  maxPoints = 10000,
  pollIntervalMs = 5000,
  height = "100%",
  yScale: customYScale,
  annotations = [],
}) => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const token = localStorage.getItem("accessToken");
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const convertToNivo = (dataObj) => {
    const out = [];
    if (!dataObj) return out;

    for (const deviceId of Object.keys(dataObj || {})) {
      let raw = (dataObj[deviceId] || [])
        .filter(
          (p) =>
            p &&
            p.ts &&
            p.current !== null &&
            p.current !== undefined &&
            !Number.isNaN(Number(p.current))
        )
        .map((p) => ({
          ts: p.ts,
          x: new Date(p.ts),
          y: Number(p.current),
        }));

      // Lấy 30 điểm gần nhất để xử lý realtime mượt
      raw.sort((a, b) => b.x - a.x);
      raw = raw.slice(0, 30);
      raw.sort((a, b) => a.x - b.x);

      const down = downsampleArray(
        raw.map((r) => ({ ts: r.ts, current: r.y })),
        maxPoints
      ).map((pt) => ({
        x: new Date(pt.ts),
        y: Number(pt.current),
      }));

      if (down.length > 0) out.push({ id: deviceId, data: down });
    }
    return out;
  };

  const fetchData = async () => {
    if (!devices || devices.length === 0) {
      setSeries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        devices: devices.join(","),
        periodMinutes: String(periodMinutes),
        maxPoints: String(maxPoints),
      }).toString();

      const res = await fetch(`${API_BASE}/status/history?${qs}`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!res.ok) {
        console.warn("RealtimeLineChart: API error", res.status);
        setSeries([]);
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (!json || !json.ok || !json.data) {
        setSeries([]);
        setLoading(false);
        return;
      }

      const nivo = convertToNivo(json.data);
      if (mountedRef.current) setSeries(nivo);
    } catch (err) {
      console.error("RealtimeLineChart fetch error:", err);
      if (mountedRef.current) setSeries([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, pollIntervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [devices.join(","), periodMinutes, maxPoints, pollIntervalMs]);

  // Y-SCALE MẶC ĐỊNH
  const defaultYScale = {
    type: "linear",
    min: 0,
    max: 1.0,
    stacked: false,
    tickAmount: 11,
  };

  const yScale = customYScale || defaultYScale;

  if (loading && series.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={height}>
        <CircularProgress size={36} sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  if (!series || series.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={height}>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Không có dữ liệu dòng điện
        </Typography>
      </Box>
    );
  }

  return (
    <Box height={height} sx={{ position: "relative" }}>
      <ResponsiveLine
        data={series}
        xScale={{ type: "time", format: "native", precision: "second" }}
        xFormat="time:%H:%M:%S"
        margin={{ top: 20, right: 100, bottom: 50, left: 60 }}
        yScale={yScale}

        // Theme doanh nghiệp: sạch, tối giản, chuyên nghiệp
        theme={{
          background: "transparent",
          text: { fill: "#e2e8f0", fontSize: 11, fontFamily: "Inter, sans-serif" },
          axis: {
            domain: { line: { stroke: "#475569", strokeWidth: 1 } },
            ticks: {
              line: { stroke: "#475569", strokeWidth: 1 },
              text: { fill: "#94a3b8", fontSize: 11 },
            },
            legend: { text: { fill: "#cbd5e1", fontSize: 12, fontWeight: 600 } },
          },
          grid: { line: { stroke: "#334155", strokeWidth: 1 } },
          legends: { text: { fill: "#cbd5e1", fontSize: 11 } },
          tooltip: { container: { background: "#1e293b", color: "#f8fafc" } },
        }}

        axisBottom={{
          format: "%H:%M:%S",
          tickValues: "every 2 minutes",
          legend: "Thời gian",
          legendPosition: "middle",
          legendOffset: 36,
        }}
        axisLeft={{
          legend: "Dòng điện (A)",
          legendPosition: "middle",
          legendOffset: -48,
          tickValues: yScale.tickAmount,
          format: (v) => v.toFixed(3),
        }}

        colors={{ scheme: "paired" }}
        enablePoints={true}
        pointSize={8}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        pointLabel={(d) => `${d.y.toFixed(3)}A`}

        useMesh={true}
        enableSlices={false}

        // Tooltip doanh nghiệp: nhỏ gọn, rõ ràng
        tooltip={({ point }) => (
          <Box
            sx={{
              bgcolor: "#1e293b",
              color: "#f8fafc",
              p: 1.5,
              borderRadius: 2,
              border: "1px solid #334155",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              fontSize: "0.8rem",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#22d3ee" }}>
              {point.serieId}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
              <strong>Thời gian:</strong>{" "}
              {point.data.x.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              <strong>Dòng:</strong>{" "}
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                {point.data.y.toFixed(3)} A
              </span>
            </Typography>
          </Box>
        )}

        // VẼ ANNOTATIONS (chỉ nếu có)
        layers={[
          "grid",
          "markers",
          "axes",
          "areas",
          "crosshair",
          "lines",
          "points",
          "slices",
          "mesh",
          "legends",
          annotations.length > 0 &&
            (({ innerWidth, yScale }) =>
              annotations.map((anno, i) => {
                const y = yScale(anno.y);
                if (isNaN(y)) return null;
                return (
                  <g key={i}>
                    <line
                      x1={0}
                      x2={innerWidth}
                      y1={y}
                      y2={y}
                      stroke={anno.borderColor}
                      strokeWidth={2}
                      strokeDasharray={anno.strokeDashArray || "6,4"}
                    />
                    <text
                      x={innerWidth - 80}
                      y={y - 8}
                      fill="#fff"
                      fontSize="11px"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {anno.label.text}
                    </text>
                  </g>
                );
              })),
        ].filter(Boolean)}

        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 90,
            translateY: 0,
            itemsSpacing: 6,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 14,
            itemOpacity: 0.85,
            symbolSize: 10,
            symbolShape: "circle",
            toggleSerie: true,
            effects: [
              {
                on: "hover",
                style: { itemOpacity: 1 },
              },
            ],
          },
        ]}

        motionConfig="gentle"
        enableGridX={true}
        enableGridY={true}
        gridXValues={6}
        gridYValues={yScale.tickAmount}
        curve="monotoneX"
      />
    </Box>
  );
};

export default RealtimeLineChart;