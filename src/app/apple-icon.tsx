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
          background: "linear-gradient(135deg, #D4AF37 0%, #C4A030 100%)",
          borderRadius: 32,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, Times, serif",
            fontSize: 90,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          MH
        </div>
      </div>
    ),
    size
  );
}