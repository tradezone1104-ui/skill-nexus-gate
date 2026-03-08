import { useState, useEffect } from "react";
import { Star, Send, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string;
  created_at: string;
  displayName?: string;
}

interface CourseReviewsProps {
  courseId: string;
}

const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) => {
  const [hover, setHover] = useState(0);
  const px = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
        >
          <Star
            className={`${px} ${
              star <= (hover || value)
                ? "fill-warning text-warning"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const CourseReviews = ({ courseId }: CourseReviewsProps) => {
  const { user } = useAuth();
  const { isPurchased } = usePurchaseContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const purchased = isPurchased(courseId);
  const existingReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    
    const reviewData = (data || []) as Review[];
    
    // Fetch display names for reviewers
    if (reviewData.length > 0) {
      const userIds = [...new Set(reviewData.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
      reviewData.forEach((r) => {
        r.displayName = nameMap.get(r.user_id) || "Anonymous";
      });
    }
    
    setReviews(reviewData);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    const trimmed = comment.trim().slice(0, 1000);
    setSubmitting(true);
    try {
      if (editing && existingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({ rating, comment: trimmed })
          .eq("id", existingReview.id);
        if (error) throw error;
        toast.success("Review updated!");
      } else {
        const { error } = await supabase.from("reviews").insert({
          user_id: user.id,
          course_id: courseId,
          rating,
          comment: trimmed,
        });
        if (error) throw error;
        toast.success("Review submitted!");
      }
      setRating(0);
      setComment("");
      setEditing(false);
      await fetchReviews();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review deleted");
      await fetchReviews();
    }
  };

  const startEdit = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setEditing(true);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">
          Reviews ({reviews.length})
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(Number(avgRating))} readonly size="sm" />
            <span className="text-sm font-medium text-foreground">{avgRating}</span>
          </div>
        )}
      </div>

      {/* Review form — only for purchasers who haven't reviewed yet (or editing) */}
      {user && purchased && (!existingReview || editing) && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border">
          <p className="text-sm font-medium text-foreground">
            {editing ? "Edit your review" : "Write a review"}
          </p>
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            placeholder="Share your experience with this course… (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            className="resize-none bg-background"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Submitting…" : editing ? "Update" : "Submit"}
            </Button>
            {editing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setRating(0);
                  setComment("");
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {user && purchased && existingReview && !editing && (
        <p className="text-sm text-muted-foreground">
          You've already reviewed this course.{" "}
          <button onClick={startEdit} className="text-primary hover:underline">
            Edit your review
          </button>
        </p>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-primary hover:underline">Sign in</a> to leave a review.
        </p>
      )}

      {user && !purchased && !existingReview && (
        <p className="text-sm text-muted-foreground">
          Purchase this course to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const name = review.profiles?.full_name || "Anonymous";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isOwn = user?.id === review.user_id;

            return (
              <div key={review.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} readonly size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isOwn && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={startEdit}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(review.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2 ml-11">{review.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
