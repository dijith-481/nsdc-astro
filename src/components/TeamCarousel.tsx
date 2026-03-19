import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import type { CarouselItem } from "../types";

interface TeamCarouselProps {
  items: CarouselItem[];
  title?: string;
  subtitle?: string;
}

export default function TeamCarousel(props: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [isPaused, setIsPaused] = createSignal(false);

  // Fallback to placeholder if no items
  const items = () =>
    props.items && props.items.length > 0
      ? [...props.items].sort((a, b) => a.priority - b.priority)
      : [{ type: "img", src: "/placeholder-team.jpg", priority: 0 } as CarouselItem];

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(!isPaused());
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items().length);
  };

  onMount(() => {
    if (items().length > 1) {
      const interval = setInterval(() => {
        if (!isPaused()) next();
      }, 7000);
      onCleanup(() => clearInterval(interval));
    }
  });

  return (
    <section class="py-16 lg:py-24 bg-bg-0">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="mb-12">
          <p class="text-sm font-bold font-mono tracking-[0.2em] text-fg-1 uppercase mb-2">
            {props.subtitle || "NSDC CORE"}
          </p>
          <h2 class="text-5xl lg:text-7xl font-sans font-bold text-fg-0 uppercase tracking-tighter">
            {props.title || "OUR TEAM"}
          </h2>
        </div>

        {/* Carousel Frame */}
        <div class="w-full max-w-5xl mx-auto relative aspect-[16/9] overflow-hidden rounded-sm bg-bg-1 shadow-sm border border-fg-0/5">
          <For each={items()}>
            {(item, index) => (
              <div
                class="absolute inset-0 w-full h-full will-change-[opacity,filter,transform]"
                style={{
                  // 2000ms transition for opacity and filter = very slow, smooth fade
                  transition:
                    "opacity 2000ms ease-in-out, filter 2000ms ease-in-out, transform 4000ms linear",

                  opacity: index() === currentIndex() ? 1 : 0,
                  filter:
                    index() === currentIndex()
                      ? "grayscale(0%) brightness(1)"
                      : "grayscale(100%) brightness(0.6)",
                  transform:
                    index() === currentIndex() ? "scale(1.05)" : "scale(1)",
                  "z-index": index() === currentIndex() ? 10 : 0,
                }}
              >
                <Show
                  when={item.type === "video"}
                  fallback={
                    <img
                      src={item.src}
                      alt={`Team ${index() + 1}`}
                      class="w-full h-full object-cover"
                    />
                  }
                >
                  <video
                    src={item.src}
                    class="w-full h-full object-cover"
                    autoplay
                    loop
                    muted
                    playsinline
                  />
                </Show>

                {/* Overlay for text readability / aesthetics */}
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            )}
          </For>

          {/* Navigation Dots */}
          {items().length > 1 && (
            <div class="absolute bottom-6 left-6 flex gap-3 z-20 items-end">
              <For each={items()}>
                {(_, i) => {
                  const isActive = () => i() === currentIndex();
                  const showPause = () => isPaused() && isActive();

                  return (
                    <button
                      onClick={() => goTo(i())}
                      aria-label={`${isPaused() ? "Play" : "Pause"} slide ${i() + 1}`}
                      class={`cursor-pointer transition-all duration-500 ease-out rounded-full flex items-center justify-center overflow-hidden ${
                        showPause() ? "h-6 w-12 bg-primary text-primary-fg" : "h-1.5"
                      }`}
                      style={{
                        width: showPause() ? "3rem" : isActive() ? "3rem" : "0.75rem",
                        "background-color": isActive()
                          ? isPaused()
                            ? "var(--primary, #fff)"
                            : "var(--fg-0, #fff)"
                          : "rgba(255,255,255,0.2)",
                      }}
                    >
                      <Show when={showPause()}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="animate-in fade-in zoom-in duration-300"
                        >
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      </Show>
                    </button>
                  );
                }}
              </For>
            </div>
          )}
        </div>

        <div class="mt-8 text-center">
          <a
            href="/teams"
            class="inline-block py-4 px-10 text-xs font-bold font-mono tracking-widest uppercase bg-fg-0 text-bg-0 hover:bg-primary transition-colors duration-200"
          >
            Explore Members
          </a>
        </div>
      </div>
    </section>
  );
}
