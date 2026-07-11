"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, X, UploadCloud, GripVertical, Trash2, ChevronLeft, Eye, Star, StarOff, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { CATEGORY_TITLES } from "@/lib/constants";

type Product = any; // We'll rely on any or detailed type for now for simplicity, since it's a huge schema

export default function ProductForm({ initialData = {}, isEdit = false }: { initialData?: Partial<Product>, isEdit?: boolean }) {
  const router = useRouter();
  
  const defaultProduct = {
    name: "", sku: "", category: "Tanjore Painting", subCategory: "", brand: "",
    shortDescription: "", description: "",
    originalPrice: 0, price: 0, discount: 0,
    images: [], 
    stock: 10, lowStockLimit: 5, status: "Active",
    sizes: [], colors: [], tags: [], material: "", occasion: "", careInstructions: "",
    isFeatured: false, isBestseller: false, isNewArrival: false, isTrending: false, isRecommended: false, displayOrder: 0,
    metaTitle: "", metaDescription: "", metaKeywords: "", slug: "",
  };

  const [formData, setFormData] = useState<Product>({ ...defaultProduct, ...initialData });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setUnsavedChanges(true);
    
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Pricing calculations
  const handlePricingChange = (field: "originalPrice" | "price" | "discount", value: number) => {
    setUnsavedChanges(true);
    const newForm = { ...formData, [field]: value };
    
    if (field === "originalPrice" || field === "price") {
      if (newForm.originalPrice > 0 && newForm.price > 0 && newForm.originalPrice >= newForm.price) {
        newForm.discount = Math.round(((newForm.originalPrice - newForm.price) / newForm.originalPrice) * 100);
      } else {
        newForm.discount = 0;
      }
    } else if (field === "discount") {
      if (newForm.originalPrice > 0 && newForm.discount >= 0 && newForm.discount <= 100) {
        newForm.price = Math.round(newForm.originalPrice * (1 - newForm.discount / 100));
      }
    }
    
    setFormData(newForm);
  };

  const handleArrayChange = (name: string, value: string) => {
    setUnsavedChanges(true);
    const array = value.split(",").map(i => i.trim()).filter(Boolean);
    setFormData({ ...formData, [name]: array });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setUnsavedChanges(true);

    const newImages = [...(formData.images || [])];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const uploadData = new FormData();
      uploadData.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });
        const data = await res.json();
        if (data.success) {
          newImages.push(data.url);
        } else {
          toast.error("Failed to upload " + file.name);
        }
      } catch (err) {
        toast.error("Error uploading " + file.name);
      }
    }

    setFormData({ ...formData, images: newImages });
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setUnsavedChanges(true);
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const setThumbnail = (index: number) => {
    if (index === 0) return;
    setUnsavedChanges(true);
    const newImages = [...formData.images];
    const item = newImages.splice(index, 1)[0];
    newImages.unshift(item);
    setFormData({ ...formData, images: newImages });
  };

  const handleSave = async (statusOverride?: string) => {
    setIsSaving(true);
    
    const finalData = { ...formData };
    if (statusOverride) {
      finalData.status = statusOverride;
    }

    const method = finalData._id ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(finalData._id ? "Product updated" : "Product created");
        setUnsavedChanges(false);
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Failed to save product");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#E8DCC8]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/products")} className="p-2 hover:bg-[#F5F0E6] rounded-xl text-[#8A8070] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#2B2B2B]">{isEdit ? "Edit Product" : "Add New Product"}</h1>
            {isEdit && <p className="text-xs text-[#8A8070]">ID: {formData._id}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave("Inactive")} 
            disabled={isSaving}
            className="px-4 py-2 border border-[#E8DCC8] text-[#5A5548] font-bold rounded-xl hover:bg-[#F5F0E6] transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSave("Active")} 
            disabled={isSaving}
            className="px-6 py-2 bg-[#C9A227] text-white font-bold rounded-xl hover:bg-[#B38D1E] shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : (isEdit ? "Update & Publish" : "Publish Product")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Basic Info */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">1. Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Product Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm font-medium" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Auto-generate if empty" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm font-medium">
                    {Object.values(CATEGORY_TITLES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Sub Category</label>
                  <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Short Description</label>
                <textarea name="shortDescription" rows={2} value={formData.shortDescription} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm resize-none" placeholder="A brief summary for cards and lists..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Full Description</label>
                <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm resize-y" placeholder="Detailed product description..." />
              </div>
            </div>
          </section>

          {/* Section 2: Pricing */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">2. Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Original Price (₹)</label>
                <input type="number" min="0" value={formData.originalPrice} onChange={e => handlePricingChange("originalPrice", parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1 text-green-600">Selling Price (₹) *</label>
                <input type="number" min="0" required value={formData.price} onChange={e => handlePricingChange("price", parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl outline-none focus:border-green-400 text-sm font-bold text-green-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Discount (%)</label>
                <input type="number" min="0" max="100" value={formData.discount} onChange={e => handlePricingChange("discount", parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm font-medium" />
              </div>
            </div>
          </section>

          {/* Section 3: Images */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <div className="flex justify-between items-center border-b border-[#E8DCC8] pb-3">
              <h2 className="font-bold text-lg text-[#2B2B2B]">3. Images</h2>
              <span className="text-xs text-[#8A8070] font-medium">{formData.images?.length || 0} Images</span>
            </div>
            
            <div 
              className="border-2 border-dashed border-[#C9A227]/40 bg-[#FAF8F2] rounded-2xl p-8 text-center hover:bg-[#F5F0E6] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="mx-auto text-[#C9A227] mb-3" size={32} />
              <p className="font-bold text-[#2B2B2B]">Click to upload or drag and drop</p>
              <p className="text-sm text-[#8A8070] mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              {isUploading && <p className="text-[#C9A227] mt-3 font-bold animate-pulse">Uploading...</p>}
            </div>

            {formData.images?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {formData.images.map((img: string, idx: number) => (
                  <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-[#C9A227] shadow-md' : 'border-[#E8DCC8]'}`}>
                    <Image src={img} alt="Product image" fill className="object-cover" unoptimized />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button type="button" onClick={() => setThumbnail(idx)} className="bg-white text-xs px-2 py-1 rounded font-bold text-[#2B2B2B] hover:bg-[#F0D97A]">
                          Make Thumbnail
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-[#C9A227] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">
                        Thumbnail
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Attributes */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">5. Product Attributes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Sizes (comma separated)</label>
                <input type="text" value={formData.sizes?.join(", ")} onChange={e => handleArrayChange("sizes", e.target.value)} placeholder="S, M, L, XL" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Colors (comma separated)</label>
                <input type="text" value={formData.colors?.join(", ")} onChange={e => handleArrayChange("colors", e.target.value)} placeholder="Red, Blue, Gold" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Tags (comma separated)</label>
                <input type="text" value={formData.tags?.join(", ")} onChange={e => handleArrayChange("tags", e.target.value)} placeholder="Summer, Floral, Traditional" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Material</label>
                <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="e.g. Pure Silk, Cotton" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Occasion</label>
                <input type="text" name="occasion" value={formData.occasion} onChange={handleChange} placeholder="e.g. Wedding, Casual" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Care Instructions</label>
                <input type="text" name="careInstructions" value={formData.careInstructions} onChange={handleChange} placeholder="e.g. Dry Clean Only" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
            </div>
          </section>

          {/* Section 7: SEO */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">7. SEO (Search Engine Optimization)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">URL Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated from title if empty" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Meta Title</label>
                <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Meta Keywords</label>
                <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} placeholder="kriva, luxury, saree" className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Meta Description</label>
                <textarea name="metaDescription" rows={3} value={formData.metaDescription} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm resize-none" />
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Section 4: Inventory */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">4. Inventory</h2>
            
            <div>
              <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm font-medium">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive (Draft)</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Stock</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Low Stock Limit</label>
                <input type="number" name="lowStockLimit" value={formData.lowStockLimit} onChange={handleChange} className="w-full px-4 py-2.5 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
              </div>
            </div>
            
            <div className="bg-[#F5F0E6] p-4 rounded-xl border border-[#E8DCC8]">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#8A8070] font-medium">Available Stock</span>
                <span className="font-bold text-[#2B2B2B]">{formData.stock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8070] font-medium">Reserved Stock</span>
                <span className="font-bold text-[#2B2B2B]">0</span>
              </div>
            </div>
          </section>

          {/* Section 6: Visibility */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-5">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">6. Visibility</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleChange} className="w-4 h-4 text-[#C9A227] rounded focus:ring-[#C9A227] border-[#E8DCC8]" />
                <span className="text-sm font-semibold text-[#2B2B2B] group-hover:text-[#C9A227] transition-colors">Bestseller</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 text-[#C9A227] rounded focus:ring-[#C9A227] border-[#E8DCC8]" />
                <span className="text-sm font-semibold text-[#2B2B2B] group-hover:text-[#C9A227] transition-colors">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="w-4 h-4 text-[#C9A227] rounded focus:ring-[#C9A227] border-[#E8DCC8]" />
                <span className="text-sm font-semibold text-[#2B2B2B] group-hover:text-[#C9A227] transition-colors">New Arrival</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-4 h-4 text-[#C9A227] rounded focus:ring-[#C9A227] border-[#E8DCC8]" />
                <span className="text-sm font-semibold text-[#2B2B2B] group-hover:text-[#C9A227] transition-colors">Trending</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isRecommended" checked={formData.isRecommended} onChange={handleChange} className="w-4 h-4 text-[#C9A227] rounded focus:ring-[#C9A227] border-[#E8DCC8]" />
                <span className="text-sm font-semibold text-[#2B2B2B] group-hover:text-[#C9A227] transition-colors">Recommended</span>
              </label>
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-1">Display Order</label>
              <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full px-4 py-2 bg-[#FAF8F2] border border-[#E8DCC8] rounded-xl outline-none focus:border-[#C9A227] text-sm" />
            </div>
          </section>

          {/* Section 8: Live Preview */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] space-y-4">
            <h2 className="font-bold text-lg text-[#2B2B2B] border-b border-[#E8DCC8] pb-3">8. Storefront Preview</h2>
            
            <div className="bg-[#FAF8F2] rounded-xl border border-[#E8DCC8] p-4 flex gap-4">
              <div className="w-24 h-32 relative rounded-lg overflow-hidden bg-white shadow-sm border border-[#E8DCC8]/50 flex items-center justify-center">
                {formData.images?.[0] ? (
                  <Image src={formData.images[0]} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <ImageIcon className="text-[#E8DCC8]" />
                )}
                {formData.isBestseller && (
                  <div className="absolute top-1 left-1 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-[#C9A227] shadow-sm">
                    BESTSELLER
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col py-1">
                <p className="text-xs text-[#8A8070] uppercase tracking-wider font-semibold">{formData.category || "Category"}</p>
                <h3 className="text-sm font-bold text-[#2B2B2B] font-serif mt-0.5 line-clamp-2 leading-tight">
                  {formData.name || "Product Name"}
                </h3>
                <div className="mt-auto pt-2 flex items-end justify-between">
                  <div>
                    {formData.originalPrice > formData.price && (
                      <p className="text-[10px] text-[#8A8070] line-through">₹{formData.originalPrice.toLocaleString('en-IN')}</p>
                    )}
                    <p className="text-sm font-bold text-[#C9A227]">
                      ₹{formData.price > 0 ? formData.price.toLocaleString('en-IN') : "0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-[#8A8070] italic">This is how it appears on category pages.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
