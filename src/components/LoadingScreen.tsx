import { useState, useEffect, useRef } from "react";

// Sequence of actions: type a string, or delete N characters
type Action =
  | { type: "type"; text: string }
  | { type: "delete"; count: number }
  | { type: "pause"; ms: number };

const SEQUENCE: Action[] = [
  { type: "type", text: "I am a developer" },
  { type: "pause", ms: 400 },
  { type: "delete", count: "developer".length },
  { type: "type", text: "designer" },
  { type: "pause", ms: 400 },
  { type: "delete", count: "designer".length },
  { type: "type", text: "UI engineer" },
];

const TYPE_SPEED = 75;
const DELETE_SPEED = 55;
const DONE_PAUSE = 800;

function runSequence(
  setNameVisible: (v: boolean) => void,
  setSubtitle: (v: string) => void,
  setDone: (v: boolean) => void,
  setHidden: (v: boolean) => void,
) {
  let cancelled = false;
  let current = "";

  function sleep(ms: number) {
    return new Promise<void>((resolve) => {
      if (cancelled) return;
      setTimeout(resolve, ms);
    });
  }

  async function run() {
    setNameVisible(true);
    await sleep(600);

    for (const action of SEQUENCE) {
      if (cancelled) return;

      if (action.type === "pause") {
        await sleep(action.ms);
      } else if (action.type === "type") {
        for (const char of action.text) {
          if (cancelled) return;
          current += char;
          setSubtitle(current);
          await sleep(TYPE_SPEED);
        }
      } else if (action.type === "delete") {
        for (let i = 0; i < action.count; i++) {
          if (cancelled) return;
          current = current.slice(0, -1);
          setSubtitle(current);
          await sleep(DELETE_SPEED);
        }
      }
    }

    await sleep(DONE_PAUSE);
    if (cancelled) return;
    setDone(true);
    sessionStorage.setItem("loading-done", "1");
    await sleep(600);
    if (cancelled) return;
    setHidden(true);
  }

  run();
  return () => {
    cancelled = true;
  };
}

export default function LoadingScreen() {
  const [nameVisible, setNameVisible] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initial load check
  useEffect(() => {
    if (sessionStorage.getItem("loading-done")) {
      setHidden(true);
    } else {
      setActive(true);
    }
  }, []);

  // Listen for replay event
  useEffect(() => {
    function handleReplay() {
      setNameVisible(false);
      setSubtitle("");
      setDone(false);
      setHidden(false);
      setActive(true);
      window.scrollTo({ top: 0 });
    }
    window.addEventListener("replay-loading", handleReplay);
    return () => window.removeEventListener("replay-loading", handleReplay);
  }, []);

  // Run animation when active
  useEffect(() => {
    if (!active) return;
    const cancel = runSequence(setNameVisible, setSubtitle, setDone, setHidden);
    return cancel;
  }, [active]);

  // Lock body scroll while animation is active
  useEffect(() => {
    if (active && !hidden) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [active, hidden]);

  // Show skip button on mouse move or touch, hide after inactivity
  useEffect(() => {
    if (!active || done || hidden) return;

    function reveal() {
      setShowSkip(true);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      skipTimerRef.current = setTimeout(() => setShowSkip(false), 2500);
    }

    window.addEventListener("mousemove", reveal);
    window.addEventListener("touchstart", reveal);
    return () => {
      window.removeEventListener("mousemove", reveal);
      window.removeEventListener("touchstart", reveal);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, [active, done, hidden]);

  // Reset active flag once hidden so it can be replayed again
  useEffect(() => {
    if (hidden && active) setActive(false);
  }, [hidden, active]);

  function handleSkip() {
    setDone(true);
    sessionStorage.setItem("loading-done", "1");
    setTimeout(() => setHidden(true), 600);
  }

  if (hidden && !active) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "#1A1A1A",
        transform: done ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: hidden ? "none" : "auto",
        opacity: hidden ? 0 : 1,
      }}
    >
      <div className="text-center px-6">
        <h1
          className="font-mono text-3xl sm:text-4xl font-bold mb-3 transition-opacity duration-500"
          style={{
            color: "#EDEDEC",
            opacity: nameVisible ? 1 : 0,
          }}
        >
          Sam McCagg
        </h1>
        <div
          className="font-mono text-base sm:text-lg"
          style={{ color: "#888888", minHeight: "1.6em" }}
        >
          {subtitle}
          <span
            className="inline-block w-[2px] h-[1.1em] ml-0.5 align-middle"
            style={{
              backgroundColor: "#E8562A",
              animation: "blink 0.8s step-end infinite",
            }}
          />
        </div>
      </div>
      {!done && (
        <button
          onClick={handleSkip}
          className="absolute bottom-6 right-6 font-mono text-sm transition-opacity duration-300"
          style={{
            color: "#888888",
            opacity: showSkip ? 1 : 0,
            pointerEvents: showSkip ? "auto" : "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          skip →
        </button>
      )}
      <audio ref={audioRef} preload="none" />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
