import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearAllPhotos } from '../utils/db'

function idHash(id) {
  let h = 0
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h
}

export function rotFromId(id) {
  return (idHash(id) % 13) - 6
}

export function tiltFromId(id) {
  return (idHash(id + 'tilt') % 7) - 3
}

// Rank thresholds match the original design exactly.
const RANKS = [
  { min: 0,  name: 'Day Tripper' },
  { min: 4,  name: 'Wanderer' },
  { min: 9,  name: 'Globetrotter' },
  { min: 15, name: 'Frequent Flyer' },
  { min: 21, name: 'Passport Legend' },
]

export function getRank(done) {
  let rank = RANKS[0]
  for (const r of RANKS) { if (done >= r.min) rank = r }
  const next = RANKS.find(r => r.min > done)
  const nextLine = next
    ? `${next.min - done} stamp${next.min - done === 1 ? '' : 's'} away from ${next.name}`
    : 'Every stamp collected — you legend.'
  return { name: rank.name, next: nextLine }
}

const useGameStore = create(
  persist(
    (set) => ({
      // ── Persistent ──────────────────────────────────────────
      travelerName: '',
      stamps: {},           // { [activityId]: { caption, date } }
      hasTravelerPhoto: false,
      userCities: [],       // user-built cities (AI-generated)

      // ── Transient ───────────────────────────────────────────
      screen: 'intro',      // 'intro' | 'home' | 'city'
      homeTab: 'cities',    // 'cities' | 'stamps' | 'scrapbook'
      cityTab: 'stamps',    // 'stamps' | 'scrapbook'
      activeCityId: null,
      menuOpen: false,
      modalActivityId: null,
      settingsScreen: null, // null | 'name' | 'reset'
      addCityModalOpen: false,

      // ── Actions ──────────────────────────────────────────────
      startApp: (name, firstCity) =>
        set({ travelerName: name.trim(), screen: 'home', homeTab: 'cities',
              userCities: firstCity ? [firstCity] : [] }),

      addCity: (city) => set(s => ({ userCities: [city, ...s.userCities] })),
      openAddCity:  () => set({ addCityModalOpen: true }),
      closeAddCity: () => set({ addCityModalOpen: false }),

      goHome: () =>
        set({ screen: 'home', activeCityId: null, menuOpen: false }),

      goCity: (cityId) =>
        set({ screen: 'city', activeCityId: cityId, cityTab: 'stamps', menuOpen: false }),

      setHomeTab: (tab) => set({ homeTab: tab }),
      setCityTab:  (tab) => set({ cityTab: tab }),

      toggleMenu:  () => set(s => ({ menuOpen: !s.menuOpen })),
      closeMenu:   () => set({ menuOpen: false }),

      openModal:   (id) => set({ modalActivityId: id }),
      closeModal:  ()   => set({ modalActivityId: null }),

      addStamp: (activityId, data) =>
        set(s => ({ stamps: { ...s.stamps, [activityId]: data } })),

      openSettings:  (screen) => set({ settingsScreen: screen, menuOpen: false }),
      closeSettings: ()       => set({ settingsScreen: null }),

      saveName: (name) => {
        if (name.trim()) set({ travelerName: name.trim(), settingsScreen: null })
      },

      // Matches original: clears stamps/photos but KEEPS the name, returns to home.
      confirmReset: async () => {
        await clearAllPhotos()
        set(s => ({
          stamps: {},
          hasTravelerPhoto: false,
          screen: 'home',
          homeTab: 'cities',
          activeCityId: null,
          menuOpen: false,
          modalActivityId: null,
          settingsScreen: null,
          // travelerName is intentionally preserved
        }))
      },

      setHasTravelerPhoto: (val) => set({ hasTravelerPhoto: val }),
    }),
    {
      name: 'stampbook-v1',
      partialize: s => ({
        travelerName:     s.travelerName,
        stamps:           s.stamps,
        hasTravelerPhoto: s.hasTravelerPhoto,
        userCities:       s.userCities,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.screen = (state.travelerName && state.userCities?.length > 0) ? 'home' : 'intro'
        }
      },
    }
  )
)

export default useGameStore
