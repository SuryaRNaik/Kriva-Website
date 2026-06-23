"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import BackButton from "@/components/BackButton";
import type { CustomerDetails, RazorpayOptions, CreateOrderResponse } from "@/types/payment";

// ─────────────────────────────────────────────────────────────
// UPCOMING WORKSHOPS — Edit this array to add/remove workshops.
// To show a workshop: add an object to the array below.
// To hide all workshops (Coming Soon mode): leave the array empty → []
// ─────────────────────────────────────────────────────────────
const UPCOMING_WORKSHOPS = [
  {
    id: "tw-jan-2025",
    title: "Tanjore Painting — Beginner Batch",
    date: "Saturday, 25 January 2025",
    time: "10:00 AM – 1:00 PM",
    duration: "3 hours",
    location: "Bengaluru Studio",
    price: "₹5",
    numericPrice: 5,
    seatsLeft: 6,
    totalSeats: 12,
    description: "Learn the basics of traditional Tanjore painting — gold foil application, gesso work, and iconic deity motifs.",
  }
];
// ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Priya M.",
    city: "Bengaluru",
    initials: "PM",
    rating: 5,
    quote: "Really enjoyed the session. Ruchitha explains everything clearly and the pace was perfect for a beginner like me.",
  },
  {
    name: "Ananya R.",
    city: "Chennai",
    initials: "AR",
    rating: 5,
    quote: "The Tanjore workshop was a great experience. Came home with a painting I'm actually proud of.",
  },
  {
    name: "Kavitha S.",
    city: "Hyderabad",
    initials: "KS",
    rating: 5,
    quote: "Lovely atmosphere, very patient instructor. Would definitely attend another one.",
  },
];

const WHAT_YOU_LEARN = [
  {
    icon: "◈",
    title: "Traditional Techniques",
    desc: "Learn authentic Tanjore methods passed down through generations — gesso work, gold foil application, and gem setting.",
  },
  {
    icon: "◈",
    title: "Deity Motifs",
    desc: "Paint iconic subjects like Ganesha, Lakshmi, and Krishna with the characteristic raised relief and jewel-like finish.",
  },
  {
    icon: "◈",
    title: "Materials & Tools",
    desc: "Understand which boards, paints, and gold foils to use and how to care for your artwork long-term.",
  },
  {
    icon: "◈",
    title: "Finish & Framing",
    desc: "Complete your painting with the final detailing and glazing steps that give Tanjore art its signature luminous look.",
  },
];

const FAQS = [
  {
    q: "Do I need any prior art experience?",
    a: "Not at all. Workshops are designed for complete beginners. All you need to bring is curiosity.",
  },
  {
    q: "Are materials included in the fee?",
    a: "Yes — boards, paints, gold foil, brushes, and all other materials are included. Nothing extra to buy.",
  },
  {
    q: "Are sessions online or in-person?",
    a: "Currently in-person at our Bengaluru studio. Online batches may be introduced based on interest.",
  },
  {
    q: "How do I confirm my seat and pay?",
    a: "Select your batch below and pay securely via Razorpay. You will immediately receive a confirmation email with venue details.",
  },
];

