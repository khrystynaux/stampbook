import { useState, useEffect } from 'react'
import { loadPhoto } from '../utils/db'
import useGameStore from '../store/useGameStore'

export function useActivityPhoto(activityId) {
  const [url, setUrl] = useState(null)
  const isStamped = useGameStore(s => activityId ? !!s.stamps[activityId] : false)

  useEffect(() => {
    if (!activityId || !isStamped) {
      setUrl(null)
      return
    }
    loadPhoto(`activity-${activityId}`).then(u => setUrl(u ?? null))
  }, [activityId, isStamped])

  return url
}

export function useTravelerPhoto() {
  const [url, setUrl] = useState(null)
  const hasTravelerPhoto = useGameStore(s => s.hasTravelerPhoto)

  useEffect(() => {
    if (!hasTravelerPhoto) { setUrl(null); return }
    loadPhoto('traveler-photo').then(u => setUrl(u ?? null))
  }, [hasTravelerPhoto])

  return url
}
