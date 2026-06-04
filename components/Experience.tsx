import { experience } from "@/lib/data";
import RevealGroup from "./RevealGroup";
import RevealItem from "./RevealItem";
import ScrollRevealText from "./ScrollRevealText";

export default function Experience() {
  return (
    <section className="block wrap" id="work" aria-label="Experience">
      <div className="block-head">
        <ScrollRevealText
          as="h2"
          segments={[{ text: "Selected " }, { text: "experience", em: true }]}
        />
        <span className="idx">02 — / career</span>
      </div>

      <RevealGroup className="xp">
        {experience.map((xp) => (
          <RevealItem className="xp-row" key={xp.role}>
            <div className="xp-date">{xp.date}</div>
            <div>
              <div className="xp-role">
                {xp.role}
                <span>{xp.org}</span>
              </div>
            </div>
            <div className="xp-desc">
              {xp.desc}
              <div className="xp-tags">
                {xp.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