export default function WorkshopsPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // For booking
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(UPCOMING_WORKSHOPS[0]?.id || "");
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: "Workshop Booking", // Default dummy address for workshop
    city: "",
    pincode: "",
  });

  const hasWorkshops = UPCOMING_WORKSHOPS.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Waitlist Submit (When NO workshops available)
  const handleWaitlistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", "0b8ee4b0-c31a-494e-8011-41a8077b8cc4");
    formData.append("subject", "Kriva Studio — Workshop Waitlist");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        form.reset();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Payment Submit (When workshops ARE available)
  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isScriptLoaded) {
      alert("Payment gateway is still loading. Please wait a moment.");
      return;
    }

    const workshop = UPCOMING_WORKSHOPS.find(w => w.id === selectedWorkshopId);
    if (!workshop) return;

    setSubmitting(true);

    try {
      // 1. Create order on backend
      const amountInPaise = workshop.numericPrice * 100;
      
      const createOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `ws_${Date.now()}`,
          notes: {
            customer_name: customer.name,
            customer_email: customer.email,
            workshop_id: workshop.id,
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
        description: `Booking: ${workshop.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: { color: "#C9A227" },
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
                items: [],
                totalAmount: workshop.numericPrice,
                orderType: "workshop",
                workshopDetails: {
                  title: workshop.title,
                  date: workshop.date,
                  time: workshop.time,
                  location: workshop.location,
                }
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              localStorage.setItem("kriva_workshop_order", JSON.stringify({
                orderId: verifyData.orderId,
                amount: workshop.numericPrice,
                email: customer.email
              }));
              router.push("/workshops/success");
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
            setSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        setSubmitting(false);
        router.push("/failure");
      });
      rzp.open();

    } catch (error: any) {
      console.error("Payment initiation error:", error);
      alert(error.message || "Failed to initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2]">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {/* ── Hero Banner ── */}
      <div
        className="relative pt-36 pb-20 px-6 text-center overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #FAF8F2 0%, #F5F0E6 50%, #FAF8F2 100%)",
        }}
      >
        <div className="absolute top-24 left-6 z-10">
          <BackButton />
        </div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(201,162,39,0.06) 0%, transparent 70%)" }}
        />
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A227]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A227]" />
        </div>
        <p className="text-[11px] tracking-[0.35em] uppercase text-[#C9A227] font-medium mb-4">
          Kriva Studio · Bengaluru
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold text-[#2B2B2B] mb-5 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Art Workshops
        </h1>
        <p className="text-[#5A5548] text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-4">
          Learn the timeless craft of Tanjore painting in small, hands-on batches led by Ruchitha Reddy.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-[#2B2B2B]"
          style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 100%)" }}>
          Tanjore Painting · All Skill Levels Welcome
        </div>
      </div>

      {/* ── Upcoming Workshops or Coming Soon ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {hasWorkshops ? (
          <>
            <div className="text-center mb-10">
              <p className="text-xs tracking-[0.3em] uppercase text-[#C9A227] mb-2 font-medium">Upcoming</p>
              <h2 className="text-3xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Open Batches
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {UPCOMING_WORKSHOPS.map((ws) => {
                const pct = Math.round(((ws.totalSeats - ws.seatsLeft) / ws.totalSeats) * 100);
                const almostFull = ws.seatsLeft <= 3;
                return (
                  <div
                    key={ws.id}
                    className="bg-white rounded-2xl border border-[#E8DCC8] p-8 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {ws.title}
                      </h3>
                      <span
                        className="shrink-0 px-3 py-1 rounded-full text-xs font-bold text-[#2B2B2B]"
                        style={{ background: "linear-gradient(135deg, #F0D97A, #C9A227)" }}
                      >
                        {ws.price}
                      </span>
                    </div>
                    <p className="text-sm text-[#8A8070] leading-relaxed">{ws.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-[#5A5548]">
                      <span>📅 {ws.date}</span>
                      <span>🕙 {ws.time}</span>
                      <span>⏱ {ws.duration}</span>
                      <span>📍 {ws.location}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#8A8070] mb-1">
                        <span>{almostFull ? `⚡ Only ${ws.seatsLeft} seats left!` : `${ws.seatsLeft} of ${ws.totalSeats} seats available`}</span>
                        <span>{pct}% filled</span>
                      </div>
                      <div className="h-1.5 bg-[#F5F0E6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #F0D97A, #C9A227)" }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedWorkshopId(ws.id);
                        document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-[#2B2B2B] transition-all hover:opacity-90 hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
                    >
                      Book This Batch →
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ── Coming Soon state ── */
          <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm overflow-hidden">
            <div
              className="px-10 py-14 text-center relative"
              style={{ background: "linear-gradient(160deg, #2B2B2B 0%, #1A1A2E 100%)" }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
                <svg viewBox="0 0 300 300" width="300" height="300" fill="none">
                  {[30, 60, 90, 120, 140].map((r) => (
                    <circle key={r} cx="150" cy="150" r={r} stroke="#C9A227" strokeWidth="0.8" strokeDasharray="3 5" />
                  ))}
                </svg>
              </div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#C9A227] font-medium mb-5 relative z-10">
                Coming Soon
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4 relative z-10"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                No Workshops Scheduled <br className="hidden sm:block" />Right Now
              </h2>
              <p className="text-white/65 text-sm sm:text-base max-w-md mx-auto leading-relaxed relative z-10">
                We run Tanjore painting workshops regularly in small batches. Fill in the form below and you'll be the first to know when the next one is announced.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── What You'll Learn ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A227] mb-2 font-medium">The Workshop</p>
            <h2 className="text-3xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              What You&apos;ll Learn
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-[#E8DCC8]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <div className="h-px w-12 bg-[#E8DCC8]" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHAT_YOU_LEARN.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-[#E8DCC8] hover:border-[#C9A227] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-[#C9A227] text-lg font-bold"
                  style={{ background: "linear-gradient(135deg, #FAF8F2, #F5F0E6)" }}
                >
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </h3>
                <p className="text-xs text-[#8A8070] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form (Booking or Waitlist) ── */}
      <section id="waitlist-form" className="py-16 bg-[#FAF8F2]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A227] mb-2 font-medium">
              {hasWorkshops ? "Secure Your Seat" : "Stay Updated"}
            </p>
            <h2 className="text-3xl font-bold text-[#2B2B2B] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              {hasWorkshops ? "Book Your Workshop" : "Join the Waitlist"}
            </h2>
            <p className="text-sm text-[#8A8070]">
              {hasWorkshops
                ? "Enter your details and pay securely. An instant confirmation email will be sent to you."
                : "We'll notify you first when the next Tanjore workshop is announced."}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-sm p-8">
            {submitted && !hasWorkshops ? (
              <div className="text-center py-10">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 100%)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2B2B2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold text-[#2B2B2B] mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  You&apos;re on the list!
                </h3>
                <p className="text-sm text-[#8A8070] max-w-sm mx-auto">
                  We&apos;ll email you as soon as the next Tanjore painting workshop is announced.
                </p>
              </div>
            ) : (
              <form onSubmit={hasWorkshops ? handlePaymentSubmit : handleWaitlistSubmit} className="flex flex-col gap-5">
                
                {hasWorkshops && (
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Select Batch *
                    </label>
                    <select
                      name="workshopId"
                      required
                      value={selectedWorkshopId}
                      onChange={(e) => setSelectedWorkshopId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] bg-white transition-all"
                    >
                      {UPCOMING_WORKSHOPS.map(ws => (
                        <option key={ws.id} value={ws.id}>
                          {ws.title} — {ws.date} ({ws.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      required
                      value={customer.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      value={customer.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                    Phone Number {hasWorkshops ? "*" : <span className="text-[#aaa] font-normal normal-case">(optional)</span>}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required={hasWorkshops}
                    placeholder="+91 98765 43210"
                    value={customer.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] transition-all"
                  />
                </div>

                {!hasWorkshops && (
                  <div>
                    <label className="block text-xs font-bold text-[#444] uppercase tracking-wide mb-2">
                      Preferred Schedule *
                    </label>
                    <select
                      name="preferred_schedule"
                      required
                      defaultValue=""
                      className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none text-sm text-[#2B2B2B] bg-white transition-all"
                    >
                      <option value="" disabled>Select your preference…</option>
                      <option value="Weekends">Weekends</option>
                      <option value="Weekday Evenings">Weekday Evenings</option>
                      <option value="No Preference">No Preference</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 py-4 rounded-xl text-[#2B2B2B] font-bold text-sm tracking-wide transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting 
                    ? "Processing..." 
                    : hasWorkshops 
                      ? `Pay ${UPCOMING_WORKSHOPS.find(w => w.id === selectedWorkshopId)?.price || ""} via Razorpay` 
                      : "Notify Me When a Workshop Opens →"
                  }
                </button>
                <p className="text-center text-xs text-[#aaa]">
                  {hasWorkshops ? "Secure payments handled by Razorpay. An email receipt will be sent automatically." : "Your details are sent securely to the studio and will never be shared."}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A227] mb-2 font-medium">Past Students</p>
            <h2 className="text-3xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              What They Said
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-[#E8DCC8]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
              <div className="h-px w-12 bg-[#E8DCC8]" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-[#E8DCC8] flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#2B2B2B] shrink-0"
                    style={{ background: "linear-gradient(135deg, #F0D97A, #C9A227)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2B2B2B]">{t.name}</p>
                    <p className="text-xs text-[#8A8070]">{t.city}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-[#C9A227] text-xs">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#5A5548] leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-[#FAF8F2]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A227] mb-2 font-medium">FAQ</p>
            <h2 className="text-3xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Common Questions
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8DCC8] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-[#2B2B2B]">{faq.q}</span>
                  <span
                    className="ml-4 shrink-0 text-[#C9A227] text-lg font-light transition-transform duration-300"
                    style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#8A8070] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
