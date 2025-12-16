"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "../../../lib/api";
import { Loader2, AlertCircle, Check, Ticket, Wallet } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function BuyTicket() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_Selection = 6;

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < MAX_Selection) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };
  // Handle form submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || selectedNumbers.length !== MAX_Selection) return;

    setLoading(true);
    try {
      const response = await createCheckoutSession({
        name,
        email,
        selectedNumbers,
      });
      const stripe = await stripePromise;
      if (response.success && stripe) {
        window.location.href = response.sessionUrl;
      } else {
        setError("Payment initialization failed");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "System error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  // Render component
  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-12">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:p-8 text-center sticky top-0 z-10 shadow-sm md:static md:shadow-none">
        <h1 className="text-xl md:text-3xl font-bold text-slate-800">
          Choose Your Numbers
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">
          Select {MAX_Selection} lucky numbers (1-20)
        </p>
      </div>

      <div className="container-official max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Number Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="modern-card p-6 md:p-10">
              <div className="grid grid-cols-5 gap-3 md:gap-6 justify-items-center">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                  const isSelected = selectedNumbers.includes(num);
                  const disabled =
                    !isSelected && selectedNumbers.length >= MAX_Selection;
                  return (
                    <button
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      disabled={disabled}
                      className={`
                        ball-modern relative
                        ${isSelected ? "selected" : ""} 
                        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                        w-12 h-12 md:w-16 md:h-16 text-lg md:text-2xl
                      `}
                    >
                      {num}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <Check
                            size={12}
                            className="text-indigo-600"
                            strokeWidth={4}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile-Only Selection Strip (Visible only on small screens) */}
            <div className="md:hidden modern-card p-4 bg-indigo-50 border-indigo-100">
              <p className="text-xs font-bold text-indigo-800 uppercase mb-2">
                Selected Numbers
              </p>
              <div className="flex justify-between">
                {Array.from({ length: MAX_Selection }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-9 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-white border
                      ${
                        selectedNumbers[i]
                          ? "border-indigo-500 text-indigo-700 shadow-sm"
                          : "border-slate-200 text-slate-300"
                      }
                    `}
                  >
                    {selectedNumbers[i] || "-"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Checkout Form (Desktop Sticky / Mobile Normal) */}
          <div className="lg:col-span-5">
            <div className="modern-card p-6 md:p-8 shadow-lg lg:sticky lg:top-24 border-t-4 border-t-indigo-600">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Ticket className="mr-2 text-indigo-600" /> Ticket Details
              </h3>

              {/* Desktop Selection View */}
              <div className="hidden md:flex gap-2 mb-8 justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                {Array.from({ length: MAX_Selection }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-10 h-12 rounded-lg flex items-center justify-center font-bold text-lg bg-white border-2
                      ${
                        selectedNumbers[i]
                          ? "border-indigo-500 text-indigo-700 shadow-sm"
                          : "border-dashed border-slate-200 text-slate-300"
                      }
                    `}
                  >
                    {selectedNumbers[i] || ""}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    className="input-modern"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Roshan Basnet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-modern"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="border-t border-slate-100 pt-6 mt-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-500 text-sm">Total Price</span>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">
                      $4.00
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-sm border border-rose-100 flex items-center animate-pulse">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />{" "}
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    selectedNumbers.length !== MAX_Selection ||
                    !name ||
                    !email
                  }
                  className="w-full btn-modern-primary py-4 text-lg shadow-xl"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      Purchase Ticket <Wallet className="ml-2 w-5 h-5" />
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
