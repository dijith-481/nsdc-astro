"use client";

import React, { useState, useEffect } from "react";

const Logo = () => (
  <img src="/logo.png" alt="NSDC Logo" className="h-8 w-auto" />
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMenuOpen &&
        !target.closest(".mobile-menu") &&
        !target.closest(".mobile-menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Events", href: "/events" },
    { name: "Projects", href: "/projects" },
    { name: "Reports", href: "/reports" },
    { name: "Resources", href: "/resources" },
    { name: "Team", href: "/teams" },
  ];

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-gray-200" : "border-b border-transparent"
      }`}
    >
      <div className="w-full h-full overflow-hidden">
        <div className="container mx-auto px-2 sm:px-4 z-70 flex justify-between items-center h-10 relative">
          <a href="/" className="flex items-center gap-1 cursor-pointer z-70">
            <div className="relative h-8 flex items-center transition-all duration-300">
              <span
                className={`transition-opacity duration-300 font-bold ${
                  scrolled ? "opacity-0" : "opacity-100"
                }`}
              >
                NSDC MEC
              </span>
              <div
                className={`absolute top-0 left-0 transition-opacity duration-300 ${
                  scrolled ? "opacity-100" : "opacity-0"
                }`}
              >
                <Logo />
              </div>
            </div>
          </a>

          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const isActive = true;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-button text-gray-600 hover:text-gray-900 focus:outline-none z-50 relative"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div
          className={` md:hidden absolute top-0 right-0 transition-all duration-300 z-40 ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div className="fixed  top-0 left-0 w-[90vw] h-screen overflow-hidden">
            <div className=" absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-bl from-white to-white/80 blur-2xl rounded-4xl" />
          </div>
          <nav className="relative flex flex-col items-end pt-10 pr-4 space-y-2">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-black font-medium  px-2 transition-all duration-500 ease-out ${
                  isMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-4"
                }`}
                style={{
                  transitionDelay: isMenuOpen
                    ? `${index * 100}ms`
                    : `${(navLinks.length - 1 - index) * 30}ms`,
                }}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
