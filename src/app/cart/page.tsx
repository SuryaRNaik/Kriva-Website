"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import BackButton from "@/components/BackButton";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FAF8F2]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <div className="mb-10">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-[#E8DCC8]">
            <div className="w-24 h-24 bg-[#F5F0E6] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your cart is empty
            </h2>
            <p className="text-[#8A8070] mb-8 max-w-md mx-auto">
              Looks like you haven't added any of our beautiful handpainted artworks to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-[#2B2B2B] font-semibold shadow-gold hover:opacity-90 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-[#E8DCC8] text-xs font-semibold text-[#8A8070] uppercase tracking-wider bg-[#FAFAF8]">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                
                <div className="divide-y divide-[#E8DCC8]/50">
                  {cart.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-6 items-center">
                      
                      {/* Product Info */}
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0 border border-[#E8DCC8]">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-grow">
                          <Link href={`/shop/${item.id}`} className="font-bold text-[#2B2B2B] hover:text-[#C9A227] hover:underline" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>
                            {item.title}
                          </Link>
                          <p className="text-xs text-[#8A8070] mt-1">{item.subtitle}</p>
                          <p className="text-sm font-semibold text-[#2B2B2B] mt-2 md:hidden">
                            {item.price}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Mobile/Desktop */}
                      <div className="col-span-3 flex justify-between md:justify-center items-center w-full md:w-auto">
                        <span className="md:hidden text-sm font-medium text-[#8A8070]">Quantity</span>
                        <div className="flex items-center border border-[#E8DCC8] rounded-full overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-[#8A8070] hover:text-[#C9A227] hover:bg-[#F5F0E6] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-[#8A8070] hover:text-[#C9A227] hover:bg-[#F5F0E6] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Total & Remove */}
                      <div className="col-span-3 flex justify-between md:justify-end items-center w-full md:w-auto gap-4">
                        <span className="text-lg font-bold text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          ₹{(Number(item.price.replace(/[^0-9.-]+/g,"")) * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#8A8070] hover:text-red-500 transition-colors p-2"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-6 sticky top-28">
                <h3 className="text-xl font-bold text-[#2B2B2B] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Order Summary
                </h3>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-[#666]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#2B2B2B]">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Tax</span>
                    <span className="font-semibold text-[#2B2B2B]">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-[#E8DCC8] pt-4 mb-8 flex justify-between items-center">
                  <span className="font-bold text-[#2B2B2B]">Total</span>
                  <span className="text-2xl font-bold text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[#2B2B2B] font-bold shadow-gold hover:opacity-90 transition-all duration-300 transform active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-[#8A8070] flex items-center justify-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Secure Checkout
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
