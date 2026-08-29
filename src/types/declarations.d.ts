declare module 'tailwind-merge' {
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
  export function extendTailwindMerge(config: unknown): (...classLists: (string | undefined | null | false)[]) => string;
}
