"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useStore } from "@/context/StoreContext";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";
import type { CustomerDetails, RazorpayOptions, CreateOrderResponse } from "@/types/payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const { data: session, status } = useSession();
  const [savedProfile, setSavedProfile] = useState<any>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/customer/profile")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.customer) {
            setSavedProfile(data.customer);
            setCustomer(prev => ({
              ...prev,
              name: prev.name || data.customer.name || "",
              email: prev.email || data.customer.email || "",
            }));
          }
        })
        .catch(err => console.error("Error fetching profile", err));
    }
  }, [status]);

  const useSavedAddress = () => {
    if (savedProfile) {
      setCustomer({
        name: savedProfile.name || "",
        email: savedProfile.email || "",
        phone: savedProfile.phone || "",
        address: savedProfile.address || "",
        city: savedProfile.city || "",
        pincode: savedProfile.pincode || "",
      });
    }
  };
  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      router.push("/cart");
    }
  }, [cart, router, isSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isScriptLoaded) {
      alert("Payment gateway is still loading. Please wait a moment.");
      return;
    }

    setIsProcessing(true);

    try {
      // 0. Validate stock before proceeding
      const { validateCartStock } = await import("@/actions/stock");
      const itemsToCheck = cart.map(item => ({ id: item.id, quantity: item.quantity }));
      const validationResults = await validateCartStock(itemsToCheck);
      
      let allValid = true;
      for (const result of validationResults) {
        if (!result.valid) {
          allValid = false;
          alert(`Stock issue with one of your items: ${result.error}. Please check your cart.`);
        }
      }

      if (!allValid) {
        setIsProcessing(false);
        router.push("/cart");
        return;
      }

      // 1. Create order on backend
      const amountInPaise = cartTotal * 100;
      
      const createOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customer_name: customer.name,
            customer_email: customer.email,
          },
        }),
      });

      const orderData: CreateOrderResponse = await createOrderRes.json();

      if (!createOrderRes.ok) {
        throw new Error((orderData as any).error || "Failed to create order");
      }

      // 2. Initialize Razorpay Checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Kriva Studio",
        description: "Purchase of Authentic Handcrafted Artworks",
        order_id: orderData.orderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: {
          color: "#C9A227",
        },
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerDetails: customer,
                items: cart,
                totalAmount: cartTotal,
                orderType: "shop",
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsSuccess(true);
              // Store basic order info for success page (mock DB)
              localStorage.setItem("kriva_last_order", JSON.stringify({
                orderId: verifyData.orderId,
                amount: cartTotal,
                email: customer.email
              }));
              router.push("/success");
            } else {
              router.push("/failure");
            }
          } catch (err) {
            console.error("Verification error:", err);
            router.push("/failure");
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.warn("Payment attempt failed:", response.error?.description || "Unknown error");
        setIsProcessing(false);
      });
      rzp.open();

    } catch (error: any) {
      console.error("Payment initiation error:", error);
      alert(error.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return null; // Wait for redirect

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FAF8F2]">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Checkout
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Shipping Details
                </h2>
                {savedProfile && savedProfile.address && (
                  <button 
                    onClick={useSavedAddress}
                    className="text-sm font-semibold text-[#C9A227] hover:underline"
                  >
                    Use Saved Address
                  </button>
                )}
              </div>

              <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={customer.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={customer.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={customer.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={customer.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                    placeholder="House No, Street, Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={customer.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={customer.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                      placeholder="560001"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary & Payment */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-6 sticky top-28">
              <h3 className="text-xl font-bold text-[#2B2B2B] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#2B2B2B] line-clamp-1">{item.title}</p>
                      <p className="text-xs text-[#8A8070]">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-[#2B2B2B]">
                      ₹{(Number(item.price.replace(/[^0-9.-]+/g,"")) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8DCC8] pt-4 mb-6 space-y-3 text-sm">
                <div className="flex justify-between text-[#666]">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#666]">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-[#E8DCC8] pt-4 mb-8 flex justify-between items-center">
                <span className="font-bold text-[#2B2B2B]">Total to Pay</span>
                <span className="text-2xl font-bold text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[#2B2B2B] font-bold shadow-gold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
              >
                {isProcessing ? "Processing..." : `Pay ₹${cartTotal.toLocaleString('en-IN')}`}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-[#8A8070] flex items-center justify-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Secure payments by Razorpay
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
