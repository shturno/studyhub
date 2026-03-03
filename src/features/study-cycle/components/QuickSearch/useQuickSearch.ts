"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Track, Lesson } from "@/features/study-cycle/types";

export function useQuickSearch(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  tracks: Track[],
  lessons: Lesson[],
) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredTracks = tracks.filter((track) =>
    track.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (
    type: "track" | "lesson",
    id: string,
    trackId?: string,
  ) => {
    onOpenChange(false);
    setSearch("");

    if (type === "track") {
      router.push(`/tracks/${id}`);
    } else if (type === "lesson" && trackId) {
      router.push(`/tracks/${trackId}`);
    }
  };

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return { search, setSearch, filteredTracks, filteredLessons, handleSelect };
}
