import { createSignal, onMount, onCleanup, Show, createMemo } from "solid-js";
import type { HeroMainConfig, Event } from "../types";
import HeroEvent from "./HeroEvent";
import HeroAnimation from "./HeroAnimation";

interface Props {
  main: HeroMainConfig;
  events: Event[];
}

export default function HeroVisuals(props: Props) {
  const [now, setNow] = createSignal(new Date().getTime());

  onMount(() => {
    // Initial Sync
    setNow(new Date().getTime());
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);
    onCleanup(() => clearInterval(interval));
  });

  const activeEvent = createMemo(() => {
    const current = now();
    // Find the first event that is currently active for Hero display
    return props.events.find((e) => {
      const meta = e.metadata?.hero_config;
      if (!meta || !meta.show_in_hero) return false;

      const start = new Date(meta.start_date).getTime();
      const end = new Date(meta.end_date).getTime();

      // Default to 0 if undefined
      const before = (meta.before || 0) * 60 * 1000;
      const after = (meta.after || 0) * 60 * 1000;

      return current >= start - before && current <= end + after;
    });
  });

  // Derived values for Default Visuals
  const contentType = () => props.main?.type || "animation";
  const targetLink = () => props.main.link;
  const overlayText = () => props.main.desc;
  const buttonText = () => props.main.buttontext || "Learn More";

  return (
    <div class="w-full h-full relative">
      <Show
        when={activeEvent()}
        fallback={
          /* Default Visuals Render Logic */
          <>
            <Show when={contentType() === "img" && props.main.src}>
              <img
                src={props.main.src}
                alt="Hero visual"
                class="w-full h-full object-cover"
              />
            </Show>
            <Show when={contentType() === "video" && props.main.src}>
              <video
                src={props.main.src}
                class="w-full h-full object-cover"
                autoplay
                loop
                muted
                playsinline
              />
            </Show>
            <Show when={contentType() === "iframe" && props.main.src}>
              <iframe
                src={props.main.src}
                title="Hero External Content"
                class="w-full h-full border-0 bg-bg-1"
              />
            </Show>
            <Show when={contentType() === "animation"}>
              <HeroAnimation />
            </Show>

            {/* Overlay for Default Visuals */}
            <Show when={overlayText() || targetLink()}>
              <div class="absolute bottom-0 left-0 right-0 translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <div class="bg-bg-0/75 backdrop-blur-sm border-t border-bg-2 p-2 md:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                  <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <Show when={overlayText()}>
                      <p class="text-fg-0 text-sm md:text-base font-medium font-sans leading-snug">
                        {overlayText()}
                      </p>
                    </Show>

                    <Show when={targetLink()}>
                      <a
                        href={targetLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex-shrink-0 whitespace-nowrap px-6 py-2.5 bg-primary text-primary-fg font-bold font-sans text-sm shadow-sm hover:opacity-90 transition-opacity"
                      >
                        {buttonText()}
                      </a>
                    </Show>
                  </div>
                </div>
              </div>

              {/* Mobile Overlay (Always Visible) */}
              <div class="md:hidden absolute bottom-0 left-0 right-0 bg-bg-0/90 border-t border-bg-2 p-4">
                <div class="flex items-center justify-between gap-3">
                  <Show when={overlayText()}>
                    <p class="text-fg-0 text-xs font-medium truncate flex-1">
                      {overlayText()}
                    </p>
                  </Show>
                  <Show when={targetLink()}>
                    <a
                      href={targetLink()}
                      target="_blank"
                      class="text-xs font-bold text-primary underline decoration-2 underline-offset-4"
                    >
                      {buttonText()}
                    </a>
                  </Show>
                </div>
              </div>
            </Show>
          </>
        }
      >
        <HeroEvent event={activeEvent()!} />
      </Show>
    </div>
  );
}
