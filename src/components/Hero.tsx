import { forwardRef, useState, useEffect } from "react";
import type { Announcement, HeroContent } from "../types";
import Announcements from "./Announcements";

interface HeroProps {
  content: HeroContent;
  announcements: Announcement[];
}

const MediaOverlay = ({
  desc,
  href,
  buttonText,
}: {
  desc?: string;
  href?: string;
  buttonText?: string;
}) => {
  if (!desc && !href) {
    return null;
  }
  const buttonContent = buttonText || "Learn More";
  return (
    <>
      <div className="hidden md:flex absolute inset-0 items-end  opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <div className="w-full p-6 text-white bg-gradient-to-t blur-2xl from-black/45 via-black/25 to-transparent flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {desc && <p className="text-lg truncate">{desc}</p>}
          </div>
          <div className="flex-shrink-0">
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-black font-semibold py-2 px-5 rounded-md  transition-opacity duration-300 hover:opacity-80"
              >
                {buttonContent}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="block md:hidden absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {desc && (
              <p className="text-white text-sm font-light truncate">{desc}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-black text-xs font-semibold py-1.5 px-3 rounded "
              >
                {buttonContent}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MediaContent = ({
  content,
  isLoaded,
}: {
  content: HeroContent;
  isLoaded: boolean;
}) => {
  const renderDynamicContent = () => {
    switch (content.type) {
      case "image":
        return (
          <img
            src={content.src}
            alt="NSDC MEC Hero Content"
            className="w-full h-full object-cover"
          />
        );
      case "video":
        return (
          <video
            src={content.src}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        );
      case "url":
        return (
          <iframe
            src={content.src}
            title="NSDC MEC External Content"
            className="w-full h-full border-0 bg-white"
            allowFullScreen
          />
        );
      default:
        return null;
    }
  };

  const overlayHref = content.type === "url" ? content.src : content.href;

  return (
    <div className="group relative w-full h-full bg-gray-100 overflow-hidden">
      <img
        width={1000}
        height={1000}
        src="/bigdata.jpg"
        alt="NSDC MEC Placeholder"
        className="w-full h-full object-cover"
      />

      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {renderDynamicContent()}
      </div>

      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <MediaOverlay
          href={overlayHref}
          desc={content.desc}
          buttonText={content.buttonText}
        />
      </div>
    </div>
  );
};

const Hero = forwardRef<HTMLDivElement, HeroProps>(
  ({ content, announcements }, ref) => {
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsMediaLoaded(true), 1000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <section ref={ref} className="bg-[#FAF9F6]">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 items-stretch min-h-[calc(100vh-80px)]">
          <div className="md:col-span-1 flex flex-col p-8 justify-between h-full min-h-[400px] md:min-h-0">
            <div>
              <div className="mb-6">
                <Announcements announcements={announcements} />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-gray-900 ">
                National Students Data Corps
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mt-1">
                MEC Chapter
              </p>
            </div>
            <p className="text-lg text-gray-600 max-w-xl mt-8 md:mt-0">
              MEC Institutional Chapter: Bridging the gap between curriculum and
              industry demand in data-centric careers.
            </p>
          </div>
          <div className="md:col-span-2 w-full h-[350px] md:h-full">
            <MediaContent content={content} isLoaded={isMediaLoaded} />
          </div>
        </div>
      </section>
    );
  },
);

Hero.displayName = "Hero";

export default Hero;
