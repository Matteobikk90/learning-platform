import type { FaqContent } from "@/types/home";

export function FaqItem({ question, answer }: FaqContent) {
  return (
    <details className="group border-t border-stroke py-6">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-base font-medium leading-relaxed text-white">{question}</span>
        <span className="shrink-0 text-xl leading-6 text-white group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <p className="pt-4 pr-10 text-sm leading-relaxed text-white sm:text-base">
        {answer}
      </p>
    </details>
  );
}
