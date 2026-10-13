/**
 * localStorage-based storage for TwistForge AI.
 * 
 * NOTE: This is a client-side only implementation for demonstration purposes.
 * In production, use Supabase or a proper backend with authentication.
 * 
 * Storage key format: "twistforge:<type>" where type is "user:<email>", "stories", "favorites", etc.
 */

const STORAGE_PREFIX = "twistforge:";

export interface Story {
  id: string;
  title: string;
  premise: string;
  genre: string;
  tone: string;
  twist_type: string;
  story_content: {
    title: string;
    genre: string;
    premise: string;
    characters: string[];
    setup: string;
    risingAction: string;
    plotTwist: string;
    climax: string;
    ending: string;
    foreshadowing: string[];
    twistExplanation: string;
    alternativeTwists: string[];
  };
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  email: string;
  displayName: string;
  loggedIn: boolean;
}

/**
 * Save a value to localStorage
 */
function setStorage(key: string, value: any): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage set error:", e);
  }
}

/**
 * Get a value from localStorage
 */
function getStorage(key: string): any {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("localStorage get error:", e);
    return null;
  }
}

/**
 * Remove a value from localStorage
 */
function removeStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (e) {
    console.error("localStorage remove error:", e);
  }
}

/**
 * Clear all TwistForge data from localStorage
 */
export function clearAllData(): void {
  // Clear all keys that start with the prefix
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

/** =========================================================================
 * Authentication
 * ========================================================================= */

/** Check if user is logged in and get session data */
export function getSession(): UserSession | null {
  const session = getStorage("session");
  if (!session) return null;
  // Validate session isn't too old (optional: set expiry)
  return {
    id: session.id,
    email: session.email,
    displayName: session.displayName,
    loggedIn: true,
  };
}

/** Login with email (simple demo auth) */
export function login(email: string, displayName?: string): UserSession {
  const session: UserSession = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email,
    displayName: displayName || email.split("@")[0],
    loggedIn: true,
  };
  setStorage("session", session);
  return session;
}

/** Logout */
export function logout(): void {
  clearAllData();
}

/** =========================================================================
 * Stories
 * ========================================================================= */

export function getStories(): Story[] {
  return getStorage("stories") || [];
}

