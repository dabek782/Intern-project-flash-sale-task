"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter , useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Ticket, CheckCircle2 } from "lucide-react";

export default function TicketBookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams= useSearchParams();
  const ticketId = params.ticketId as string;
  const existingOrderId = searchParams.get("orderId");
  
  const [step, setStep] = useState<"reserve" | "pay" | "success">(existingOrderId ? "pay" : "reserve");
  const [orderId, setOrderId] = useState<string | null>(existingOrderId);
  const [provider, setProvider] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  useEffect(() => {
    if (step !== "pay" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep("reserve");
          setOrderId(null);
          setError("Your reservation expired. The ticket has been released back to the pool.");
          return 300; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleReserve = async () => {
    setIsLoading(true);
    setError(null);
    console.log(ticketId)

    try {
      const res = await fetch("http://localhost:3000/v3/orders/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ ticketId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to reserve ticket. It might be sold out.");
      }

      const data = await res.json();
      setOrderId(data.orderId);
      setTimeLeft(data.expiresInSeconds || 300); 
      setStep("pay");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !provider.trim()) {
      setError("Please specify a payment provider.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/v3/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Payment failed. Please try again.");
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 flex items-center justify-center font-sans">
      <section className="w-full max-w-lg px-6">
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              Secure Your Tickets
            </CardTitle>
            <CardDescription className="text-slate-300">
              {step === "reserve" ? "Check availability and reserve." : "Complete your payment."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium">
                {error}
              </div>
            )}

            {step === "reserve" && (
              <div className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-lg text-slate-700">Ready to secure your spot?</h3>
                  <p className="text-sm text-slate-500">
                    Click below to lock in your ticket. Once reserved, you will have 5 minutes to complete your payment before the ticket is released.
                  </p>
                </div>
                
                <Button 
                  onClick={handleReserve} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
                >
                  {isLoading ? "Locking in ticket..." : "Reserve Ticket Now"}
                </Button>
              </div>
            )}


            {step === "pay" && (
              <form onSubmit={handlePay} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Ticket Reserved!
                  </div>
                  <div className="text-2xl font-bold tabular-nums">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="grid gap-3 pt-4">
                  <Label htmlFor="provider" className="text-base font-semibold text-slate-800">
                    Write Payment Provider Name
                  </Label>
                  <Input 
                    id="provider"
                    placeholder="e.g., Stripe, PayPal, BLIK"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-12"
                  />
                  <p className="text-xs text-slate-500">
                    For now, manually type the provider to simulate the integration.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !provider.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 mt-4"
                >
                  {isLoading ? "Processing..." : "Complete Payment"}
                </Button>
              </form>
            )}


            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <CheckCircle2 className="w-24 h-24 text-green-500 mb-2" />
                <h2 className="text-3xl font-bold text-slate-900">Order Confirmed!</h2>
                <p className="text-slate-600">
                  Your payment was successfully processed. Enjoy the event!
                </p>
                <Button 
                  onClick={() => router.push("/events")} 
                  variant="outline"
                  className="mt-6 w-full border-slate-300 text-slate-700 h-12"
                >
                  Browse More Events
                </Button>
              </div>
            )}
          </CardContent>

          {step !== "success" && (
            <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 justify-center rounded-b-xl">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                Order ID: {orderId ? orderId : "Pending Generation"}
              </p>
            </CardFooter>
          )}
        </Card>
      </section>
    </main>
  );
}

//book/[ticketId]/page.tsx is page that allows for reserving tickets and paying.Because of time given for making this projected i opted that for our payment user need to write its payment provider.