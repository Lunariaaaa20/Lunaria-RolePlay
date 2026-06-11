import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

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
          position: "relative",
          background:
            "radial-gradient(circle at top, #162344 0%, #0b1020 42%, #060816 100%)",
          borderRadius: 120,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 26,
            borderRadius: 100,
            border: "1px solid rgba(244, 195, 90, 0.16)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "linear-gradient(180deg, #f7d77f 0%, #d6a947 100%)",
            boxShadow: "0 0 60px rgba(244, 195, 90, 0.28)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "#0b1020",
            transform: "translateX(52px) translateY(-10px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 118,
            left: 154,
            fontSize: 72,
            color: "#dff6ff",
            fontWeight: 700,
          }}
        >
          ✦
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 96,
            fontSize: 52,
            letterSpacing: 10,
            color: "#f8e2a5",
            fontWeight: 700,
          }}
        >
          LUNARIA
        </div>
      </div>
    ),
    size,
  );
}
