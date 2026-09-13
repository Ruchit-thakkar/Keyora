import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let clipboardClearTimer: NodeJS.Timeout | null = null;

export async function copyToClipboard(
  text: string,
  autoWipeSeconds = 45
): Promise<boolean> {
  if (!navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);

    // Cancel any existing clear timeout
    if (clipboardClearTimer) {
      clearTimeout(clipboardClearTimer);
      clipboardClearTimer = null;
    }

    // Schedule auto-wipe if requested
    if (autoWipeSeconds > 0) {
      clipboardClearTimer = setTimeout(async () => {
        try {
          const currentText = await navigator.clipboard.readText();
          if (currentText === text) {
            await navigator.clipboard.writeText("");
          }
        } catch {
          // Silent catch if clipboard permission is restricted
        }
      }, autoWipeSeconds * 1000);
    }

    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getDomain(url?: string): string {
  if (!url) return "";
  try {
    const formatted = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
