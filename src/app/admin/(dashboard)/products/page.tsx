"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Plus, Edit2, Trash2, Copy, Eye, MoreVertical, CheckSquare, Square, Download, Filter, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";
import { CATEGORY_TITLES } from "@/lib/constants";

type Product = any; // simplified for this overhaul

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products.filter((p: any) => !p.isTrashed));
      }
    } catch (e) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return toast.error("Select products first");
    if (action === "delete" && !confirm("Permanently delete selected products?")) return;
    
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, productIds: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(data.error || "Bulk action failed");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to move this product to trash?")) return;
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash", productIds: [id] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Moved to trash");
        fetchProducts();
      } else {
        toast.error("Failed to trash");
      }
    } catch (e) {
      toast.error("Error moving to trash");
    }
  };

  const handleDuplicate = async (product: Product) => {
    const { _id, id, sku, slug, createdAt, updatedAt, ...rest } = product;
    
    const newProduct = {
      ...rest,
      name: `${rest.name} (Copy)`,
      status: "Inactive", // Duplicates start as drafts
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product duplicated");
        fetchProducts();
      } else {
        toast.error("Failed to duplicate");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p._id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "SKU", "Category", "Price", "Stock", "Status"];
    const rows = filteredProducts.map(p => [
      p._id, p.name.replace(/,/g, ''), p.sku, p.category, p.price, p.stock, p.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredProducts = products.filter(p => {
    const safeName = p.name || "";
    const matchesSearch = safeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Products</h2>
          <p className="text-[#8A8070] text-sm mt-1">Manage your catalog, pricing, and inventory.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-[#E8DCC8] rounded-xl text-sm font-bold text-[#5A5548] hover:bg-white transition-colors bg-[#FAF8F2]">
            <Download size={16} /> Export
          </button>
          <Link href="/admin/products/new">
            <button className="flex items-center gap-2 px-5 py-2 bg-[#C9A227] text-white rounded-xl font-bold hover:bg-[#B38D1E] transition-colors shadow-sm">
              <Plus size={18} /> Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8DCC8] mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E8DCC8] rounded-xl text-sm focus:border-[#C9A227] outline-none bg-[#FAF8F2]"
            />
          </div>
          
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-[#E8DCC8] rounded-xl text-sm focus:border-[#C9A227] outline-none bg-[#FAF8F2] font-medium text-[#5A5548]"
          >
            <option value="All">All Categories</option>
            {Object.values(CATEGORY_TITLES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-[#E8DCC8] rounded-xl text-sm focus:border-[#C9A227] outline-none bg-[#FAF8F2] font-medium text-[#5A5548]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-[#FAF8F2] border border-[#C9A227]/40 p-3 rounded-xl mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 font-bold text-[#2B2B2B]">
            <CheckSquare size={18} className="text-[#C9A227]" />
            {selectedIds.length} Products Selected
          </div>
          <div className="flex gap-2">
            <select 
              onChange={e => {
                if (e.target.value) handleBulkAction(e.target.value);
                e.target.value = "";
              }}
              className="px-4 py-2 border border-[#E8DCC8] rounded-lg text-sm outline-none bg-white font-medium"
            >
              <option value="">Bulk Actions...</option>
              <option value="publish">Publish</option>
              <option value="archive">Set as Draft</option>
              <option value="bestseller">Mark Bestseller</option>
              <option value="featured">Mark Featured</option>
              <option value="trash">Move to Trash</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#8A8070] font-bold">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DCC8] flex flex-col items-center">
          <Package size={48} className="text-[#E8DCC8] mb-4" />
          <p className="text-[#5A5548] font-medium text-lg">No products found.</p>
          <p className="text-[#8A8070] text-sm mt-1">Try adjusting your filters or add a new product.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#E8DCC8]">
                  <th className="py-4 px-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-[#8A8070] hover:text-[#C9A227]">
                      {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare size={18} className="text-[#C9A227]" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-[#8A8070] uppercase tracking-wider">Product</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#8A8070] uppercase tracking-wider">Inventory</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#8A8070] uppercase tracking-wider">Analytics</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#8A8070] uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#8A8070] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]">
                {filteredProducts.map(product => (
                  <tr key={product._id} className={`hover:bg-[#FAF8F2]/50 transition-colors ${selectedIds.includes(product._id) ? 'bg-[#FAF8F2]' : ''}`}>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => toggleSelect(product._id)} className="text-[#8A8070] hover:text-[#C9A227]">
                        {selectedIds.includes(product._id) ? (
                          <CheckSquare size={18} className="text-[#C9A227]" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative border border-[#E8DCC8] shadow-sm">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <Package size={20} className="text-[#E8DCC8]" />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product._id}`} className="font-bold text-[#2B2B2B] hover:text-[#C9A227] transition-colors truncate max-w-[200px] block">
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#8A8070]">{product.sku || 'No SKU'}</span>
                            <span className="text-[10px] text-[#C9A227] font-bold bg-[#F5F0E6] px-1.5 rounded">{product.category}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#2B2B2B]">₹{product.price.toLocaleString('en-IN')}</span>
                        <span className={`text-xs font-bold ${
                          product.stock === 0 ? 'text-red-500' : 
                          product.stock <= (product.lowStockLimit || 5) ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 text-xs text-[#5A5548]">
                        <span className="flex items-center gap-1"><Eye size={12}/> 1.2k views</span>
                        <span className="flex items-center gap-1"><Package size={12}/> 45 orders</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        product.status === "Active" ? "bg-green-50 border-green-200 text-green-700" : 
                        product.status === "Out of Stock" ? "bg-red-50 border-red-200 text-red-700" :
                        "bg-gray-100 border-gray-200 text-gray-600"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/products/${product._id}`}>
                          <button className="p-2 text-[#5A5548] hover:bg-white hover:text-[#C9A227] rounded-lg transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button onClick={() => handleDuplicate(product)} className="p-2 text-[#5A5548] hover:bg-white hover:text-[#2B2B2B] rounded-lg transition-colors" title="Duplicate">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-[#5A5548] hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Trash">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-[#FAF8F2] border-t border-[#E8DCC8] p-4 text-center text-xs text-[#8A8070] font-medium">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      )}
    </div>
  );
}
