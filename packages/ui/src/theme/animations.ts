/**
 * Design System Animations
 * Variants Framer Motion pour la plateforme SSII IA
 */

import type { Variants, Transition } from 'framer-motion';

/**
 * Timing functions
 */
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring' as const, stiffness: 400, damping: 20 },
  springGentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
} as const;

/**
 * Durations
 */
export const durations = {
  fastest: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.4,
  slowest: 0.5,
} as const;

/**
 * Fade animations
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeOut: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 0 },
  exit: { opacity: 1 },
};

/**
 * Slide animations
 */
export const slideUp: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

export const slideDown: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export const slideLeft: Variants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

export const slideRight: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

/**
 * Scale animations
 */
export const scale: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const scaleUp: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
};

export const scaleDown: Variants = {
  initial: { scale: 1.1, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

/**
 * Rotate animations
 */
export const rotate: Variants = {
  initial: { rotate: -180, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
};

/**
 * Flip animations
 */
export const flipX: Variants = {
  initial: { rotateX: -90, opacity: 0 },
  animate: { rotateX: 0, opacity: 1 },
  exit: { rotateX: 90, opacity: 0 },
};

export const flipY: Variants = {
  initial: { rotateY: -90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 },
};

/**
 * Blur animations
 */
export const blurIn: Variants = {
  initial: { filter: 'blur(10px)', opacity: 0 },
  animate: { filter: 'blur(0px)', opacity: 1 },
  exit: { filter: 'blur(10px)', opacity: 0 },
};

/**
 * Collapse animations
 */
export const collapse: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

/**
 * Stagger animations
 */
export const stagger = (delayChildren: number = 0.1): Variants => ({
  animate: {
    transition: {
      staggerChildren: delayChildren,
    },
  },
});

export const staggerFadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerSlideUp: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Bounce animation
 */
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

/**
 * Pulse animation
 */
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

/**
 * Shake animation
 */
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

/**
 * Spin animation
 */
export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Shimmer effect (for loading states)
 */
export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Card hover effect
 */
export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
};

/**
 * Button press effect
 */
export const buttonPress: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
};

/**
 * Modal backdrop
 */
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Modal content
 */
export const modalContent: Variants = {
  initial: { scale: 0.9, opacity: 0, y: 20 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Drawer animations
 */
export const drawerLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const drawerRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const drawerTop: Variants = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
};

export const drawerBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

/**
 * List item animation
 */
export const listItem: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

/**
 * Page transitions
 */
export const pageTransition: Transition = {
  duration: 0.3,
  ease: easings.easeInOut,
};

export const pageSlideLeft: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: pageTransition },
  exit: { x: '-100%', opacity: 0, transition: pageTransition },
};

export const pageSlideRight: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: pageTransition },
  exit: { x: '100%', opacity: 0, transition: pageTransition },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: pageTransition },
  exit: { opacity: 0, transition: pageTransition },
};

/**
 * Utility function to create custom transitions
 */
export function createTransition(
  duration: number = durations.normal,
  ease: typeof easings[keyof typeof easings] = easings.easeInOut
): Transition {
  return {
    duration,
    ease: Array.isArray(ease) ? ease : undefined,
    ...(typeof ease === 'object' ? ease : {}),
  };
}

/**
 * Preset animation collections
 */
export const animations = {
  fade: { fadeIn, fadeOut },
  slide: { slideUp, slideDown, slideLeft, slideRight },
  scale: { scale, scaleUp, scaleDown },
  rotate: { rotate },
  flip: { flipX, flipY },
  blur: { blurIn },
  collapse,
  stagger: { stagger, staggerFadeIn, staggerSlideUp },
  loop: { bounce, pulse, shake, spin, shimmer },
  interaction: { cardHover, buttonPress },
  modal: { modalBackdrop, modalContent },
  drawer: { drawerLeft, drawerRight, drawerTop, drawerBottom },
  list: { listItem },
  page: { pageSlideLeft, pageSlideRight, pageFade },
} as const;
