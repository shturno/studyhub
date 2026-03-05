"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BookOpen, FileText } from "lucide-react";
import { useQuickSearch } from "./useQuickSearch";
import type { QuickSearchProps } from "./types";

export function QuickSearch({
  open,
  onOpenChange,
  tracks,
  lessons,
}: QuickSearchProps) {
  const { search, setSearch, filteredTracks, filteredLessons, handleSelect } =
    useQuickSearch(open, onOpenChange, tracks, lessons);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar trilhas e lições..."
        value={search}
        onValueChange={setSearch}
      />
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
                <BookOpen className="h-4 w-4 text-[#00ff41]" />
                <span>{track.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredLessons.length > 0 && (
          <CommandGroup heading="Lições">
            {filteredLessons.map((lesson) => {
              const track = tracks.find((t) => t.id === lesson.trackId);
              return (
                <CommandItem
                  key={lesson.id}
                  onSelect={() =>
                    handleSelect("lesson", lesson.id, lesson.trackId)
                  }
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-[#7b61ff]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-base">{lesson.title}</div>
                    {track && (
                      <div className="font-mono text-sm text-[#555]">
                        {track.name}
                      </div>
                    )}
                  </div>
                  {lesson.status === "DONE" && (
                    <span className="font-pixel text-[7px] text-[#00ff41]">
                      ✓
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
