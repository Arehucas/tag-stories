import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getInstagramUsername(userId: string, accessToken: string): Promise<string | null> {
  const url = `https://graph.instagram.com/${userId}?fields=username&access_token=${accessToken}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.username || null;
  } catch (e) {
    console.error('[IG] Error obteniendo username:', e);
    return null;
  }
}
