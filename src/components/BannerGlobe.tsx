import { Globe } from "@/components/magicui/globe";

export function GlobeDemo() {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-10 pb-40 pt-20">
      <span className="w-full pointer-events-none  bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-3xl font-black leading-none text-transparent dark:from-white dark:to-slate-900/10">
        KOOMPI OS 2025
      </span>
      <Globe className="top-28" />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  );
}
