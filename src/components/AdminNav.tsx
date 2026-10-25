import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ShoppingCart, Package, Star, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNavProps {
  onAdd?: () => void;
  addLabel?: string;
}

export const AdminNav = ({ onAdd, addLabel }: AdminNavProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/admin')}>
        <Package className="mr-2 h-4 w-4" />
        Products
      </Button>
      <Button variant="outline" onClick={() => navigate('/admin/orders')}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Orders
      </Button>
      <Button variant="outline" onClick={() => navigate('/admin/discounts')}>
        <Tag className="mr-2 h-4 w-4" />
        Discounts
      </Button>
      <Button variant="outline" onClick={() => navigate('/admin/reviews')}>
        <Star className="mr-2 h-4 w-4" />
        Reviews
      </Button>
      {onAdd && (
        <Button onClick={onAdd}>
          {addLabel || 'Add'}
        </Button>
      )}
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};
