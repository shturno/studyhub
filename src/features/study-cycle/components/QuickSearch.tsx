"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { BookOpen, FileText } from "lucide-react"
import type { Track, Lesson } from "@/features/study-cycle/types"

interface QuickSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tracks: Track[]
  lessons: Lesson[]
}

export function QuickSearch({ open, onOpenChange, tracks, lessons }: QuickSearchProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const filteredTracks = tracks.filter((track) => track.name.toLowerCase().includes(search.toLowerCase()))

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      lesson.title.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = (type: "track" | "lesson", id: string, trackId?: string) => {
    onOpenChange(false)
    setSearch("")

    if (type === "track") {
      router.push(`/track/${id}`)
    } else if (type === "lesson" && trackId) {
      router.push(`/track/${trackId}`)
    }
  }

  useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar trilhas e lições..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {filteredTracks.length > 0 && (
          <CommandGroup heading="Trilhas">
            {filteredTracks.map((track) => (
              <CommandItem
                key={track.id}
                onSelect={() => handleSelect("track", track.id)}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>{track.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredLessons.length > 0 && (
          <CommandGroup heading="Lições">
            {filteredLessons.map((lesson) => {
              const track = tracks.find((t) => t.id === lesson.trackId)
              return (
                <CommandItem
                  key={lesson.id}
                  onSelect={() => handleSelect("lesson", lesson.id, lesson.trackId)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{lesson.title}</div>
                    {track && <div className="text-xs text-muted-foreground">{track.name}</div>}
                  </div>
                  {lesson.status === 'DONE' && <div className="text-xs text-emerald-600 dark:text-emerald-400">✓</div>}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
