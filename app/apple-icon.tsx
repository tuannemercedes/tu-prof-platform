import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #c8a66b 0%, #c46a43 100%)",
          color: "#f7f4ee",
          fontSize: 90,
          fontWeight: 700,
        }}
      >
        TP
      </div>
    ),
    { ...size }
  );
}
