import ScrollRevealText from "./ScrollRevealText";

export default function Contact() {
  return (
    <section className="contact wrap" id="contact" aria-label="Contact">
      <span className="eyebrow">05 — Let&apos;s build</span>
      <ScrollRevealText
        as="h2"
        href="mailto:androyt1@gmail.com"
        segments={[
          { text: "Have an " },
          { text: "idea?", em: true },
          { br: true },
          { text: "Let's ship it." },
        ]}
      />
      <div className="contact-meta">
        <a href="mailto:androyt1@gmail.com">androyt1@gmail.com</a>
        <a href="tel:+447821460751">+44 7821 460751</a>
        <span>Carshalton, UK</span>
        <a
          href="https://portfolio-androyt1s-projects.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Live portfolio ↗
        </a>
      </div>
    </section>
  );
}