export function saveStory(story: Omit<Story, "id" | "created_at" | "updated_at">): Story {
  const stories = getStories();
  const newStory: Story = {
    id: `story_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...story,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  stories.unshift(newStory); // Add to beginning
  setStorage("stories", stories);
  return newStory;
}

export function updateStory(id: string, updates: Partial<Story>): Story | null {
  const stories = getStories();
  const idx = stories.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  
  stories[idx] = { ...stories[idx], ...updates, updated_at: new Date().toISOString() };
  setStorage("stories", stories);
  return stories[idx];
}

export function deleteStory(id: string): boolean {
  const stories = getStories().filter((s) => s.id !== id);
  setStorage("stories", stories);
  // Also remove from favorites if present
  const favorites = getFavorites().filter((id: string) => id !== id);
  setFavorites(favorites);
  return true;
}

export function toggleFavorite(id: string): { storyId: string; wasFavorite: boolean; nowFavorite: boolean } {
  const stories = getStories();
  const storyIdx = stories.findIndex((s) => s.id === id);
  if (storyIdx === -1) {
    return { storyId: id, wasFavorite: false, nowFavorite: false };
  }
  
  const wasFavorite = stories[storyIdx].is_favorite;
  stories[storyIdx].is_favorite = !wasFavorite;
  stories[storyIdx].updated_at = new Date().toISOString();
  setStorage("stories", stories);
  
  // Also update in favorites array
  const favorites = getFavorites();
  if (wasFavorite) {
    // Remove from favorites
    const filtered = favorites.filter((fid: string) => fid !== id);
    setFavorites(filtered);
  } else {
    // Add to favorites
    favorites.push(id);
    setFavorites(favorites);
  }
  
  return { storyId: id, wasFavorite, nowFavorite: !wasFavorite };
}

export function getFavoriteStories(): Story[] {
  const allStories = getStories();
  const favoriteIds = getFavorites();
  return allStories.filter((s) => favoriteIds.includes(s.id));
}

/** =========================================================================
 * Favorites
 * ========================================================================= */

export function getFavorites(): string[] {
  return getStorage("favorites") || [];
}

export function setFavorites(ids: string[]): void {
  setStorage("favorites", ids);
}

/** =========================================================================
 * Templates
 * ========================================================================= */

export const TEMPLATES = [
  { slug: "perfect-alibi", title: "The Perfect Alibi", idea: "A detective proves the suspect was across town at the time of the murder — with photo evidence.", genre: "Mystery", twistType: "False Victory", tone: "Suspenseful", setting: "A rain-soaked coastal town", mainCharacter: "Detective Mara Venn" },
  { slug: "stranger-knows", title: "The Stranger Who Knows Everything", idea: "A stranger on a train recites details of your life you never told anyone.", genre: "Psychological", twistType: "Hidden Connection", tone: "Mysterious", setting: "An overnight train", mainCharacter: "A traveling journalist" },
  { slug: "last-person", title: "The Last Person on Earth", idea: "The last person on Earth hears a knock on the door.", genre: "Sci-Fi", twistType: "Reality Reversal", tone: "Dark", setting: "An empty city", mainCharacter: "A radio operator" },
  { slug: "missing-hour", title: "The Missing Hour", idea: "Every clock in town skips 2:00–3:00 AM, and nobody remembers why.", genre: "Thriller", twistType: "Time Loop", tone: "Suspenseful", setting: "A small mountain town", mainCharacter: "A night-shift nurse" },
  { slug: "betrayal-friend", title: "The Betrayal of a Best Friend", idea: "Two best friends win a life-changing prize together, but only one ticket exists.", genre: "Drama", twistType: "Betrayal", tone: "Emotional", setting: "A college dorm", mainCharacter: "Two childhood friends" },
  { slug: "letter-future", title: "The Letter From the Future", idea: "You receive a letter in your own handwriting dated ten years from now, warning you not to open it.", genre: "Sci-Fi", twistType: "Time Loop", tone: "Mysterious", setting: "A family home attic", mainCharacter: "A college student" },
  { slug: "dream-real", title: "The Dream That Was Real", idea: "A lucid dreamer wakes up with physical proof from the dream world.", genre: "Fantasy", twistType: "Reality Reversal", tone: "Mysterious", setting: "A sleep clinic", mainCharacter: "An insomniac artist" },
  { slug: "hero-villain", title: "The Hero Was the Villain", idea: "A celebrated rescue hero is honored at a parade — until a child recognizes him from somewhere else.", genre: "Thriller", twistType: "Unexpected Villain", tone: "Dark", setting: "A city parade", mainCharacter: "A decorated firefighter" },
  { slug: "town-never-existed", title: "The Town That Never Existed", idea: "A traveler returns to her hometown, but no map shows it and no one has heard of it.", genre: "Mystery", twistType: "Unreliable Narrator", tone: "Suspenseful", setting: "A highway motel", mainCharacter: "A traveling photographer" },
  { slug: "final-message", title: "The Final Message", idea: "A voicemail from a grandmother arrives three days after her funeral.", genre: "Horror", twistType: "Secret Identity", tone: "Dark", setting: "An old apartment", mainCharacter: "A grieving granddaughter" },
] as const;

/** =========================================================================
 * Validation (lightweight, client-side only)
 * ========================================================================= */

export const GENRES = ["Fantasy","Horror","Mystery","Thriller","Romance","Sci-Fi","Comedy","Drama","Adventure","Psychological","Custom"] as const;
export const LENGTHS = ["Flash Fiction","Short","Medium","Long"] as const;
export const TONES = ["Dark","Emotional","Funny","Suspenseful","Wholesome","Mysterious","Inspirational"] as const;
export const AUDIENCES = ["Children","Teens","Adults"] as const;
export const TWIST_TYPES = ["Secret Identity","Betrayal","Unreliable Narrator","Hidden Connection","False Victory","Time Loop","Red Herring","Unexpected Villain","Reality Reversal","Random"] as const;
export const INTENSITIES = ["Mild","Surprising","Mind-Blowing"] as const;
export const ENDINGS = ["Happy","Tragic","Ambiguous","Bittersweet","Shocking"] as const;
export const ACTIONS = ["complete","twist-ideas","rewrite-ending","intensify","foreshadowing","alternative-ending","fix-logic","continue"] as const;