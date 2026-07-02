"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function TicketCounter({ initialQuantity, ticketId }: { initialQuantity: number, ticketId: string }) {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    const socket = io("http://localhost:3000"); 

    socket.on("ticket_updated", (data: { ticketId: string, quantity: number }) => {
      if (data.ticketId === ticketId) {
        setQuantity(data.quantity);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sm font-semibold text-slate-700">Available tickets:</span>
      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
        {quantity}
      </span>
    </div>
  );
}

//ticket-quantity.tsx file is componets that allows to see how many tickets has left for given event