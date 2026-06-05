import { ImageResponse } from "next/og";

export const alt = "Andrew Aghoghovwia — Senior Frontend & AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamically generated social-share card, in the site's palette:
 * #0b0b0d base with an electric-lime (#d4ff3f) searchlight glow from the
 * top-left corner — echoing the hero. Uses system fonts to avoid bundling
 * webfont data into the edge function.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0b0b0d",
          backgroundImage:
            "radial-gradient(900px 700px at 0% 0%, rgba(212,255,63,0.22), transparent 55%)",
          color: "#f4f1ea",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "monospace",
            color: "#b7b4ac",
          }}
        >
          <span style={{ color: "#d4ff3f", marginRight: 16 }}>●</span>
          Andrew Aghoghovwia
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
          }}
        >
          <span>Frontend engineering</span>
          <span>
            meets <span style={{ color: "#d4ff3f" }}>AI</span>.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontFamily: "monospace",
            color: "#b7b4ac",
            letterSpacing: "0.04em",
          }}
        >
          Senior Frontend &amp; AI Engineer · 7+ yrs · Remote
        </div>
      </div>
    ),
    { ...size },
  );
}
