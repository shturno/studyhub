import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTodayReviews, getNextReviewDate } from "@/features/reviews/actions";
import { ReviewsView } from "@/features/reviews/components/ReviewsView";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [reviewsResult, nextDateResult] = await Promise.all([
    getTodayReviews(),
    getNextReviewDate(),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const nextReviewDate = nextDateResult.success ? nextDateResult.data : null;

  return <ReviewsView initialReviews={reviews} nextReviewDate={nextReviewDate} />;
}
