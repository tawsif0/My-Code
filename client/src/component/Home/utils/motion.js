// Smaller offsets (mobile friendly) + fast in, smooth out

export const staggerContainer = (staggerChildren, delayChildren) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.9,
      delayChildren: delayChildren || 0
    }
  }
});

export const textVariant = (delay = 0) => ({
  hidden: {
    y: 24,
    opacity: 0,
    transition: { duration: 0.8 } // slow-ish hide
  },
  show: {
    y: 0,
    opacity: 1,
    transition: { delay, duration: 0.4, ease: [0.16, 0.77, 0.47, 0.97] } // fast in
  }
});

export const fadeIn = (
  direction = "up",
  type = "tween",
  delay = 0,
  duration = 0.4
) => ({
  hidden: {
    x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
    y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
    opacity: 0
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: type,
      delay: delay,
      duration: duration,
      ease: "easeOut"
    }
  }
});
