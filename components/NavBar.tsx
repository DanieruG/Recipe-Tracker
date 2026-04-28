"use client";

import { useState } from "react";

interface NavBarProps {
  onNewRecipe?: () => void;
  current?: string;
}

export default function NavBar({ onNewRecipe, current }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navElements = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Recipes", path: "/recipes" },
    { name: "Schedules", path: "/schedules" },
    { name: "Shopping List", path: "/shopping" },
  ];

  const linkClass = (name: string) =>
    `${current === name ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-black"} font-medium px-2 py-2 rounded-md transition-all duration-100`;

  return (
    <header className="border-b bg-white border-zinc-200">
      <div className="w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white text-sm">
            🍓
          </div>
          <span className="text-lg font-semibold text-zinc-900 tracking-tight">
            Recipify
          </span>
        </div>

        <nav className="hidden md:flex gap-4 lg:gap-8">
          {navElements.map((e) => (
            <a key={e.name} href={e.path} className={linkClass(e.name)}>
              {e.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={onNewRecipe}
            className="bg-zinc-950 text-white px-4 py-2 rounded-md hover:bg-zinc-700 hover:cursor-pointer font-medium"
          >
            + New Recipe
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden text-zinc-700 border border-zinc-300 rounded-md px-3 py-2 text-sm"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 border-t border-zinc-200">
          {navElements.map((e) => (
            <a
              key={e.name}
              href={e.path}
              className={`${linkClass(e.name)} block text-center`}
              onClick={() => setIsMenuOpen(false)}
            >
              {e.name}
            </a>
          ))}

          {onNewRecipe && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onNewRecipe();
              }}
              className="w-full bg-zinc-950 text-white px-4 py-2 rounded-md hover:bg-zinc-700 font-medium"
            >
              + New Recipe
            </button>
          )}
        </div>
      )}
    </header>
  );
}
