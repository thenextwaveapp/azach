import { useState, useEffect } from 'react';
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
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Trash2, Edit, Plus, LogOut, ChevronUp, ChevronDown, Upload, Search, ArrowUpDown, ArrowUp, ArrowDown, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { ProductInsert, ProductUpdate } from '@/types/product';
import { uploadImageToStorage, uploadMultipleImages } from '@/utils/imageUpload';

const Admin = () => {
  // Set page title
  useEffect(() => {
    document.title = "Admin Panel - AZACH";
  }, []);
  const { data: products, isLoading } = useProducts();
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
    stock: 0,
    in_stock: true,
    featured: false,
    on_sale: false,
    gender: undefined,
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
      stock: product.stock,
      in_stock: product.in_stock,
      featured: product.featured,
      on_sale: product.on_sale,
      gender: product.gender,
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
      stock: 0,
      in_stock: true,
      featured: false,
      on_sale: false,
      gender: undefined,
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
        product.gender?.toLowerCase().includes(query) ||
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
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
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
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0, in_stock: parseInt(e.target.value) > 0 })}
                      required
                    />
                  </div>
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
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || ''}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as 'men' | 'women' | 'unisex' | undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <TableCell className="font-medium">{product.name}</TableCell>
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

