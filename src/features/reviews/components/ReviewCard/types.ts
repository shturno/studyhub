import type { ReviewWithTopic } from "@/features/reviews/types";

export interface ReviewCardProps {
  review: ReviewWithTopic;
  onComplete: (reviewId: string, quality: number) => void;
  isLoading?: boolean;
}
