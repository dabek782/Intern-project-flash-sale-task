"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Calendar, MapPin } from "lucide-react";

interface Order {
  id: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  event: { name: string; location: string; startDate: string };
  ticket: { title: string; price: number };
}

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/v3/orders/my", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error with your orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "PENDING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mine orders</h1>
        
        {loading ? (
          <p>Loading orders</p>
        ) : orders.length === 0 ? (
          <p className="text-slate-500">You don't have orders yet</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-400">ID: {order.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{order.event.name}</h3>
                    <p className="text-sm font-medium text-blue-600 flex items-center gap-1 mt-1">
                      <Ticket className="w-4 h-4" /> {order.ticket.title} - ${order.ticket.price}
                    </p>
                    <div className="mt-3 text-sm text-slate-500 space-y-1">
                      <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {new Date(order.event.startDate).toLocaleDateString()}</p>
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {order.event.location}</p>
                    </div>
                  </div>
                {order.status === "PENDING" && (
                    <button 
                      onClick={() => router.push(`/book/${order.ticket.id}?orderId=${order.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Finalise payment
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

//myOrders/page.tsx is page that allows you to view what orders you have made so far. Orders in color green are "payed for " , in color red are orders that you didn't payed for or time for paying for them elapsed , and orders in orange are still orders you can pay for using button "finilised payment" which will take to the payment site