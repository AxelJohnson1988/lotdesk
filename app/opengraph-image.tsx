import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#12100c",
          color: "#e8dfcf",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: 4 }}>
          <span>55401 · NIGHT SHIFT</span>
          <span>FLOOR 28% NET</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, letterSpacing: -2 }}>Lotdesk</div>
          <div style={{ fontSize: 28, color: "#9a907c", marginTop: 8 }}>
            Minneapolis auction desk. Hammer, premium, tax, trailer, rehab.
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 18, color: "#e0b040" }}>
          <span>MIDWEST WIRE</span>
          <span>LIVE GSA</span>
          <span>PASTE</span>
        </div>
      </div>
    ),
    size,
  );
}
