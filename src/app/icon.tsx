import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, Times, serif",
            fontSize: 18,
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