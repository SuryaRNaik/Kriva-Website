"use client";

import { useState, useEffect } from "react";
import { Search, AlertTriangle, Plus, Minus, Box, Save, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  updatedAt: string;
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStockValue, setBulkStockValue] = useState<number>(0);
  const [savingBulk, setSavingBulk] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        if (data.settings?.lowStockThreshold) {
          setLowStockThreshold(data.settings.lowStockThreshold);
        }
      }
    } catch (e) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (_id: string, id: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id, id, stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p._id === _id ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p));
        toast.success("Stock updated");
      } else {
        toast.error("Failed to update stock");
      }
    } catch (e) {
      toast.error("Error updating stock");
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return toast.error("Select products first");
    if (bulkStockValue < 0) return toast.error("Stock cannot be negative");
    
    setSavingBulk(true);
    try {
      const updates = Array.from(selectedIds).map(id => ({
        _id: id,
        stock: bulkStockValue
      }));
      
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (res.ok) {
        toast.success(`Updated stock for ${selectedIds.size} items`);
        setSelectedIds(new Set());
        fetchInventory();
      } else {
        toast.error("Failed to update items");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSavingBulk(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const safeName = p.name || "";
    const safeCategory = p.category || "";
    return safeName.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || safeCategory.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Inventory Management</h2>
          <p className="text-[#8A8070] text-sm mt-1">Track and update your product stock levels.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg text-sm focus:border-[#C9A227] outline-none w-72 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-[#FAF8F2] border border-[#C9A227] rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="bg-[#C9A227] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">
              {selectedIds.size}
            </span>
            <span className="text-sm font-bold text-[#2B2B2B]">Products Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#8A8070] uppercase">Set stock to:</label>
            <input 
              type="number" 
              min="0"
              value={bulkStockValue}
              onChange={e => setBulkStockValue(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-1.5 border border-[#E8DCC8] rounded text-center outline-none focus:border-[#C9A227]"
            />
            <button 
              onClick={handleBulkUpdate}
              disabled={savingBulk}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#C9A227] text-white rounded font-bold hover:bg-[#B38D1E] transition-colors disabled:opacity-70 text-sm shadow-sm"
            >
              <Save size={16} /> {savingBulk ? "Saving..." : "Apply Bulk Update"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">Loading inventory...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DCC8] flex flex-col items-center">
          <Box size={48} className="text-[#E8DCC8] mb-4" />
          <p className="text-[#5A5548] font-medium">No products found.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 px-1">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-[#8A8070] hover:text-[#2B2B2B] transition-colors font-bold">
              {selectedIds.size === filteredProducts.length ? <CheckSquare size={18} className="text-[#C9A227]" /> : <Square size={18} />}
              Select All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= lowStockThreshold && product.stock > 0;
              const isOutOfStock = product.stock === 0;
              const isSelected = selectedIds.has(product._id);

              return (
                <div 
                  key={product._id} 
                  className={`bg-white rounded-2xl border transition-all flex flex-col relative ${
                    isSelected ? 'border-[#C9A227] shadow-md ring-1 ring-[#C9A227]' :
                    isOutOfStock ? 'border-red-200 shadow-sm' : 
                    isLowStock ? 'border-yellow-200 shadow-sm' : 'border-[#E8DCC8] shadow-sm hover:shadow-md'
                  }`}
                >
                  <button 
                    onClick={() => toggleSelect(product._id)}
                    className="absolute top-4 right-4 z-10 text-[#8A8070] hover:text-[#C9A227] transition-colors bg-white rounded-sm"
                  >
                    {isSelected ? <CheckSquare size={20} className="text-[#C9A227]" /> : <Square size={20} />}
                  </button>

                  <div className={`px-5 py-4 border-b flex-1 ${isOutOfStock ? 'bg-red-50/50 border-red-100' : isLowStock ? 'bg-yellow-50/50 border-yellow-100' : 'bg-[#FAF8F2] border-[#E8DCC8]'}`}>
                    <div className="flex justify-between items-start mb-2 pr-6">
                      <span className="text-[10px] font-bold text-[#8A8070] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#E8DCC8]">{product.category}</span>
                      {isOutOfStock ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          <AlertTriangle size={10} /> OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                          <AlertTriangle size={10} /> LOW STOCK
                        </span>
                      ) : null}
                    </div>
                    
                    <h3 className="font-serif font-bold text-[#2B2B2B] text-lg leading-tight mt-3 mb-1 line-clamp-2 pr-6">{product.name}</h3>
                    <p className="text-xs text-[#8A8070] font-mono">SKU: {product.sku || 'N/A'}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-bold text-[#C9A227] text-lg">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-b-2xl">
                    <label className="block text-[10px] font-bold text-[#8A8070] uppercase tracking-wider mb-2 text-center">Current Stock</label>
                    <div className="flex items-center justify-between gap-3 bg-[#FAF8F2] p-2 rounded-xl border border-[#E8DCC8]">
                      <button 
                        onClick={() => updateProductStock(product._id, product.id, product.stock - 1)}
                        disabled={product.stock === 0}
                        className="w-10 h-10 rounded-lg bg-white border border-[#E8DCC8] flex items-center justify-center text-[#5A5548] hover:bg-[#E8DCC8] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      
                      <input 
                        type="number" 
                        value={product.stock}
                        onChange={(e) => updateProductStock(product._id, product.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-10 text-center font-bold text-lg bg-transparent outline-none text-[#2B2B2B]"
                      />
                      
                      <button 
                        onClick={() => updateProductStock(product._id, product.id, product.stock + 1)}
                        className="w-10 h-10 rounded-lg bg-white border border-[#E8DCC8] flex items-center justify-center text-[#5A5548] hover:bg-[#E8DCC8] hover:text-black transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    
                    {product.stock > 0 && (
                      <button 
                        onClick={() => updateProductStock(product._id, product.id, 0)}
                        className="w-full mt-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Mark as Out of Stock
                      </button>
                    )}
                    
                    {product.updatedAt && (
                      <p className="text-center text-[10px] text-[#8A8070] mt-3">
                        Updated: {new Date(product.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
