"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};

export const FloatingParticle = ({ delay, seed }: { delay: number; seed: number }) => {
  const [pos, setPos] = useState<{
    x: number;
    y: number;
    repeatDelay: number;
  } | null>(null);

  useEffect(() => {
    setPos({
      x: seededRandom(seed + 1) * 100,
      y: seededRandom(seed + 2) * 100,
      repeatDelay: seededRandom(seed + 3) * 2,
    });
  }, [seed]);

  if (!pos) return null;

  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-emerald-400/60"
      initial={{ opacity: 0 }}
      animate={{
        x: pos.x,
        y: [pos.y, pos.y - 20, pos.y],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: pos.repeatDelay,
      }}
    />
  );
};
