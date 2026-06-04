const ITEMS = [
  "React",
  "TypeScript",
  "Next.js",
  "Python",
  "FastAPI",
  "LangChain",
  "RAG Pipelines",
  "Three.js",
];

export default function Marquee() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
