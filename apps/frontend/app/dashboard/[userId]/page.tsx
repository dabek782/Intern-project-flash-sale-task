
"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const [events, setEvents] = useState<any[]>([])
  const [ticketsQuantitySold, setTicketsQuantitySold] = useState<number>(0)
  const [companyId,setCompanyId] = useState()
  
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:3000/v3/companies/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyId(data.id || data.companyId || data); 
        }
      } catch (error) {
        console.error("Error fetching company ID:", error);
      }
    };
    fetchCompanyId();
  }, [userId]);

 useEffect(() => {
    if (!companyId) return; 

    const fetchEvents = async () => {
      try {

        const response = await fetch(`http://localhost:3000/v3/events/user/${userId}`, {
          credentials: "include",
          headers: { "Content-type": "application/json" },
          method: 'GET'
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

   const fetchTicketsSold = async () => {
      try {
        const response = await fetch(`http://localhost:3000/v3/orders/company/${companyId}/sales-count`);
        if (response.ok) {
          const data = await response.json();
          setTicketsQuantitySold(data.quantity);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    }

    fetchEvents();
    fetchTicketsSold();
  }, [companyId]);
  return (
    <main>
     <nav className="border-b border-gray-400 px-5 py-5 flex flex-row justify-between rounded-md shadow-xl m-auto mb-10">
        <div className="text-2xl font-bold hover:scale-125 transition-transform duration-200 cursor-pointer" onClick={() => router.push("/")}>
          Bookit
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200 cursor-pointer">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink onClick={(e) => {
                e.preventDefault();
                router.push("/events");
              }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200 cursor-pointer text-blue-600">
                Events
              </NavigationMenuLink>
            </NavigationMenuItem> 
          </NavigationMenuList>
        </NavigationMenu>
        </nav>
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="text-muted-foreground">ID of the user: {userId}</p>
        </div>
        <div className="flex gap-4">
          <Button 
            className="bg-blue-500 text-primary-foreground hover:text-blue-600 hover:scale-115 hover:bg-white border-2 border-gray-300 transition-transform duration-200" 
            onClick={() => router.push(`/dashboard/${userId}/events/create`)}
          >
            Create an event
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your active events</CardTitle>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No active events</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total tickets sold</CardTitle>
          </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-slate-900">{ticketsQuantitySold}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed orders</p>
            </CardContent>
        </Card>
      </div>
    </div>
    </main>
  )
}

//In dashboard/[userId]/page.tsx you can see what events your company has as well as how many tickets you sold for all your events. Also from this screen you can create events and tickets for it. 