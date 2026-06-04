"use client";

export default function Footer() {
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer>
      <span>© 2026 Andrew Aghoghovwia</span>
      <span>Senior Frontend &amp; AI Engineer</span>
      <button type="button" className="up" onClick={toTop}>
        Back to top ↑
      </button>
    </footer>
  );
}
