import { useState, useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function HeaderWrapper({ children }: Props) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      if (currentY < 20) {
        setVisible(true);
      } else if (currentY < lastScrollY.current) {
        setVisible(true); // scrolling up
      } else if (currentY > lastScrollY.current + 5) {
        setVisible(false); // scrolling down (with threshold)
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        backgroundColor: scrolled ? 'var(--bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      {children}
    </header>
  );
}
