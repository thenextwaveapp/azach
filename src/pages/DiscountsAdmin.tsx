import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, LogOut, ShoppingCart, Package, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DiscountCode {
  id: string;
  code: string;
  percent_off: number;
  applies_to: string;
  active: boolean;
  issued_to_email: string | null;
  created_at: string;
}

const DiscountsAdmin = () => {
  useEffect(() => {
    document.title = 'Discount Codes - AZACH Admin';
  }, []);

  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', percent_off: 10, applies_to: 'order', active: true });

  const fetchCodes = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.functions.invoke('admin-list-discount-codes');
    if (error) {
      setError(error.message || 'Failed to load');
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setCodes((data?.codes as DiscountCode[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      percent_off: Number(form.percent_off),
      applies_to: form.applies_to,
      active: form.active,
    };
    const { error } = await supabase.from('discount_codes').insert(payload);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Created', description: 'Discount code added.' });
      setForm({ code: '', percent_off: 10, applies_to: 'order', active: true });
      fetchCodes();
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from('discount_codes').update({ active: !active }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else fetchCodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return;
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Deleted', description: 'Discount code removed.' });
      fetchCodes();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-semibold">Discount Codes</h1>
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
            <Button variant="outline" onClick={() => navigate('/admin/reviews')}>
              <Star className="mr-2 h-4 w-4" />
              Reviews
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid md:grid-cols-5 gap-3 mb-8 p-4 border rounded-lg">
          <div>
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div>
            <Label>Percent Off</Label>
            <Input type="number" value={form.percent_off} onChange={(e) => setForm({ ...form, percent_off: Number(e.target.value) })} required />
          </div>
          <div>
            <Label>Applies To</Label>
            <select
              className="w-full border rounded h-10 px-2"
              value={form.applies_to}
              onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
            >
              <option value="order">Order (subtotal)</option>
              <option value="shipping">Shipping</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
          </div>
          <div className="flex items-end">
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </form>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Percent Off</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive">{error}</TableCell>
                </TableRow>
              ) : codes.length > 0 ? (
                codes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell>{c.percent_off}%</TableCell>
                    <TableCell>{c.applies_to}</TableCell>
                    <TableCell>
                      <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.issued_to_email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(c.id, c.active)}>
                          {c.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No discount codes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DiscountsAdmin;
