export const cleanSportsUrl = (url: string): string => {
  if (!url) return url;
  return url
    .replace(/\{[^}]*\}\./g, '')  // Pattern 1: {state}.
    .replace(/[A-Za-z0-9]+\.\{[^}]*\}\./g, '');  // Pattern 2: sports.{state}.
}; 