import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

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
          position: "relative",
          background:
            "radial-gradient(circle at top, #162344 0%, #0b1020 42%, #060816 100%)",
          borderRadius: 42,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(180deg, #f7d77f 0%, #d6a947 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#0b1020",
            transform: "translateX(18px) translateY(-4px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 38,
            left: 47,
            fontSize: 28,
            color: "#dff6ff",
            fontWeight: 700,
          }}
        >
          ✦
        </div>
      </div>
    ),
    size,
  );
}
