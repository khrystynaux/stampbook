import { openDB } from 'idb'

const DB_NAME = 'stampbook-photos'
const DB_VERSION = 1
const STORE = 'photos'

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE)
      },
    })
  }
  return dbPromise
}

export async function savePhoto(key, dataUrl) {
  const db = await getDB()
  await db.put(STORE, dataUrl, key)
}

export async function loadPhoto(key) {
  const db = await getDB()
  return (await db.get(STORE, key)) ?? null
}

export async function deletePhoto(key) {
  const db = await getDB()
  await db.delete(STORE, key)
}

export async function clearAllPhotos() {
  const db = await getDB()
  await db.clear(STORE)
}
