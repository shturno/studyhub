import type React from "react";

export interface CreateLessonDialogProps {
  readonly children: React.ReactNode;
  readonly trackId: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  externalUrl: string;
  estimated: string;
}
