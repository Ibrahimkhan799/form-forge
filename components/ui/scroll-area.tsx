"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollMetrics {
  thumbHeight: number;
  thumbTop: number;
  scrollable: boolean;
}

export function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ startY: number; startScroll: number } | null>(null);
  const [metrics, setMetrics] = React.useState<ScrollMetrics>({
    thumbHeight: 36,
    thumbTop: 0,
    scrollable: false,
  });

  const updateMetrics = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { clientHeight, scrollHeight, scrollTop } = viewport;
    const scrollable = scrollHeight > clientHeight + 1;
    const thumbHeight = scrollable
      ? Math.max(36, (clientHeight / scrollHeight) * clientHeight)
      : clientHeight;
    const maxThumbTop = Math.max(0, clientHeight - thumbHeight);
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    setMetrics({
      thumbHeight,
      thumbTop: (scrollTop / maxScroll) * maxThumbTop,
      scrollable,
    });
  }, []);

  React.useEffect(() => {
    const frame = requestAnimationFrame(updateMetrics);
    const viewport = viewportRef.current;
    if (!viewport) return () => cancelAnimationFrame(frame);
    const observer = new ResizeObserver(updateMetrics);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateMetrics]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || !drag) return;
    const availableTrack = Math.max(1, viewport.clientHeight - metrics.thumbHeight);
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    viewport.scrollTop =
      drag.startScroll + ((event.clientY - drag.startY) / availableTrack) * maxScroll;
  }

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <div
        ref={viewportRef}
        onScroll={updateMetrics}
        className="scroll-area-viewport size-full overflow-x-hidden overflow-y-scroll"
      >
        {children}
      </div>
      <div
        className={cn(
          "absolute top-0 right-0 bottom-0 z-20 w-[14px] border-l border-[#C8C8C4] bg-[#E8E8E5] shadow-[-1px_0_2px_rgba(0,0,0,0.08)] dark:border-[#424242] dark:bg-[#111111]",
          !metrics.scrollable && "opacity-45"
        )}
        aria-hidden
      >
        <div
          onPointerDown={(event) => {
            const viewport = viewportRef.current;
            if (!viewport || !metrics.scrollable) return;
            dragRef.current = {
              startY: event.clientY,
              startScroll: viewport.scrollTop,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => {
            dragRef.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          className={cn(
            "absolute inset-x-[3px] rounded-full bg-[#5F6368] shadow-sm ring-1 ring-black/15 transition-colors hover:bg-[#34373B] dark:bg-[#F2F2F2] dark:ring-white/20 dark:hover:bg-white",
            metrics.scrollable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          )}
          style={{
            height: metrics.thumbHeight,
            transform: `translateY(${metrics.thumbTop}px)`,
          }}
        />
      </div>
    </div>
  );
}
