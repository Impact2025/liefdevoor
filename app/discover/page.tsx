/**
 * Discover Page - Adaptive Edition
 */
"use client"
import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Filter, Heart, Sparkles, Camera } from "lucide-react"
import { AdaptiveProfileCard, useAdaptiveUI, UIModeSelectorModal, ShowWhen, Adaptive } from "@/components/adaptive"
import { useDiscoverUsers, usePost, useCurrentUser } from "@/hooks"
import { Modal, Button, Input, Select, Alert } from "@/components/ui"
import { Gender } from "@prisma/client"
import type { DiscoverFilters, SwipeResult } from "@/lib/types"
import confetti from "canvas-confetti"

export default function DiscoverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { mode, triggerHaptic } = useAdaptiveUI()
  const { user: currentUser } = useCurrentUser()
  const [showFilters, setShowFilters] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [matchData, setMatchData] = useState<any>(null)
  const [filters, setFilters] = useState<DiscoverFilters>({ minAge: 18, maxAge: 99 })
  const [canUndo, setCanUndo] = useState(false)
  const [lastSwipedProfile, setLastSwipedProfile] = useState<any>(null)
  const { users, isLoading, error, refetch, setUsers } = useDiscoverUsers(filters)

  // Check if user needs onboarding (no photos)
  useEffect(() => {
    if (currentUser && !onboardingDismissed) {
      const hasPhotos = currentUser.photos && currentUser.photos.length > 0
      if (!hasPhotos && !currentUser.profileImage) {
        setShowOnboarding(true)
      }
    }
  }, [currentUser, onboardingDismissed])

  // Confetti celebration for matches
  const celebrateMatch = useCallback(() => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    // Multi-stage confetti burst (like Tinder)
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#EC4899', '#F472B6', '#FCA5A5'],
    })

    fire(0.2, {
      spread: 60,
      colors: ['#F43F5E', '#FB7185', '#FDA4AF'],
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#EC4899', '#F472B6', '#FCA5A5'],
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#F43F5E', '#FB7185'],
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#EC4899', '#F472B6'],
    })
  }, [])

  const { post: swipePost, isLoading: isSwipeLoading } = usePost<SwipeResult>("/api/swipe", {
    onSuccess: (data) => {
      if (data?.isMatch && data.match) {
        setMatchData(data.match)
        setShowMatchModal(true)
        triggerHaptic("heavy")
        // Trigger confetti celebration
        setTimeout(celebrateMatch, 100)
      }
    },
  })

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
    return age
  }

  const convertToProfileData = (user: any) => ({
    id: user.id, name: user.name || "Onbekend", age: user.birthDate ? calculateAge(user.birthDate) : 0,
    photo: user.profileImage || user.photos?.[0]?.url || "https://ui-avatars.com/api/?name=User&size=400",
    photos: user.photos, distance: user.distance || 0, city: user.city || "", bio: user.bio || "",
    interests: user.interests || [], verified: user.isVerified || false,
  })

  const handleLike = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const currentUser = users[0]
    setLastSwipedProfile(currentUser)
    await swipePost({ swipedId: currentUser.id, isLike: true })
    setUsers(users.slice(1))
    setCanUndo(true)
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handlePass = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const currentUser = users[0]
    setLastSwipedProfile(currentUser)
    await swipePost({ swipedId: currentUser.id, isLike: false })
    setUsers(users.slice(1))
    setCanUndo(true)
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handleSuperLike = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const currentUser = users[0]
    setLastSwipedProfile(currentUser)
    await swipePost({ swipedId: currentUser.id, isLike: true, isSuperLike: true })
    setUsers(users.slice(1))
    setCanUndo(true)
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handleUndo = useCallback(async () => {
    if (!canUndo || !lastSwipedProfile) return

    try {
      const response = await fetch('/api/swipe/undo', { method: 'POST' })
      const data = await response.json()

      if (response.ok && data.success) {
        // Add the undone profile back to the front of the stack
        setUsers([lastSwipedProfile, ...users])
        setCanUndo(false)
        setLastSwipedProfile(null)
        triggerHaptic('light')
      } else {
        // Handle premium feature gate or other errors
        alert(data.message || 'Kon swipe niet ongedaan maken')
      }
    } catch (error) {
      console.error('Undo error:', error)
      alert('Er ging iets mis bij het ongedaan maken')
    }
  }, [canUndo, lastSwipedProfile, users, setUsers, triggerHaptic])

  const applyFilters = () => { refetch(filters); setShowFilters(false) }
  const clearFilters = () => { setFilters({ minAge: 18, maxAge: 99 }); refetch({ minAge: 18, maxAge: 99 }) }

  if (status === "loading") return <div className="min-h-screen bg-pink-50 flex items-center justify-center"><div className="skeleton h-[500px] w-full max-w-md" /></div>
  if (!session) { router.push("/login"); return null }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" fill="#EC4899" />
            <Adaptive simple={<span>Ontdek</span>} standard={<span>Ontdekken</span>} advanced={<span>Ontdekken</span>} />
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowModeSelector(true)} className="px-3 py-1.5 rounded-full text-sm bg-gray-100 hover:bg-gray-200">
              {mode === "simple" && "🎯"}{mode === "standard" && "⚡"}{mode === "advanced" && "🚀"}
            </button>
            <Button variant="secondary" size="sm" onClick={() => setShowFilters(true)}><Filter className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6">
        {isLoading ? <div className="skeleton h-[500px]" /> : error ? (
          <Alert variant="error">Fout bij laden. <button onClick={() => refetch()} className="underline">Opnieuw</button></Alert>
        ) : users.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">Geen matches</h3>
            <Button variant="primary" onClick={clearFilters}>Reset</Button>
          </motion.div>
        ) : (
          <div className="relative" style={{ minHeight: 550 }}>
            <AnimatePresence mode="popLayout">
              {users.slice(0, 3).map((user, i) => (
                <motion.div key={user.id} initial={{ scale: 0.95 }} animate={{ scale: 1 - i * 0.05, y: i * 10, zIndex: users.length - i }} exit={{ scale: 0.9 }} className="absolute inset-0" style={{ pointerEvents: i === 0 ? "auto" : "none" }}>
                  {i === 0 ? <AdaptiveProfileCard profile={convertToProfileData(user)} onLike={handleLike} onPass={handlePass} onSuperLike={handleSuperLike} onUndo={handleUndo} showUndoButton={canUndo} isLoading={isSwipeLoading} /> : <div className="card-dating bg-gray-100" />}
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="absolute bottom-0 inset-x-0 text-center" style={{ zIndex: 9999 }}><p className="text-sm text-gray-600">{users.length} mensen</p></div>
          </div>
        )}
      </main>
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filters" size="md">
        <div className="space-y-6">
          <Input label="Naam" value={filters.name || ""} onChange={(e) => setFilters({ ...filters, name: e.target.value })} fullWidth />
          <Select label="Geslacht" value={filters.gender || ""} onChange={(e) => setFilters({ ...filters, gender: e.target.value as Gender | undefined })} fullWidth options={[{ value: "", label: "Alle" }, { value: Gender.MALE, label: "Man" }, { value: Gender.FEMALE, label: "Vrouw" }]} />
          <div className="flex gap-3"><Button variant="secondary" onClick={clearFilters} fullWidth>Reset</Button><Button variant="primary" onClick={applyFilters} fullWidth>Toepassen</Button></div>
        </div>
      </Modal>
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="" size="md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center py-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            className="text-8xl mb-4"
          >
            💕
          </motion.div>
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"
          >
            It's a Match!
          </motion.h3>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-gray-600"
          >
            Jij en {matchData?.otherUser?.name} vinden elkaar leuk!
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            <Button variant="secondary" onClick={() => setShowMatchModal(false)} fullWidth>Verder swipen</Button>
            <Button variant="primary" onClick={() => router.push("/chat/" + matchData?.id)} fullWidth>Stuur bericht</Button>
          </motion.div>
        </motion.div>
      </Modal>
      <UIModeSelectorModal isOpen={showModeSelector} onClose={() => setShowModeSelector(false)} />

      {/* Onboarding Modal - Encourage photo upload */}
      <Modal isOpen={showOnboarding} onClose={() => { setShowOnboarding(false); setOnboardingDismissed(true) }} title="" size="md">
        <div className="text-center py-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-pink-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Voeg een foto toe!
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Profielen met foto's krijgen <span className="font-semibold text-pink-600">10x meer matches</span>.
            Laat anderen zien wie je bent!
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => { setShowOnboarding(false); setOnboardingDismissed(true) }}
              fullWidth
            >
              Later
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/profile")}
              fullWidth
            >
              Foto toevoegen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}