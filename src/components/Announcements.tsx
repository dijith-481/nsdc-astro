import React, { useState, useEffect } from "react";
import type { Announcement } from "../types";

interface AnnouncementsProps {
  announcements: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHovered && !isMobileOpen && announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered, isMobileOpen, announcements.length]);

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  const otherAnnouncements = announcements.filter(
    (a: Announcement) => a.id !== currentAnnouncement.id,
  );
  const isOpen = isHovered || isMobileOpen;

  const LinkIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      ></path>
    </svg>
  );

  return (
    <div
      className={`relative w-full   transition-all duration-500 ease-out  ${
        isMounted ? "opacity-100  " : "opacity-0  "
      }`}
    >
      <div className="flex w-full items-center gap-2">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden flex-shrink-0 w-8 h-8 bg-white/80 border border-gray-300 rounded-full flex items-center justify-center"
        >
          <svg
            className={`w-3 h-3 text-gray-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <a
          href={currentAnnouncement.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-1 min-w-0 max-w-full items-center gap-2 text-sm font-medium pl-3 pr-2 py-2 rounded-full border border-gray-300 bg-white/80  cursor-pointer transition-all duration-300 hover:border-gray-400 "
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="flex-grow w-full overflow-hidden h-auto">
            <span
              key={currentIndex}
              className={`${isOpen ? "whitespace-normal" : "  animate-slide-in"}`}
              style={{ animationDuration: isOpen ? "0s" : "500ms" }}
            >
              {currentAnnouncement.title}
            </span>
          </span>
          <div className="flex-shrink-0 w-5 h-5 bg-transparent rounded-full flex items-center justify-center transition-colors duration-300 text-gray-500 group-hover:bg-gray-800 group-hover:text-white">
            <LinkIcon />
          </div>
        </a>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen && otherAnnouncements.length > 0 ? `max-h-96 pt-2` : "max-h-0"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col gap-2 items-start md:pl-0">
          {otherAnnouncements.map((announcement) => (
            <a
              key={announcement.id}
              href={announcement.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium pl-3 pr-2 py-2 rounded-full border border-gray-300 bg-white/80  transition-all duration-300 hover:border-gray-400 "
            >
              <span className="flex-grow text-left whitespace-normal">
                {announcement.title}
              </span>
              <div className="flex-shrink-0 w-5 h-5 bg-transparent rounded-full flex items-center justify-center transition-colors duration-300 text-gray-500 group-hover:bg-gray-800 group-hover:text-white">
                <LinkIcon />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
