"use client"

import { useState } from "react"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrackCard } from "@/components/track-card"
import { QuickSearch } from "@/components/quick-search"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTracks } from "@/hooks/use-tracks"
import { useLessons } from "@/hooks/use-lessons"
import { useCommonHotkeys } from "@/hooks/use-hotkeys"

export default function TrackListPage() {
  const { tracks, loading: tracksLoading, addTrack } = useTracks()
  const { lessons } = useLessons() // Get all lessons for search
  const [searchOpen, setSearchOpen] = useState(false)
  const [newTrackOpen, setNewTrackOpen] = useState(false)
  const [newTrackName, setNewTrackName] = useState("")

  // <CHANGE> Register hotkeys for search
  useCommonHotkeys({
    onSearch: () => setSearchOpen(true),
  })

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTrackName.trim()) return

    try {
      await addTrack(newTrackName.trim())
      setNewTrackName("")
      setNewTrackOpen(false)
    } catch (error) {
      console.error("Error creating track:", error)
    }
  }

  // Calculate lesson counts for each track
  const getTrackStats = (trackId: string) => {
    const trackLessons = lessons.filter((lesson) => lesson.trackId === trackId)
    const doneCount = trackLessons.filter((lesson) => lesson.done).length
    return { doneCount, totalCount: trackLessons.length }
  }

  if (tracksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando trilhas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <CHANGE> Header with title and new track button */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Study Hub</h1>
              <p className="text-sm text-muted-foreground">
                Pressione <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd> para buscar
              </p>
            </div>
            <Dialog open={newTrackOpen} onOpenChange={setNewTrackOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Trilha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Trilha</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTrack} className="space-y-4">
                  <Input
                    placeholder="Nome da trilha..."
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setNewTrackOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!newTrackName.trim()}>
                      Criar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* <CHANGE> Main content with track grid */}
      <main className="container mx-auto px-4 py-8">
        {tracks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma trilha ainda</h2>
            <p className="text-muted-foreground mb-6">Crie sua primeira trilha de estudos para começar</p>
            <Button onClick={() => setNewTrackOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Trilha
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tracks.map((track) => {
              const { doneCount, totalCount } = getTrackStats(track.id)
              return (
                <TrackCard
                  key={track.id}
                  track={track}
                  doneCount={doneCount}
                  totalCount={totalCount}
                />
              )
            })}
          </div>
        )}
      </main>

      {/* <CHANGE> Footer with theme toggle */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Study Hub - Organize seus estudos
            </p>
            <ThemeToggle />
          </div>
        </div>
      </footer>

      {/* <CHANGE> Quick search dialog */}
      <QuickSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        tracks={tracks}
        lessons={lessons}
      />
    </div>
  )
}
