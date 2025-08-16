import { ImageResponse } from "next/og"

export const runtime = "edge"

// Route segment config
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

const SITE_NAME = "ZeroSlash Agency"

export default async function OGImage({
  searchParams,
}: {
  searchParams?: { title?: string }
}) {
  const title = (searchParams?.title || SITE_NAME).slice(0, 100)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "white",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(600px 300px at 10% 10%, rgba(183,255,99,0.15), transparent), radial-gradient(600px 300px at 90% 90%, rgba(125,179,255,0.15), transparent)",
          }}
        />
        <div style={{ fontSize: 44, opacity: 0.7, letterSpacing: 6, textTransform: "uppercase" }}>Zeroslash</div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.1,
            textAlign: "center",
            maxWidth: 960,
            padding: "0 40px",
            backgroundImage: "linear-gradient(90deg, #b7ff63, #7db3ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, opacity: 0.85 }}>
          Digital Solutions That Deliver Results
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
