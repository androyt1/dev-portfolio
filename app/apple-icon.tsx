import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — larger monogram with a top-left lime glow. */
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
          background: "#0b0b0d",
          backgroundImage:
            "radial-gradient(140px 140px at 20% 15%, rgba(212,255,63,0.30), transparent 60%)",
          color: "#f4f1ea",
          fontSize: 92,
          fontWeight: 600,
          fontFamily: "monospace",
          letterSpacing: "-0.04em",
        }}
      >
        AA<span style={{ color: "#d4ff3f" }}>.</span>
      </div>
    ),
    { ...size },
  );
}
