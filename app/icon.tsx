import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon — "AA" monogram with the signature lime dot on the dark base. */
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
          background: "#0b0b0d",
          color: "#f4f1ea",
          fontSize: 34,
          fontWeight: 600,
          fontFamily: "monospace",
          letterSpacing: "-0.04em",
          borderRadius: 14,
        }}
      >
        AA<span style={{ color: "#d4ff3f" }}>.</span>
      </div>
    ),
    { ...size },
  );
}
