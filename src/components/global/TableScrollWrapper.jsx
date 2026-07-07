import React, { useState, useEffect, useRef } from "react";
  const TableScrollWrapper = ({ children, minWidth = "640px" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [thumbStyle, setThumbStyle] = useState({ width: "30%", left: "0%" });

  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const rafRef = useRef(null);

  // Recalculates the scrollbar thumb width and position
  const updateThumb = () => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    const ratio = el.clientWidth / el.scrollWidth;
    const thumbW = Math.max(ratio * 100, 8); // min 8% width
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollRatio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    const thumbLeft = scrollRatio * (100 - thumbW);

    thumb.style.width = `${thumbW}%`;
    thumb.style.left = `${thumbLeft}%`;

    if (el.scrollLeft > 10) {
      setIsScrolled(true);
    }
  };

  // Silky smooth scroll listener
  const handleScroll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateThumb);
  };

  // Drag handlers for the custom scrollbar thumb
  const handleThumbMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragStartScrollRef.current = scrollRef.current?.scrollLeft ?? 0;
    if (thumbRef.current) thumbRef.current.style.transition = "none";
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current || !scrollRef.current || !trackRef.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = clientX - dragStartXRef.current;
      const el = scrollRef.current;
      const trackW = trackRef.current.clientWidth;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const scrollDelta = (dx / trackW) * el.scrollWidth;

      el.scrollLeft = Math.max(0, Math.min(dragStartScrollRef.current + scrollDelta, maxScroll));
      updateThumb();
    };

    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (thumbRef.current) {
        thumbRef.current.style.transition = "left 0.12s ease, width 0.12s ease";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // Set up observers and listeners
  useEffect(() => {
    updateThumb();
    const el = scrollRef.current;
    if (!el) return;

    const obs = new ResizeObserver(() => requestAnimationFrame(updateThumb));
    obs.observe(el);

    return () => {
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [children]);

  // Track click to jump scroll
  const handleTrackClick = (e) => {
    if (!scrollRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    const el = scrollRef.current;
    const targetScroll = clickRatio * (el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  return (
    <div className="relative w-full flex-1">
      {/* Right-edge fade gradient on mobile */}
      {!isScrolled && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-14 z-10 sm:hidden"
          style={{
            background:
              "linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      )}

      {/* Bouncing Swipe hint badge on mobile */}
      {!isScrolled && (
        <div className="swipe-hint absolute right-2 top-1/2 z-20 sm:hidden">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white shadow-md bg-[#306BAC]">
            <span>Swipe</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      )}

      {/* Main scrollable area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto w-full table-scroll"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ minWidth }}>{children}</div>
      </div>

      {/* Custom Scrollbar track & thumb */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="sm:hidden mt-2.5 mx-0.5 h-1.5 rounded-full bg-gray-100 relative cursor-pointer"
      >
        <div
          ref={thumbRef}
          onMouseDown={handleThumbMouseDown}
          onTouchStart={handleThumbMouseDown}
          className="absolute top-0 h-full rounded-full bg-[#306BAC] cursor-grab active:cursor-grabbing"
          style={{
            width: "30%",
            left: "0%",
            transition: "left 0.12s ease, width 0.12s ease",
          }}
        />
      </div>
    </div>
  );
};

export default TableScrollWrapper;
