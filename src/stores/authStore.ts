import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { get, set, update } from 'firebase/database'
import { defineStore } from 'pinia'
import { auth, isFirebaseConfigured, userRef } from '@/services/firebase'
import type { UserProfile } from '@/types/common'

let authInitializationPromise: Promise<void> | null = null
const googleProvider = new GoogleAuthProvider()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    initialized: false,
    loading: false,
    error: '',
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
    displayName: (state) => state.profile?.displayName || state.user?.email || '使用者',
  },
  actions: {
    async initialize() {
      if (this.initialized) return
      if (authInitializationPromise) return authInitializationPromise

      authInitializationPromise = new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user
          if (user) {
            this.profile = await this.fetchProfile(user.uid)
          } else {
            this.profile = null
          }
          this.initialized = true
          resolve()
        })
      })

      await setPersistence(auth, browserLocalPersistence)
      return authInitializationPromise
    },
    async fetchProfile(uid: string) {
      const snapshot = await get(userRef(uid, 'profile'))
      return snapshot.exists() ? (snapshot.val() as UserProfile) : null
    },
    async ensureProfile(user: User, displayName?: string) {
      const now = Date.now()
      const snapshot = await get(userRef(user.uid, 'profile'))
      const payload: UserProfile = {
        email: user.email ?? '',
        displayName: displayName || user.displayName || user.email?.split('@')[0] || '車主',
        createdAt: snapshot.exists() ? snapshot.val().createdAt : now,
        updatedAt: now,
      }

      if (snapshot.exists()) {
        await update(userRef(user.uid, 'profile'), payload)
      } else {
        await set(userRef(user.uid, 'profile'), payload)
      }

      this.profile = payload
    },
    async register(email: string, password: string, displayName: string) {
      this.loading = true
      this.error = ''
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() })
        }
        await this.ensureProfile(credential.user, displayName.trim())
      } catch (error) {
        this.error = error instanceof Error ? error.message : '註冊失敗'
        throw error
      } finally {
        this.loading = false
      }
    },
    async login(email: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        await this.ensureProfile(credential.user)
      } catch (error) {
        this.error = error instanceof Error ? error.message : '登入失敗'
        throw error
      } finally {
        this.loading = false
      }
    },
    async loginWithGoogle() {
      this.loading = true
      this.error = ''
      try {
        const credential = await signInWithPopup(auth, googleProvider)
        await this.ensureProfile(credential.user)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Google 登入失敗'
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await signOut(auth)
      this.user = null
      this.profile = null
    },
  },
})

export function getFirebaseSetupHint() {
  if (isFirebaseConfigured) return ''
  return '請先在 `.env` 設定 Firebase 參數，否則登入與資料存取無法正常運作。'
}
