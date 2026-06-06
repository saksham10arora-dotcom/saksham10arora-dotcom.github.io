import { QuartzComponent, QuartzComponentConstructor } from "./types"

const stats = [
  "2.7M ops/sec",
  "p99 900ns",
  "IMC rank 154 / 18,800",
  "3.31x over baseline",
  "lock-free C++20",
  "CF rating 661",
  "HFT matching engine",
  "llm-bench in progress",
]

const StatsMarquee: QuartzComponent = () => {
  const doubled = [...stats, ...stats]
  return (
    <div class="stats-marquee-wrap">
      <div class="stats-marquee-track">
        {doubled.map((s, i) => (
          <span class="stats-marquee-item" key={i}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

StatsMarquee.afterDOMLoaded = `
(function () {
  const CHARS = "△▲◇◈⌬⬡#$@!?/|~^ABCDEFabcdef0123456789";
  let activeInterval = null;

  function scramble(el, target) {
    // Cancel any in-progress scramble before starting a new one
    if (activeInterval !== null) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
    let frame = 0;
    const total = target.length * 3;
    activeInterval = setInterval(() => {
      el.textContent = target
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (i < Math.floor(frame / 3)) return target[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      frame++;
      if (frame > total) {
        el.textContent = target;
        clearInterval(activeInterval);
        activeInterval = null;
      }
    }, 35);
  }

  function runScramble() {
    const el = document.querySelector(".page-title a");
    if (!el) return;
    scramble(el, el.textContent || "");
  }

  // spa.inline.ts fires "nav" at module top-level on initial load, which would
  // double-fire alongside our direct runScramble() below. The activeInterval
  // guard makes the second call cancel and restart cleanly instead of racing.
  document.addEventListener("nav", runScramble);
  window.addCleanup(() => document.removeEventListener("nav", runScramble));
  runScramble();
})();
`

export default (() => StatsMarquee) satisfies QuartzComponentConstructor
