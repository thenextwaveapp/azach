import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AdminNav } from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, LogOut, ShoppingCart, Package, Star, Tag, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { invokeFunction } from '@/lib/functionError';

interface DiscountCode {
  id: string;
  code: string;
  percent_off: number;
  applies_to: string;
  active: boolean;
  usage_type: string;
  max_uses: number | null;
  min_spend: number;
  used_count: number;
  issued_to_email: string | null;
  created_at: string;
}

const emptyForm = { code: '', percent_off: 10, applies_to: 'order', active: true, usage_type: 'single', max_uses: 1, min_spend: 0 };

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invokeFunction<{ codes: DiscountCode[] }>('admin-list-discount-codes');
      setCodes(data.codes || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: DiscountCode) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      percent_off: c.percent_off,
      applies_to: c.applies_to,
      active: c.active,
      usage_type: c.usage_type || 'single',
      max_uses: c.max_uses ?? 1,
      min_spend: c.min_spend ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        percent_off: Number(form.percent_off),
        applies_to: form.applies_to,
        active: form.active,
        usage_type: form.usage_type,
        max_uses: form.usage_type === 'multiple' ? Number(form.max_uses) : null,
        min_spend: Number(form.min_spend) || 0,
      };
      if (editingId) {
        await invokeFunction('admin-update-discount-code', { id: editingId, ...payload });
        toast({ title: 'Updated', description: 'Discount code updated.' });
      } else {
        await invokeFunction('admin-create-discount-code', payload);
        toast({ title: 'Created', description: 'Discount code added.' });
      }
      setModalOpen(false);
      fetchCodes();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save discount code',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await invokeFunction('admin-update-discount-code', { id, active: !active });
      fetchCodes();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update discount code',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return;
    try {
      await invokeFunction('admin-delete-discount-code', { id });
      toast({ title: 'Deleted', description: 'Discount code removed.' });
      fetchCodes();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete discount code',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const usageLabel = (c: DiscountCode) => {
    if (c.usage_type === 'single') return 'Single use';
    if (c.usage_type === 'unlimited') return 'Unlimited';
    return `Multiple (max ${c.max_uses ?? '∞'})`;
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
          <AdminNav onAdd={openCreate} addLabel="Add Discount Code" />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Percent Off</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Min Spend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-destructive">{error}</TableCell>
                </TableRow>
              ) : codes.length > 0 ? (
                codes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell>{c.percent_off}%</TableCell>
                    <TableCell>{c.applies_to}</TableCell>
                    <TableCell>{usageLabel(c)}</TableCell>
                    <TableCell>{c.used_count ?? 0}{c.max_uses ? ` / ${c.max_uses}` : ''}</TableCell>
                    <TableCell>{c.min_spend ? c.min_spend : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.issued_to_email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
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
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No discount codes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Discount Code' : 'Add Discount Code'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required disabled={!!editingId} readOnly={!!editingId} />
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
            <div>
              <Label>Usage</Label>
              <select
                className="w-full border rounded h-10 px-2"
                value={form.usage_type}
                onChange={(e) => setForm({ ...form, usage_type: e.target.value })}
              >
                <option value="single">Single use</option>
                <option value="multiple">Multiple use</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            {form.usage_type === 'multiple' && (
              <div>
                <Label>Max Uses</Label>
                <Input type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} required />
              </div>
            )}
            <div>
              <Label>Minimum Spend (0 for none)</Label>
              <Input type="number" min={0} value={form.min_spend} onChange={(e) => setForm({ ...form, min_spend: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Save' : 'Add')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountsAdmin;
