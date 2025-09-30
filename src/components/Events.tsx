import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import type { Event } from "../types";
import ArchivedEventsScroller from "./ArchivedEventsScroller";

interface EventsProps {
  events: Event[];
  isPreview?: boolean;
}

const Events = forwardRef<HTMLDivElement, EventsProps>(
  ({ events, isPreview }, ref) => {
    const allEvents = useMemo(
      () =>
        [...events].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      [events],
    );

    const upcomingEvents = useMemo(
      () => allEvents.filter((e) => !e.isArchived),
      [allEvents],
    );
    const archivedEvents = useMemo(
      () => allEvents.filter((e) => e.isArchived),
      [allEvents],
    );

    const displaySections = useMemo(() => {
      const syntheticArchivedEvent: Event = {
        id: "past-events-section",
        title: "Past Events",
        date: "",
        desc: "",
        img: "",
        isArchived: true,
        relation: "",
        tags: [],
      };
      return archivedEvents.length > 0
        ? [...upcomingEvents, syntheticArchivedEvent]
        : upcomingEvents;
    }, [upcomingEvents, archivedEvents]);

    const [activeId, setActiveId] = useState<string>(allEvents[0]?.id || "");
    const [scrollToArchived, setScrollToArchived] = useState<string | null>(
      null,
    );
    const [pastEventsInView, setPastEventsInView] = useState(false);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const isClickScrolling = useRef(false);

    const handleArchivedEventChange = useCallback((eventId: string) => {
      setActiveId(eventId);
    }, []);
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (isClickScrolling.current) return;

          let mostVisibleEntry: IntersectionObserverEntry | null = null;
          for (const entry of entries) {
            if (
              !mostVisibleEntry ||
              entry.intersectionRatio > mostVisibleEntry.intersectionRatio
            ) {
              mostVisibleEntry = entry;
            }
          }

          if (mostVisibleEntry && mostVisibleEntry.intersectionRatio > 0) {
            const targetId = mostVisibleEntry.target.id;
            if (targetId === "past-events-section") {
              setPastEventsInView(true);
            } else {
              setPastEventsInView(false);
              setActiveId(targetId);
            }
          }
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.2, 0.4, 0.6, 0.8] },
      );

      const currentRefs = sectionRefs.current;
      Object.values(currentRefs).forEach((el) => {
        if (el) observer.observe(el);
      });

      return () => {
        Object.values(currentRefs).forEach((el) => {
          if (el) observer.unobserve(el);
        });
      };
    }, [displaySections]);

    const activeItem = allEvents.find((e) => e.id === activeId);
    const activeIndex = allEvents.findIndex((e) => e.id === activeId);

    const handleMenuClick = (item: Event) => {
      isClickScrolling.current = true;

      if (item.isArchived && isPreview) {
        const pastEventsSection = sectionRefs.current["past-events-section"];
        if (pastEventsSection) {
          const rect = pastEventsSection.getBoundingClientRect();
          const isAlreadyVisible =
            rect.top >= 0 && rect.bottom <= window.innerHeight;

          if (!isAlreadyVisible) {
            pastEventsSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            setTimeout(() => {
              setScrollToArchived(item.id);
              setTimeout(() => {
                isClickScrolling.current = false;
                setScrollToArchived(null);
              }, 1200);
            }, 600);
          } else {
            setScrollToArchived(item.id);
            setTimeout(() => {
              isClickScrolling.current = false;
              setScrollToArchived(null);
            }, 1200);
          }
        }
      } else {
        const targetSection = sectionRefs.current[item.id];
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            isClickScrolling.current = false;
          }, 1000);
        } else {
          isClickScrolling.current = false;
        }
      }
    };

    const mobileNavItems = () => {
      const start = Math.max(0, activeIndex - 1);
      const end = Math.min(allEvents.length, start + 4);
      return allEvents.slice(start, end);
    };

    return (
      <section ref={ref} className="bg-white">
        <div className="w-full px-4 py-16 lg:py-20">
          <div className="lg:hidden sticky top-12 bg-white/90 backdrop-blur-sm z-30 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="flex justify-between items-center border-b border-black/5 py-3">
              <div className="flex items-center gap-4 text-sm">
                {mobileNavItems().map((item) => {
                  const itemIndex = allEvents.findIndex(
                    (e) => e.id === item.id,
                  );
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`font-mono transition-colors duration-200 ${
                        activeId === item.id
                          ? "text-gray-900"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {String(itemIndex + 1).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
              <h3 className="font-semibold text-gray-800 truncate pl-4">
                {activeItem?.title}
              </h3>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-14">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  EVENTS
                </h1>
                <ul className="border-b border-black/5">
                  {allEvents.map((item, index) => (
                    <li
                      key={item.id}
                      className="border-t text-sm border-black/5"
                    >
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick(item);
                        }}
                        className={`block py-1 transition-colors duration-200 ${
                          activeId === item.id
                            ? "text-gray-900"
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-semibold">{item.title}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>

                {isPreview && (
                  <div className="mt-6">
                    <a
                      href="/events"
                      className="inline-block w-full text-center py-2 px-4 text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors"
                    >
                      View All Events
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-10 lg:mt-0">
              {displaySections.map((item) =>
                item.id === "past-events-section" ? (
                  isPreview ? (
                    <div
                      id={item.id}
                      key={item.id}
                      ref={(el) => {
                        sectionRefs.current[item.id] = el;
                      }}
                      className="min-h-[90vh] flex flex-col justify-center"
                    >
                      <ArchivedEventsScroller
                        events={archivedEvents}
                        onVisibleEventChange={handleArchivedEventChange}
                        scrollToEventId={scrollToArchived}
                        isVerticallyVisible={pastEventsInView}
                      />
                    </div>
                  ) : (
                    <h2 key={item.id} className="font-bold text-2xl">
                      Past Events
                    </h2>
                  )
                ) : (
                  <div
                    id={item.id}
                    key={item.id}
                    ref={(el) => {
                      sectionRefs.current[item.id] = el;
                    }}
                    className="min-h-[90vh] flex flex-col justify-center"
                  >
                    <MainEvent event={item} />
                  </div>
                ),
              )}
              {!isPreview &&
                archivedEvents.map((item) => (
                  <div
                    id={item.id}
                    key={item.id}
                    ref={(el) => {
                      sectionRefs.current[item.id] = el;
                    }}
                    className="min-h-[90vh] flex flex-col justify-center"
                  >
                    <MainEvent event={item} />
                  </div>
                ))}
            </div>
          </div>
        </div>
        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      </section>
    );
  },
);

const MainEvent = ({ event }: { event: Event }) => {
  return (
    <div
      key={event.id}
      className="w-full grid grid-cols-1 lg:grid-cols-10 gap-12 events-center"
    >
      <div className="lg:col-span-5">
        <div>
          <img
            src={event.img}
            alt={event.title}
            className="w-full h-auto object-cover aspect-square"
          />
        </div>
      </div>
      <div className="lg:col-span-4 h-full flex flex-col justify-between pb-4">
        <div>
          <h2 className="text-5xl lg:text-6xl leading-none   font-bold text-gray-900">
            {event.title}
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-2 mb-4">
            {event.date}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-gray-800 font-bold">{event.desc}</p>
          <a
            href={event.link || "#"}
            className="inline-block mt-4 py-2 px-5 font-medium bg-gray-800 text-white hover:bg-gray-900 transition-colors rounded-md"
          >
            {!event.isArchived ? "Register Now" : "View Event"}
          </a>
        </div>
      </div>
    </div>
  );
};

Events.displayName = "Events";

export default Events;
