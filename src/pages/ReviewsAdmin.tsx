import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Trash2, LogOut, ShoppingCart, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminReviews, useUpdateReviewStatus, useDeleteReview } from '@/hooks/useReviews';
import type { ReviewStatus } from '@/types/review';

const statusVariant: Record<ReviewStatus, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

const ReviewsAdmin = () => {
  useEffect(() => {
    document.title = 'Reviews Management - AZACH Admin';
  }, []);

  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const { data: reviews, isLoading } = useAdminReviews(tab === 'all' ? undefined : tab);
  const updateStatus = useUpdateReviewStatus();
  const deleteReview = useDeleteReview();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: 'Success', description: `Review ${status}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await deleteReview.mutateAsync(id);
      toast({ title: 'Success', description: 'Review deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-semibold">Reviews Management</h1>
            {user && <p className="text-sm text-muted-foreground mt-1">Logged in as: {user.email}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Package className="mr-2 h-4 w-4" />
              Products
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/orders')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.user_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-sm truncate">{review.comment}</TableCell>
                        <TableCell>{review.verified_purchase ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[review.status]}>{review.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {review.status !== 'approved' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Approve"
                                onClick={() => handleStatusChange(review.id, 'approved')}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {review.status !== 'rejected' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Reject"
                                onClick={() => handleStatusChange(review.id, 'rejected')}
                              >
                                <X className="h-4 w-4 text-amber-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDelete(review.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No {tab === 'all' ? '' : tab} reviews found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReviewsAdmin;
