import { useState, useEffect, Fragment } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useBundles } from '@/hooks/useProducts';
import { Trash2, Edit, Plus, LogOut, ChevronUp, ChevronDown, Upload, Search, ArrowUpDown, ArrowUp, ArrowDown, ShoppingCart, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { ProductInsert, ProductUpdate, ForeignCurrency } from '@/types/product';
import { uploadImageToStorage, uploadMultipleImages } from '@/utils/imageUpload';

// Paystack only charges NGN + USD on this account, so USD is the only foreign
// currency we take a manually-set display/charge price for.
const FOREIGN_CURRENCIES: { code: ForeignCurrency; label: string }[] = [
  { code: 'USD', label: '$' },
];

const Admin = () => {
  // Set page title
  useEffect(() => {
    document.title = "Admin Panel - AZACH";
  }, []);
  const { data: products, isLoading } = useProducts();
  const { data: bundles } = useBundles();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
    navigate('/');
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductUpdate | null>(null);
  const [formData, setFormData] = useState<ProductInsert>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    image_urls: [],
    sku: '',
    size: '',
    material: '',
    care_instructions: '',
    style_code: '',
    measurements: {},
    model_info: {},
    custom_size_available: false,
    is_bundle: false,
    bundle_id: undefined,
    bundle_quantity: 1,
    bundle_role: '',
    stock: 0,
    in_stock: true,
    featured: false,
    on_sale: false,
    gender: [],
    weight_kg: undefined,
    length_cm: undefined,
    width_cm: undefined,
    height_cm: undefined,
    hs_code: '',
    currency_prices: {},
  });
  const [additionalImageInput, setAdditionalImageInput] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<'name' | 'category' | 'price' | 'stock' | 'created_at' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url && !coverImageFile) {
      toast({
        title: 'Error',
        description: 'Cover image is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.gender || formData.gender.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one gender is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.sku?.trim()) {
      toast({
        title: 'Error',
        description: 'SKU is required',
        variant: 'destructive',
      });
      return;
    }

    const duplicateSku = products?.find(
      (p) => p.sku?.trim().toLowerCase() === formData.sku!.trim().toLowerCase() && p.id !== editingProduct?.id
    );
    if (duplicateSku) {
      toast({
        title: 'Error',
        description: `SKU "${formData.sku}" is already used by "${duplicateSku.name}"`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      let updatedFormData = { ...formData };

      // Upload cover image if a file was selected
      if (coverImageFile) {
        const coverImageUrl = await uploadImageToStorage(coverImageFile);
        updatedFormData.image_url = coverImageUrl;
      }

      // Upload additional images if files were selected
      if (additionalImageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages(additionalImageFiles);
        updatedFormData.image_urls = [
          ...(updatedFormData.image_urls || []),
          ...uploadedUrls,
        ];
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          ...editingProduct,
          ...updatedFormData,
        });
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        await createProduct.mutateAsync(updatedFormData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      category: product.category,
      image_url: product.image_url,
      image_urls: product.image_urls || [],
      sku: product.sku || '',
      size: product.size || '',
      material: product.material || '',
      care_instructions: product.care_instructions || '',
      style_code: product.style_code || '',
      measurements: product.measurements || {},
      model_info: product.model_info || {},
      custom_size_available: product.custom_size_available || false,
      is_bundle: product.is_bundle || false,
      bundle_id: product.bundle_id || undefined,
      bundle_quantity: product.bundle_quantity || 1,
      bundle_role: product.bundle_role || '',
      stock: product.stock,
      in_stock: product.in_stock,
      featured: product.featured,
      on_sale: product.on_sale,
      gender: product.gender || [],
      weight_kg: product.weight_kg,
      length_cm: product.length_cm,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      hs_code: product.hs_code || '',
      currency_prices: product.currency_prices || {},
    });
    setIsDialogOpen(true);
  };

  const addAdditionalImage = () => {
    if (additionalImageInput.trim()) {
      setFormData({
        ...formData,
        image_urls: [...(formData.image_urls || []), additionalImageInput.trim()],
      });
      setAdditionalImageInput('');
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls?.filter((_, i) => i !== index),
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!formData.image_urls) return;
    const newImages = [...formData.image_urls];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setFormData({
      ...formData,
      image_urls: newImages,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete product',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      image_urls: [],
      sku: '',
      size: '',
      material: '',
      care_instructions: '',
      style_code: '',
      measurements: {},
      model_info: {},
      custom_size_available: false,
      is_bundle: false,
      bundle_id: undefined,
      bundle_quantity: 1,
      bundle_role: '',
      stock: 0,
      in_stock: true,
      featured: false,
      on_sale: false,
      gender: [],
      weight_kg: undefined,
      length_cm: undefined,
      width_cm: undefined,
      height_cm: undefined,
      hs_code: '',
      currency_prices: {},
    });
    setAdditionalImageInput('');
    setCoverImageFile(null);
    setAdditionalImageFiles([]);
    setEditingProduct(null);
  };

  // Handle column sorting
  const handleSort = (column: 'name' | 'category' | 'price' | 'stock' | 'created_at') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Render sort icon
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Filter and sort products
  const filteredProducts = products
    ?.filter((product) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.gender?.some((g) => g.toLowerCase().includes(query)) ||
        product.id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;

      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Convert to comparable values
      if (sortColumn === 'price' || sortColumn === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortColumn === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        // String comparison (case-insensitive)
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-semibold">Product Management</h1>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">
                  Logged in as: {user.email}
                </p>
              )}
            </div>
            <div className="flex gap-2">
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
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOPS">Tops</SelectItem>
                        <SelectItem value="BOTTOM">Bottoms</SelectItem>
                        <SelectItem value="SET">Sets</SelectItem>
                        <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                        <SelectItem value="DRESS">Dress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (for sale items)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.original_price || ''}
                      onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.is_bundle ? (editingProduct?.stock ?? 0) : formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0, in_stock: parseInt(e.target.value) > 0 })}
                      disabled={formData.is_bundle}
                      required
                    />
                    {formData.is_bundle && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Computed automatically from component stock — save this set, then link components to it.
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {FOREIGN_CURRENCIES.map(({ code, label }) => (
                      <Fragment key={code}>
                        <div>
                          <Label htmlFor={`price_${code}`}>Price ({label})</Label>
                          <Input
                            id={`price_${code}`}
                            type="number"
                            step="0.01"
                            value={formData.currency_prices?.[code]?.price ?? ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              currency_prices: {
                                ...formData.currency_prices,
                                [code]: { ...formData.currency_prices?.[code], price: parseFloat(e.target.value) || undefined },
                              },
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`original_price_${code}`}>Original Price ({label})</Label>
                          <Input
                            id={`original_price_${code}`}
                            type="number"
                            step="0.01"
                            value={formData.currency_prices?.[code]?.original_price ?? ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              currency_prices: {
                                ...formData.currency_prices,
                                [code]: { ...formData.currency_prices?.[code], original_price: parseFloat(e.target.value) || undefined },
                              },
                            })}
                          />
                        </div>
                      </Fragment>
                    ))}
                </div>
                <div>
                  <Label>Cover Image *</Label>
                  <Tabs defaultValue="url" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="upload">Upload File</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-2">
                      <Input
                        id="image_url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Enter the URL of your cover image</p>
                    </TabsContent>
                    <TabsContent value="upload" className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCoverImageFile(file);
                              // Clear URL if file is selected
                              setFormData({ ...formData, image_url: '' });
                            }
                          }}
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {coverImageFile && (
                        <p className="text-xs text-green-600">Selected: {coverImageFile.name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Upload an image file from your device</p>
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-1">This will be the main product image</p>
                </div>
                <div>
                  <Label>Additional Images</Label>
                  <Tabs defaultValue="url" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">Add by URL</TabsTrigger>
                      <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter image URL"
                          value={additionalImageInput}
                          onChange={(e) => setAdditionalImageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addAdditionalImage();
                            }
                          }}
                        />
                        <Button type="button" onClick={addAdditionalImage} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="upload" className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              setAdditionalImageFiles((prev) => [...prev, ...files]);
                            }
                          }}
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {additionalImageFiles.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-green-600">
                            {additionalImageFiles.length} file(s) selected
                          </p>
                          {additionalImageFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-1 bg-muted rounded">
                              <span className="truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => {
                                  setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== idx));
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  {formData.image_urls && formData.image_urls.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs text-muted-foreground">Current images - use arrows to reorder</p>
                      {formData.image_urls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveImage(index, index - 1)}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveImage(index, index + 1)}
                              disabled={index === formData.image_urls!.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
                          <img src={url} alt={`Additional ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                          <span className="text-sm flex-1 truncate">{url}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAdditionalImage(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sku">Garment ID (SKU) *</Label>
                    <Input
                      id="sku"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size || ''}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="style_code">Style Code</Label>
                    <Input
                      id="style_code"
                      value={formData.style_code || ''}
                      onChange={(e) => setFormData({ ...formData, style_code: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="material">Material *</Label>
                  <Input
                    id="material"
                    value={formData.material || ''}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="care_instructions">Care Instructions</Label>
                  <Textarea
                    id="care_instructions"
                    value={formData.care_instructions || ''}
                    onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom_size_available"
                    checked={formData.custom_size_available || false}
                    onChange={(e) => setFormData({ ...formData, custom_size_available: e.target.checked })}
                  />
                  <Label htmlFor="custom_size_available">Custom Size Available</Label>
                </div>
                <div>
                  <Label>Measurements (inches)</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="chest_in" className="text-xs text-muted-foreground">Chest</Label>
                      <Input
                        id="chest_in"
                        type="number"
                        step="0.1"
                        value={formData.measurements?.chest_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          measurements: { ...formData.measurements, chest_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sleeve_in" className="text-xs text-muted-foreground">Sleeve</Label>
                      <Input
                        id="sleeve_in"
                        type="number"
                        step="0.1"
                        value={formData.measurements?.sleeve_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          measurements: { ...formData.measurements, sleeve_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="waist_in" className="text-xs text-muted-foreground">Waist</Label>
                      <Input
                        id="waist_in"
                        type="number"
                        step="0.1"
                        value={formData.measurements?.waist_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          measurements: { ...formData.measurements, waist_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="top_length_in" className="text-xs text-muted-foreground">Top Length</Label>
                      <Input
                        id="top_length_in"
                        type="number"
                        step="0.1"
                        value={formData.measurements?.top_length_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          measurements: { ...formData.measurements, top_length_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bottom_length_in" className="text-xs text-muted-foreground">Bottom Length</Label>
                      <Input
                        id="bottom_length_in"
                        type="number"
                        step="0.1"
                        value={formData.measurements?.bottom_length_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          measurements: { ...formData.measurements, bottom_length_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Model Information</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="model_height_in" className="text-xs text-muted-foreground">Height (in)</Label>
                      <Input
                        id="model_height_in"
                        type="number"
                        step="0.1"
                        value={formData.model_info?.height_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          model_info: { ...formData.model_info, height_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_bust_in" className="text-xs text-muted-foreground">Bust (in)</Label>
                      <Input
                        id="model_bust_in"
                        type="number"
                        step="0.1"
                        value={formData.model_info?.bust_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          model_info: { ...formData.model_info, bust_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_waist_in" className="text-xs text-muted-foreground">Waist (in)</Label>
                      <Input
                        id="model_waist_in"
                        type="number"
                        step="0.1"
                        value={formData.model_info?.waist_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          model_info: { ...formData.model_info, waist_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_hips_in" className="text-xs text-muted-foreground">Hips (in)</Label>
                      <Input
                        id="model_hips_in"
                        type="number"
                        step="0.1"
                        value={formData.model_info?.hips_in ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          model_info: { ...formData.model_info, hips_in: parseFloat(e.target.value) || undefined },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_wearing_size" className="text-xs text-muted-foreground">Wearing Size</Label>
                      <Input
                        id="model_wearing_size"
                        value={formData.model_info?.wearing_size ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          model_info: { ...formData.model_info, wearing_size: e.target.value || undefined },
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Shipping Dimensions *</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <div>
                      <Label htmlFor="weight_kg" className="text-xs text-muted-foreground">Weight (kg) *</Label>
                      <Input
                        id="weight_kg"
                        type="number"
                        step="0.01"
                        value={formData.weight_kg ?? ''}
                        onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || undefined })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="length_cm" className="text-xs text-muted-foreground">Length (cm) *</Label>
                      <Input
                        id="length_cm"
                        type="number"
                        step="0.1"
                        value={formData.length_cm ?? ''}
                        onChange={(e) => setFormData({ ...formData, length_cm: parseFloat(e.target.value) || undefined })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="width_cm" className="text-xs text-muted-foreground">Width (cm) *</Label>
                      <Input
                        id="width_cm"
                        type="number"
                        step="0.1"
                        value={formData.width_cm ?? ''}
                        onChange={(e) => setFormData({ ...formData, width_cm: parseFloat(e.target.value) || undefined })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="height_cm" className="text-xs text-muted-foreground">Height (cm) *</Label>
                      <Input
                        id="height_cm"
                        type="number"
                        step="0.1"
                        value={formData.height_cm ?? ''}
                        onChange={(e) => setFormData({ ...formData, height_cm: parseFloat(e.target.value) || undefined })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="hs_code" className="text-xs text-muted-foreground">HS / Commodity Code (required for international shipments) *</Label>
                    <Input
                      id="hs_code"
                      placeholder="e.g. 6203.3200.00"
                      value={formData.hs_code || ''}
                      onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })}
                      className="w-48"
                      required
                    />
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_bundle"
                      checked={formData.is_bundle || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_bundle: e.target.checked,
                        // A bundle can't also be someone else's component
                        bundle_id: e.target.checked ? undefined : formData.bundle_id,
                      })}
                    />
                    <Label htmlFor="is_bundle">This product is a Set (e.g. a tuxedo made of separate pieces)</Label>
                  </div>

                  {formData.is_bundle ? (
                    <p className="text-xs text-muted-foreground">
                      Save this set, then edit each piece (jacket, trousers, etc.) and set its "Belongs to Set" field to this set.
                      Its stock is the number of complete sets currently buildable from those pieces' stock.
                    </p>
                  ) : (
                    <div>
                      <Label>Belongs to Set (optional)</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="bundle_id" className="text-xs text-muted-foreground">Set</Label>
                          <Select
                            value={formData.bundle_id || 'none'}
                            onValueChange={(value) => setFormData({ ...formData, bundle_id: value === 'none' ? undefined : value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Not part of a set" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Not part of a set</SelectItem>
                              {bundles
                                ?.filter((b) => b.id !== editingProduct?.id)
                                .map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.name} ({b.sku || 'no SKU'})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bundle_role" className="text-xs text-muted-foreground">Role in Set</Label>
                          <Input
                            id="bundle_role"
                            placeholder="e.g. Jacket, Trousers"
                            value={formData.bundle_role || ''}
                            onChange={(e) => setFormData({ ...formData, bundle_role: e.target.value })}
                          />
                        </div>
                      </div>
                      {formData.bundle_id && (
                        <div className="mt-2">
                          <Label htmlFor="bundle_quantity" className="text-xs text-muted-foreground">Quantity required per set</Label>
                          <Input
                            id="bundle_quantity"
                            type="number"
                            min={1}
                            className="w-32"
                            value={formData.bundle_quantity ?? 1}
                            onChange={(e) => setFormData({ ...formData, bundle_quantity: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Gender * (select one or more)</Label>
                  <div className="flex gap-4 mt-2">
                    {(['men', 'women', 'unisex'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`gender-${option}`}
                          checked={formData.gender?.includes(option) || false}
                          onChange={(e) => {
                            const current = formData.gender || [];
                            setFormData({
                              ...formData,
                              gender: e.target.checked
                                ? [...current, option]
                                : current.filter((g) => g !== option),
                            });
                          }}
                        />
                        <Label htmlFor={`gender-${option}`} className="capitalize font-normal">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="on_sale"
                      checked={formData.on_sale}
                      onChange={(e) => setFormData({ ...formData, on_sale: e.target.checked })}
                    />
                    <Label htmlFor="on_sale">On Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="in_stock"
                      checked={formData.in_stock}
                      onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    />
                    <Label htmlFor="in_stock">In Stock</Label>
                  </div>
                </div>
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createProduct.isPending || updateProduct.isPending || isUploading}
                  >
                    {isUploading
                      ? 'Uploading images...'
                      : editingProduct
                        ? 'Update Product'
                        : 'Create Product'
                    }
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name, category, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
            {products && products.length > 0 && (
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {searchQuery
                  ? `Showing ${filteredProducts?.length || 0} of ${products.length} products`
                  : `${products.length} total products`}
              </p>
            )}
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    <SortIcon column="name" />
                  </div>
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Size</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    <SortIcon column="category" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    <SortIcon column="price" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center">
                    Stock
                    <SortIcon column="stock" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-20 object-cover rounded-md"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                      {product.is_bundle && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary align-middle">SET</span>
                      )}
                      {product.bundle_id && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground align-middle">
                          {product.bundle_role || 'piece'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.size || '—'}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? (
                      <div className="space-y-2">
                        <p>No products match your search "{searchQuery}"</p>
                        <Button variant="link" onClick={() => setSearchQuery('')}>
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      'No products found. Create your first product!'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

