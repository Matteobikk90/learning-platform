"use client";

import { useId, useState } from "react";

export function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border-t border-stroke">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}>
        <span className="text-sm font-medium text-navy">{question}</span>
        <span
          className={`text-petrol shrink-0 text-lg leading-none transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden="true">
          +
        </span>
      </button>

      {open && (
        <p id={contentId} className="text-sm text-muted leading-[1.9] pb-4">
          {answer}
        </p>
      )}
    </div>
  );
}
