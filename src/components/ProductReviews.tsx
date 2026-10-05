import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProductReviews, useCreateReview } from "@/hooks/useReviews";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProductReviewsProps {
  productId: string;
}

const renderStars = (rating: number, size: "sm" | "md" = "md") => {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user, isAnonymous } = useAuth();
  const { toast } = useToast();
  const { data: reviews = [], isLoading } = useProductReviews(productId, user?.id);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");

  const approvedReviews = useMemo(() => reviews.filter((r) => r.status === "approved"), [reviews]);
  const ownReview = useMemo(
    () => (user && !isAnonymous ? reviews.find((r) => r.user_id === user.id) : undefined),
    [reviews, user, isAnonymous]
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || isAnonymous) {
      toast({
        title: "Login required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the name you'd like shown on your review",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview.mutateAsync({
        product_id: productId,
        user_id: user.id,
        user_name: userName.trim(),
        rating,
        comment,
      });
      toast({
        title: "Review submitted",
        description: "Thanks for your feedback! It'll appear once our team approves it.",
      });
      setComment("");
      setRating(5);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = approvedReviews.filter((r) => r.rating === star).length;
    const percentage = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Rating Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-semibold">{avgRating.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(avgRating))}
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {approvedReviews.length} review{approvedReviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map(({ star, count, percentage }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star} star</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Review Form */}
            <div>
              <h3 className="font-semibold mb-4">Write a Review</h3>
              {ownReview ? (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    You've already submitted a review for this product.
                    {ownReview.status === "pending" && " It's awaiting approval."}
                    {ownReview.status === "rejected" && " It was not approved for publishing."}
                  </p>
                </div>
              ) : !user || isAnonymous ? (
                <p className="text-sm text-muted-foreground">
                  Please login to write a review.
                </p>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Your Name</Label>
                    <Input
                      id="userName"
                      placeholder="e.g. Sarah M."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Rating</Label>
                    <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <SelectItem key={star} value={String(star)}>
                            {star} Star{star !== 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your thoughts about this product..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createReview.isPending}>
                    {createReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">All Reviews</h3>
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">Loading reviews...</CardContent>
          </Card>
        ) : approvedReviews.length > 0 ? (
          approvedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.user_name}</span>
                      {review.verified_purchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating, "sm")}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
