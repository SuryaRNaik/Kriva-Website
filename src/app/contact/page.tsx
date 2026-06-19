"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", "0b8ee4b0-c31a-494e-8011-41a8077b8cc4");
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) { setIsSuccess(true); form.reset(); }
      else { alert("Something went wrong. Please try again."); }
    } catch { alert("Network error. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F2", paddingTop: "120px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        {/* Back button */}
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A227", marginBottom: "12px", fontWeight: 600 }}>We are Here to Help</p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "#2B2B2B", fontFamily: "Georgia, serif", marginBottom: "16px" }}>Contact Us</h1>
          <p style={{ color: "#666", maxWidth: "500px", margin: "0 auto", fontSize: "14px", lineHeight: 1.7 }}>
            Order issues, complaints, website suggestions — send us a message and the studio owner will receive it directly.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
          <div style={{ flex: "1 1 240px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#2B2B2B", marginBottom: "24px" }}>Studio Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { label: "Email", val: "krivaartsstudio@gmail.com", sub: "Orders, custom requests & support" },
                { label: "Phone", val: "+91 99648 77270", sub: "Mon–Fri, 10am – 6pm IST" },
                { label: "Studio", val: "Bengaluru", sub: "Karnataka 560001" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#F5F0E6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#C9A227" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#2B2B2B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{item.label}</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#C9A227" }}>{item.val}</p>
                    <p style={{ fontSize: "12px", color: "#8A8070" }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "32px", padding: "20px", borderRadius: "16px", background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)", color: "#2B2B2B" }}>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>Custom Artwork?</p>
              <p style={{ fontSize: "12px", opacity: 0.85, lineHeight: 1.6 }}>Select &quot;Custom Order Request&quot; from the dropdown and describe what you have in mind. We love creating one-of-a-kind pieces!</p>
            </div>
          </div>

          <div style={{ flex: "2 1 400px" }}>
            <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", boxShadow: "0 8px 40px rgba(201,162,39,0.08)", border: "1px solid #E8DCC8" }}>
              {isSuccess ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: "64px", height: "64px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
                  </div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#2B2B2B", marginBottom: "10px" }}>Message Sent!</h3>
                  <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>The studio owner has received your message and will get back to you within 24 hours.</p>
                  <button onClick={() => setIsSuccess(false)} style={{ padding: "10px 28px", borderRadius: "999px", border: "2px solid #C9A227", color: "#C9A227", background: "transparent", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>What is this about? *</label>
                    <select name="subject" required defaultValue="" style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e0e0e0", fontSize: "14px", color: "#2B2B2B", background: "#fff", outline: "none" }}>
                      <option value="" disabled>Select a topic…</option>
                      <option value="Order Issue / Complaint">Order Issue or Complaint</option>
                      <option value="Website UI Feedback">Website UI Feedback / Suggestion</option>
                      <option value="Custom Order Request">Custom Artwork Order Request</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Full Name *</label>
                      <input type="text" name="name" placeholder="Your full name" required style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Email Address *</label>
                      <input type="email" name="email" placeholder="you@example.com" required style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Order Number <span style={{ color: "#aaa", fontWeight: 400, textTransform: "none" }}>(Optional)</span></label>
                    <input type="text" name="order_number" placeholder="e.g. KRIVA-12345" style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Your Message *</label>
                    <textarea name="message" rows={5} placeholder="Describe your issue, suggestion, or inquiry in detail…" required style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e0e0e0", fontSize: "14px", resize: "none", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)", color: "#2B2B2B", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "opacity 0.2s" }}>
                    {isSubmitting ? "Sending…" : "Send Message →"}
                  </button>
                  <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>Your message is sent securely directly to the studio owner.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
