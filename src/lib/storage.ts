export type Theme = 'light' | 'dark' | 'system'
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'all'

export interface Settings {
  theme: Theme
  defaultLevel: Level
}

export interface CharStat {
  attempts: number
  errors: number
  lastSeen: number
}

export interface Session {
  type: 'character' | 'article'
  cpm: number
  accuracy: number
  durationMs: number
  questionCount: number
  ts: number
}

const KEY_SETTINGS = 'newcj.settings'
const KEY_CHAR_STATS = 'newcj.charStats'
const KEY_SESSIONS = 'newcj.sessions'
const SESSIONS_MAX = 50

export const DEFAULT_SETTINGS: Settings = { theme: 'system', defaultLevel: 'beginner' }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEY_SETTINGS, {}) }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings))
}

export function getCharStats(char: string): CharStat {
  const all = readJSON<Record<string, CharStat>>(KEY_CHAR_STATS, {})
  return all[char] ?? { attempts: 0, errors: 0, lastSeen: 0 }
}

export function recordCharAttempt(char: string, correct: boolean): void {
  const all = readJSON<Record<string, CharStat>>(KEY_CHAR_STATS, {})
  const cur = all[char] ?? { attempts: 0, errors: 0, lastSeen: 0 }
  all[char] = {
    attempts: cur.attempts + 1,
    errors: cur.errors + (correct ? 0 : 1),
    lastSeen: Date.now(),
  }
  localStorage.setItem(KEY_CHAR_STATS, JSON.stringify(all))
}

export function loadAllCharStats(): Record<string, CharStat> {
  return readJSON<Record<string, CharStat>>(KEY_CHAR_STATS, {})
}

export function loadSessions(): Session[] {
  return readJSON<Session[]>(KEY_SESSIONS, [])
}

export function appendSession(session: Session): void {
  const list = loadSessions()
  list.push(session)
  while (list.length > SESSIONS_MAX) list.shift()
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(list))
}

export function clearAll(): void {
  localStorage.removeItem(KEY_SETTINGS)
  localStorage.removeItem(KEY_CHAR_STATS)
  localStorage.removeItem(KEY_SESSIONS)
}
