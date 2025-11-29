import { createSignal, onMount, onCleanup, For } from "solid-js";
import type { Announcement } from "../types";

interface Props {
  announcements: Announcement[];
}

const CONFIG = {
  rotationSpeed: 5000,
  animDuration: 500,
  pixelsPerSecond: 30,
};

export default function AnnouncementRotator(props: Props) {
  if (!props.announcements || props.announcements.length === 0) return null;

  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [expanded, setExpanded] = createSignal(false);
  const [textOpacity, setTextOpacity] = createSignal(1);

  let widgetRef: HTMLDivElement | undefined;
  let pillRef: HTMLButtonElement | undefined;
  let textDynamicRef: HTMLSpanElement | undefined;
  let textStaticRef: HTMLSpanElement | undefined;
  let arrowRef: SVGSVGElement | undefined;
  let intervalId: number | undefined;

  const handleTextScroll = (
    container: HTMLElement | undefined,
    textEl: HTMLElement | undefined,
    shouldScroll: boolean,
  ) => {
    if (!textEl || !container) return;

    if (shouldScroll) {
      const mask = textEl.parentElement;
      if (!mask) return;
      const maskWidth = mask.clientWidth;
      const textWidth = textEl.scrollWidth;

      if (textWidth > maskWidth) {
        const distanceToMove = textWidth - maskWidth + 20;
        const duration = distanceToMove / CONFIG.pixelsPerSecond;
        textEl.style.transition = `transform ${Math.max(duration, 0.5)}s linear`;
        textEl.style.transform = `translateX(-${distanceToMove}px)`;
      }
    } else {
      textEl.style.transition = "transform 0.3s ease-out";
      textEl.style.transform = "translateX(0)";
    }
  };

  const updateText = () => {
    setTextOpacity(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % props.announcements.length);
      if (textDynamicRef) {
        textDynamicRef.style.transition = "none";
        textDynamicRef.style.transform = "translateX(0)";
        setTimeout(() => {
          if (textDynamicRef) {
            textDynamicRef.style.transition = "opacity 0.5s ease-out";
          }
          setTextOpacity(1);
        }, 50);
      }
    }, 300);
  };

  const rotate = () => {
    if (expanded()) return;
    updateText();
  };

  const startTimer = () => {
    if (props.announcements.length > 1 && !intervalId) {
      intervalId = window.setInterval(rotate, CONFIG.rotationSpeed);
    }
  };

  const toggleExpanded = (open: boolean) => {
    setExpanded(open);
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    if (!open) {
      startTimer();
    }
  };

  onMount(() => {
    startTimer();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        expanded() &&
        window.matchMedia("(max-width: 767px)").matches &&
        widgetRef &&
        !widgetRef.contains(e.target as Node)
      ) {
        toggleExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    onCleanup(() => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("click", handleClickOutside);
    });
  });

  return (
    <>
      <div class="w-full max-w-full mb-6 md:mb-8 relative z-30">
        <div
          ref={widgetRef}
          class="relative flex flex-col items-start"
          onMouseEnter={() => {
            if (window.matchMedia("(min-width: 768px)").matches)
              toggleExpanded(true);
          }}
          onMouseLeave={() => {
            if (window.matchMedia("(min-width: 768px)").matches)
              toggleExpanded(false);
          }}
        >
          <button
            ref={pillRef}
            class="relative z-20 inline-flex items-center justify-between pl-4 pr-10 py-2 rounded-full border border-bg-2 bg-bg-1 shadow-sm cursor-pointer text-left group transition-all duration-300 animate-glow max-w-full overflow-hidden"
            onClick={() => {
              if (window.matchMedia("(max-width: 767px)").matches)
                toggleExpanded(!expanded());
            }}
            onMouseEnter={() => {
              if (!expanded()) handleTextScroll(pillRef, textDynamicRef, true);
            }}
            onMouseLeave={() => {
              handleTextScroll(pillRef, textDynamicRef, false);
            }}
          >
            <div class="relative rounded-full px-2 overflow-hidden w-full mr-2">
              <div class="grid grid-cols-1 grid-rows-1 items-center">
                <span
                  ref={textDynamicRef}
                  class="scrolling-text col-start-1 row-start-1 block whitespace-nowrap text-xs md:text-sm font-medium font-sans text-fg-0 transition-opacity duration-500 ease-out"
                  style={{
                    opacity: textOpacity(),
                    visibility: expanded() ? "hidden" : "visible",
                  }}
                >
                  {props.announcements[currentIndex()].title}
                </span>

                <span
                  ref={textStaticRef}
                  class="col-start-1 row-start-1 block whitespace-nowrap text-xs md:text-sm font-bold font-sans text-primary transition-opacity duration-300 ease-out pointer-events-none"
                  style={{ visibility: expanded() ? "visible" : "hidden" }}
                  aria-hidden="true"
                >
                  Announcements
                </span>
              </div>
            </div>

            <div class="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-bg-0/10 backdrop-blur-sm   text-fg-0 z-20">
              <svg
                ref={arrowRef}
                class="w-4 h-4 transition-transform duration-300"
                style={{
                  transform: expanded() ? "rotate(90deg)" : "rotate(0deg)",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </button>

          <div
            class="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] w-full"
            style={{ "grid-template-rows": expanded() ? "1fr" : "0fr" }}
          >
            <div class="overflow-hidden">
              <div
                class="pt-3 flex flex-col gap-2 items-start pl-4 transition-opacity duration-300 delay-75 w-full max-w-md"
                style={{ opacity: expanded() ? 1 : 0 }}
                onMouseOver={(e) => {
                  const link = (e.target as HTMLElement).closest(
                    ".group\\/item",
                  );
                  if (link) {
                    const span = link.querySelector(
                      ".scrolling-text",
                    ) as HTMLElement;
                    handleTextScroll(link as HTMLElement, span, true);
                  }
                }}
                onMouseOut={(e) => {
                  const link = (e.target as HTMLElement).closest(
                    ".group\\/item",
                  );
                  if (link) {
                    const span = link.querySelector(
                      ".scrolling-text",
                    ) as HTMLElement;
                    handleTextScroll(link as HTMLElement, span, false);
                  }
                }}
              >
                <For each={props.announcements}>
                  {(item) => (
                    <a
                      href={item.link || "#"}
                      target="_blank"
                      class="group/item relative inline-flex items-center pl-5 pr-12 py-2 rounded-full border border-bg-2 bg-bg-1/95 backdrop-blur-sm hover:border-fg-1 hover:bg-bg-1 text-xs md:text-sm font-medium font-sans text-fg-0 transition-all duration-200 shadow-sm max-w-full w-fit overflow-hidden"
                    >
                      <div class="relative rounded-full px-2 overflow-hidden max-w-[250px] sm:max-w-[300px]">
                        <span class="scrolling-text block whitespace-nowrap">
                          {item.title}
                        </span>
                      </div>

                      <div class="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-bg-0/10 backdrop-blur-sm text-fg-1 group-hover/item:text-primary group-hover/item:bg-primary/10 transition-all group-hover/item:-rotate-45">
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </div>
                    </a>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% {
            border-color: var(--bg-2);
            box-shadow: 0 0 0 0 rgba(var(--primary), 0);
          }
          50% {
            border-color: var(--primary);
            box-shadow: 0 0 12px -2px var(--color-bg-2);
          }
        }
        .animate-glow {
          animation: glow 3s infinite ease-in-out;
        }
        .animate-glow:hover,
        .animate-glow:focus-within {
          animation: none;
          border-color: var(--fg-1);
        }
      `}</style>
    </>
  );
}
