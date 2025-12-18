/**
 * Discover Page - Adaptive Edition
 */
"use client"
import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Filter, Heart, Sparkles } from "lucide-react"
import { AdaptiveProfileCard, useAdaptiveUI, UIModeSelectorModal, ShowWhen, Adaptive } from "@/components/adaptive"
import { useDiscoverUsers, usePost } from "@/hooks"
import { Modal, Button, Input, Select, Alert } from "@/components/ui"
import { Gender } from "@prisma/client"
import type { DiscoverFilters, SwipeResult } from "@/lib/types"

export default function DiscoverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { mode, triggerHaptic } = useAdaptiveUI()
  const [showFilters, setShowFilters] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [matchData, setMatchData] = useState<any>(null)
  const [filters, setFilters] = useState<DiscoverFilters>({ minAge: 18, maxAge: 99 })
  const { users, isLoading, error, refetch, setUsers } = useDiscoverUsers(filters)

  const { post: swipePost, isLoading: isSwipeLoading } = usePost<SwipeResult>("/api/swipe", {
    onSuccess: (data) => {
      if (data?.isMatch && data.match) {
        setMatchData(data.match)
        setShowMatchModal(true)
        triggerHaptic("heavy")
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
    await swipePost({ swipedId: users[0].id, isLike: true })
    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handlePass = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    await swipePost({ swipedId: users[0].id, isLike: false })
    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handleSuperLike = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    await swipePost({ swipedId: users[0].id, isLike: true })
    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers])

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
            <Adaptive simple={<span>Ontdek</span>} standard={<span>Discover</span>} advanced={<span>Discover</span>} />
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
                  {i === 0 ? <AdaptiveProfileCard profile={convertToProfileData(user)} onLike={handleLike} onPass={handlePass} onSuperLike={handleSuperLike} isLoading={isSwipeLoading} /> : <div className="card-dating bg-gray-100" />}
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
        <div className="text-center py-6">
          <div className="text-8xl mb-4">💕</div>
          <h3 className="text-3xl font-bold mb-2">Match!</h3>
          <p className="mb-6">Match met {matchData?.otherUser?.name}!</p>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => setShowMatchModal(false)} fullWidth>Swipen</Button><Button variant="primary" onClick={() => router.push("/chat/" + matchData?.id)} fullWidth>Bericht</Button></div>
        </div>
      </Modal>
      <UIModeSelectorModal isOpen={showModeSelector} onClose={() => setShowModeSelector(false)} />
    </div>
  )
}