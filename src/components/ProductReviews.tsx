import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  verified_purchase?: boolean;
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export const ProductReviews = ({ 
  productId, 
  reviews = [], 
  averageRating = 0,
  totalReviews = 0 
}: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock reviews data - in production, this would come from an API
  const mockReviews: Review[] = reviews.length > 0 ? reviews : [
    {
      id: "1",
      user_name: "Sarah M.",
      rating: 5,
      comment: "Absolutely love this piece! The quality is exceptional and it fits perfectly. Highly recommend!",
      created_at: "2024-01-15",
      verified_purchase: true,
    },
    {
      id: "2",
      user_name: "James T.",
      rating: 4,
      comment: "Great quality denim, very comfortable. The fit is true to size. Only minor issue is the color is slightly lighter than shown.",
      created_at: "2024-01-10",
      verified_purchase: true,
    },
    {
      id: "3",
      user_name: "Emma L.",
      rating: 5,
      comment: "Perfect! Exactly as described. The craftsmanship is outstanding. Will definitely order again.",
      created_at: "2024-01-05",
      verified_purchase: true,
    },
  ];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // In production, this would make an API call
    setTimeout(() => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setComment("");
      setRating(5);
      setIsSubmitting(false);
    }, 1000);
  };

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

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = mockReviews.filter((r) => r.rating === star).length;
    const percentage = mockReviews.length > 0 ? (count / mockReviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  const avgRating = averageRating || 
    (mockReviews.length > 0
      ? mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length
      : 0);

  const total = totalReviews || mockReviews.length;

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
                <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(avgRating))}
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {total} review{total !== 1 ? "s" : ""}
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
              <form onSubmit={handleSubmitReview} className="space-y-4">
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">All Reviews</h3>
        {mockReviews.length > 0 ? (
          mockReviews.map((review) => (
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

