import { useEffect, useRef, useState } from "react";

/**
 * Hook réutilisable pour révéler des éléments au scroll.
 * Retourne une ref à attacher à l'élément et un booléen "visible".
 *
 * @param {object} options - options de l'IntersectionObserver
 * @param {boolean} once - si true, ne se déclenche qu'une fois
 */
export default function useScrollReveal({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}
