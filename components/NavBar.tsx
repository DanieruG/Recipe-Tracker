"use client";

import { useState } from "react";

interface NavBarProps {
  onNewRecipe?: () => void;
}

export default function NavBar({ onNewRecipe }: NavBarProps) {
  const [active, setActive] = useState("");
  const navElements = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Recipes", path: "/recipes" },
    { name: "Schedules", path: "/schedules" },
    { name: "Shopping List", path: "/shopping" },
  ];
  return (
    <header className="border-b bg-white border-zinc-200">
      <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white text-sm">
            🍓
          </div>
          <span className="text-lg font-semibold text-zinc-900 tracking-tight">
            Recipify
          </span>
        </div>
        <nav className="flex gap-10">
          {navElements.map((e) => (
            <a
              key={e.name}
              href={e.path}
              onClick={() => setActive(e.name)}
              className={`${active == e.name ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-black"} font-medium  px-2 py-2  hover:cursor-pointer rounded-md transition-all duration-100`}
            >
              {e.name}
            </a>
          ))}
        </nav>
        <button
          onClick={onNewRecipe}
          className="bg-zinc-950 text-white px-4 py-2 rounded-md hover:bg-zinc-700 hover:cursor-pointer font-medium"
        >
          + New Recipe
        </button>
      </div>
    </header>
  );
}
