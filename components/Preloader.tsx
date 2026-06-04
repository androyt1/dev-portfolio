"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add("is-loading");
    let p = 0;
    let timer: ReturnType<typeof setTimeout>;

    const finish = () => {
      window.setTimeout(() => {
        setDone(true);
        document.body.classList.remove("is-loading");
        window.dispatchEvent(new Event("preloader:done"));
      }, 350);
    };

    const tick = () => {
      p += Math.random() * 8 + 3;
      if (p >= 100) {
        setCount(100);
        finish();
        return;
      }
      setCount(Math.floor(p));
      timer = setTimeout(tick, 90 + Math.random() * 120);
    };
    tick();

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("is-loading");
    };
  }, []);

  return (
    <div className={`preloader${done ? " done" : ""}`} aria-hidden="true">
      <div className="pl-word">
        Andrew
        <br />
        <em>Aghoghovwia</em>
      </div>
      <div className="pl-count">{String(count).padStart(2, "0")}</div>
      <div className="pl-bar">
        <i style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}
