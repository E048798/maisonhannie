import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Georgia, Times, serif",
              fontSize: 140,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            MH
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 42,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Maison Hannie
          </div>
        </div>
      </div>
    ),
    size
  );
}