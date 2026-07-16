"use client";

import { useEffect, useRef, useState } from "react";

interface MosquitoState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotation: number;
  flip: boolean;
  speed: number;
}

type Phase = "alive" | "dying" | "dead";

// Blood drop splat SVG paths, spread in different directions
const BLOOD_DROPS = [
  { dx: 0,   dy: -18, r: 5.5, rx: 4, ry: 5.5 },
  { dx: 14,  dy: -10, r: 4,   rx: 4, ry: 4   },
  { dx: 18,  dy:   4, r: 5,   rx: 5, ry: 4   },
  { dx: 10,  dy:  16, r: 4.5, rx: 4, ry: 4.5 },
  { dx: -5,  dy:  20, r: 6,   rx: 5, ry: 6   },
  { dx: -16, dy:  10, r: 4,   rx: 4, ry: 4   },
  { dx: -20, dy:  -4, r: 5,   rx: 5, ry: 4   },
  { dx: -10, dy: -15, r: 3.5, rx: 3.5, ry: 4 },
];

export default function FlyingMosquito() {
  const [mosq, setMosq] = useState<MosquitoState>({
    x: 20, y: 30, targetX: 60, targetY: 50, rotation: 0, flip: false, speed: 0.008,
  });
  const [phase, setPhase] = useState<Phase>("alive");
  const [deadPos, setDeadPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<Phase>("alive");
  phaseRef.current = phase;

  useEffect(() => {
    let lastTime = performance.now();
    let current: MosquitoState = {
      x: 20, y: 30, targetX: 60, targetY: 50, rotation: 0, flip: false, speed: 0.008,
    };

    function pickNewTarget() {
      const newX = 5 + Math.random() * 90;
      const newY = 5 + Math.random() * 85;
      const dx = newX - current.x;
      const dy = newY - current.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      current.targetX = newX;
      current.targetY = newY;
      current.rotation = angle;
      current.flip = dx < 0;
      current.speed = 0.006 + Math.random() * 0.008;
    }

    function tick(now: number) {
      if (phaseRef.current !== "alive") return;
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const dx = current.targetX - current.x;
      const dy = current.targetY - current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.5) {
        pickNewTarget();
      } else {
        const step = current.speed * dt;
        const ratio = Math.min(step / dist, 1);
        current.x += dx * ratio;
        current.y += dy * ratio;
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let dAngle = targetAngle - current.rotation;
        if (dAngle > 180) dAngle -= 360;
        if (dAngle < -180) dAngle += 360;
        current.rotation += dAngle * 0.06;
        current.flip = dx < 0;
      }

      setMosq({ ...current });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function handleClick() {
    if (phase !== "alive") return;
    cancelAnimationFrame(rafRef.current);
    setDeadPos({ x: mosq.x, y: mosq.y });
    setPhase("dying");
    // After splat animation finishes, fade to dead smear
    setTimeout(() => setPhase("dead"), 600);
    // Then fade out entirely after a while
    setTimeout(() => setPhase("alive"), 4000);
  }

  // Respawn on "alive" re-entry after death timeout
  useEffect(() => {
    if (phase !== "alive") return;
    // re-kick the RAF loop
    let lastTime = performance.now();
    const startX = 5 + Math.random() * 90;
    const startY = 5 + Math.random() * 85;
    let current: MosquitoState = {
      x: startX, y: startY,
      targetX: 5 + Math.random() * 90,
      targetY: 5 + Math.random() * 85,
      rotation: 0, flip: false, speed: 0.008,
    };
    setMosq({ ...current });

    function pickNewTarget() {
      const newX = 5 + Math.random() * 90;
      const newY = 5 + Math.random() * 85;
      const dx = newX - current.x;
      const dy = newY - current.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      current.targetX = newX;
      current.targetY = newY;
      current.rotation = angle;
      current.flip = dx < 0;
      current.speed = 0.006 + Math.random() * 0.008;
    }

    function tick(now: number) {
      if (phaseRef.current !== "alive") return;
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const dx = current.targetX - current.x;
      const dy = current.targetY - current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1.5) {
        pickNewTarget();
      } else {
        const step = current.speed * dt;
        const ratio = Math.min(step / dist, 1);
        current.x += dx * ratio;
        current.y += dy * ratio;
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let dAngle = targetAngle - current.rotation;
        if (dAngle > 180) dAngle -= 360;
        if (dAngle < -180) dAngle += 360;
        current.rotation += dAngle * 0.06;
        current.flip = dx < 0;
      }
      setMosq({ ...current });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <>
      <style>{`
        @keyframes wingFlap {
          from { transform: scaleY(1) translateY(0px); }
          to   { transform: scaleY(0.35) translateY(2px); }
        }
        .wing-top { animation: wingFlap 0.11s ease-in-out infinite alternate; transform-origin: 24px 16px; }
        .wing-bot { animation: wingFlap 0.11s ease-in-out infinite alternate-reverse; transform-origin: 24px 16px; }

        @keyframes splatDrop {
          0%   { transform: scale(0) translate(0, 0); opacity: 1; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splatFadeOut {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .blood-drop {
          animation: splatDrop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .blood-smear {
          animation: splatFadeOut 2s ease-in 0.6s forwards;
        }
      `}</style>

      {/* Live mosquito */}
      {phase === "alive" && (
        <div
          className="absolute z-0 select-none cursor-pointer"
          style={{
            left: `${mosq.x}%`,
            top: `${mosq.y}%`,
            transform: "translate(-50%, -50%)",
            willChange: "left, top",
          }}
          onClick={handleClick}
          title="Swat it!"
        >
          <div style={{ transform: `rotate(${mosq.rotation}deg) scaleX(${mosq.flip ? -1 : 1})`, transition: "transform 0.12s linear" }}>
            <svg width="52" height="34" viewBox="0 0 52 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <ellipse cx="28" cy="17" rx="9" ry="4" fill="#3d3228" />
              <line x1="22" y1="17" x2="37" y2="17" stroke="#5e4e3e" strokeWidth="0.7" opacity="0.5" />
              <line x1="25" y1="14" x2="25" y2="20" stroke="#6e5e4e" strokeWidth="0.5" opacity="0.4" />
              <line x1="29" y1="13.5" x2="29" y2="20.5" stroke="#6e5e4e" strokeWidth="0.5" opacity="0.4" />
              <line x1="33" y1="14" x2="33" y2="20" stroke="#6e5e4e" strokeWidth="0.5" opacity="0.4" />
              <circle cx="19" cy="17" r="3.2" fill="#2c221a" />
              <circle cx="18" cy="16" r="1.2" fill="#dd2222" />
              <circle cx="17.5" cy="15.5" r="0.4" fill="#ff8888" opacity="0.8" />
              <line x1="16" y1="17" x2="4" y2="17.5" stroke="#1a100a" strokeWidth="0.9" strokeLinecap="round" />
              <path d="M18 14 Q15 9 17 5.5" stroke="#2c221a" strokeWidth="0.65" fill="none" strokeLinecap="round" />
              <path d="M20 14 Q19 9 22 6" stroke="#2c221a" strokeWidth="0.65" fill="none" strokeLinecap="round" />
              <line x1="23" y1="14" x2="19" y2="8" stroke="#2c221a" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="27" y1="13" x2="24" y2="7" stroke="#2c221a" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="31" y1="14" x2="30" y2="7.5" stroke="#2c221a" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="23" y1="20" x2="19" y2="26" stroke="#2c221a" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="27" y1="21" x2="24" y2="27" stroke="#2c221a" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="31" y1="20" x2="30" y2="26.5" stroke="#2c221a" strokeWidth="0.7" strokeLinecap="round" />
              <ellipse className="wing-top" cx="22" cy="10" rx="13" ry="5.5" fill="rgba(130,190,255,0.55)" stroke="rgba(90,150,230,0.4)" strokeWidth="0.5" />
              <ellipse className="wing-bot" cx="22" cy="24" rx="13" ry="5.5" fill="rgba(130,190,255,0.45)" stroke="rgba(90,150,230,0.35)" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      )}

      {/* Blood splat effect */}
      {(phase === "dying" || phase === "dead") && (
        <div
          className="absolute z-0 pointer-events-none select-none"
          style={{
            left: `${deadPos.x}%`,
            top: `${deadPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg
            width="100"
            height="100"
            viewBox="-50 -50 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={phase === "dead" ? "blood-smear" : ""}
          >
            {/* Center splat blob */}
            <ellipse cx="0" cy="0" rx="10" ry="8" fill="#8b0000" opacity="0.9" className="blood-drop" style={{ animationDelay: "0ms" }} />
            {/* Radiating drops */}
            {BLOOD_DROPS.map((d, i) => (
              <ellipse
                key={i}
                cx={d.dx}
                cy={d.dy}
                rx={d.rx}
                ry={d.ry}
                fill={i % 2 === 0 ? "#9b0000" : "#7a0000"}
                opacity="0.85"
                className="blood-drop"
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
            {/* Smaller satellite specks */}
            <circle cx="6"  cy="-22" r="2.5" fill="#b00000" opacity="0.7" className="blood-drop" style={{ animationDelay: "80ms" }} />
            <circle cx="-8" cy="22"  r="2"   fill="#b00000" opacity="0.7" className="blood-drop" style={{ animationDelay: "120ms" }} />
            <circle cx="22" cy="-6"  r="2"   fill="#b00000" opacity="0.6" className="blood-drop" style={{ animationDelay: "60ms" }} />
            <circle cx="-22" cy="6" r="2.5"  fill="#b00000" opacity="0.6" className="blood-drop" style={{ animationDelay: "100ms" }} />
            {/* Dead crushed mosquito body */}
            <ellipse cx="0" cy="0" rx="5" ry="2.5" fill="#1a1008" opacity="0.7" />
          </svg>
        </div>
      )}
    </>
  );
}
