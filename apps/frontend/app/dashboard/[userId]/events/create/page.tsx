"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreateEventDashboard() {
  const params = useParams()
  const userId = params.userId as string
  const router = useRouter()
  
  const [companyId, setCompanyId] = useState<number | null>(null)  
  const [activeTab, setActiveTab] = useState("event")

  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    eventVenue: "",
    venueAddress: "",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
    location: "",
  })

  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    eventId: "",
    type: "REGULAR", 
    status: "OPEN",   
  })

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!userId) return
      try {
        const response = await fetch(`http://localhost:3000/v3/companies/user/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        const data = await response.json()
        const parsedId = typeof data === 'object' ? Number(data.id || data.companyId) : Number(data)
        setCompanyId(isNaN(parsedId) ? null : parsedId)
      } catch (error) {
        console.error("Failed to load company profile context:", error)
      }
    }
    fetchCompanyId()
  }, [userId]) 

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventForm.name.trim()) {
      alert("Validation Error: Event Name is missing.")
      return
    }

    if (!companyId) {
      alert("Error: Company identification context is missing.")
      return
    }

    try {
      const payload = {
        name: String(eventForm.name),
        description: String(eventForm.description),
        eventVenue: String(eventForm.eventVenue),
        venueAddress: String(eventForm.venueAddress),
        status: String(eventForm.status),
        location: String(eventForm.location),
        companyId: companyId, 
        ownerId: userId,
        startDate: eventForm.startDate ? new Date(eventForm.startDate).toISOString() : new Date().toISOString(),
        endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : new Date().toISOString(),
      }

      const response = await fetch("http://localhost:3000/v3/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setTicketForm((prev) => ({ ...prev, eventId: String(data.id) }))
          setActiveTab("tickets")
        }
      } else {
        const errorDetails = await response.json()
        console.error("Backend rejection details:", errorDetails)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyId || !ticketForm.eventId) {
      alert("Error: You must save valid event information details first.")
      return
    }

    try {
      const response = await fetch("http://localhost:3000/v3/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: String(ticketForm.title),
          description: String(ticketForm.description),
          price: parseFloat(ticketForm.price) || 0,
          quantity: parseInt(ticketForm.quantity, 10) || 0,
          eventId: String(ticketForm.eventId),
          type: String(ticketForm.type),
          status: String(ticketForm.status),
          companyId: companyId, 
        }),
      })

      if (response.ok) {
        router.push('/dashboard/' + userId)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator of the event</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" type="button" onClick={() => router.push('/dashboard/' + userId)} className="hover:scale-105 hover:bg-red-500 hover:text-white transition-transform duration-200">
            Cancel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="event">1. Event details</TabsTrigger>
          <TabsTrigger value="tickets">2. Ticket pool</TabsTrigger>
        </TabsList>
        
        <TabsContent value="event" forceMount={true} className={activeTab !== "event" ? "hidden" : ""}>
          <Card>
            <CardHeader>
              <CardTitle>New event</CardTitle>
              <CardDescription>Insert most essential information about that event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="e.g. Summer Music Festival" 
                      value={eventForm.name}
                      onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe that event" 
                      className="min-h-25" 
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventVenue">Venue</Label>
                    <Input 
                      id="eventVenue" 
                      placeholder="Madison square garden" 
                      value={eventForm.eventVenue}
                      onChange={(e) => setEventForm({ ...eventForm, eventVenue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venueAddress">Address</Label>
                    <Input 
                      id="venueAddress" 
                      placeholder="4 Pennsylvania Plaza, New York, NY 10001" 
                      value={eventForm.venueAddress}
                      onChange={(e) => setEventForm({ ...eventForm, venueAddress: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">City (Location)</Label>
                    <Input 
                      id="location" 
                      placeholder="New York" 
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input 
                      id="startDate" 
                      type="datetime-local" 
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End date</Label>
                    <Input 
                      id="endDate" 
                      type="datetime-local" 
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>  
                <Button type="submit" className="mt-6 bg-blue-500 text-white hover:bg-blue-600">Save Event details & Proceed</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" forceMount={true} className={activeTab !== "tickets" ? "hidden" : ""}>
          <Card>
            <CardHeader>
              <CardTitle>Ticket pool</CardTitle>
              <CardDescription>Configure what tickets will be available for customers to buy.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title visible to customer</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. VIP Ticket - Presale" 
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ticketDescription">Ticket description</Label>
                    <Textarea 
                      id="ticketDescription" 
                      placeholder="What does this ticket include?" 
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="e.g. 199.99" 
                      value={ticketForm.price}
                      onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      placeholder="e.g. 500" 
                      value={ticketForm.quantity}
                      onChange={(e) => setTicketForm({ ...ticketForm, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Ticket type</Label>
                    <Select 
                      value={ticketForm.type} 
                      onValueChange={(value) => setTicketForm({ ...ticketForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="EARLY_BIRD">Early Bird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ticketStatus">Sales status</Label>
                    <Select 
                      value={ticketForm.status} 
                      onValueChange={(value) => setTicketForm({ ...ticketForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventId">Event id</Label>
                    <Input 
                      id="eventId" 
                      type="text" 
                      value={ticketForm.eventId}
                      onChange={(e) => setTicketForm({ ...ticketForm, eventId: e.target.value })}
                      
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-6 bg-green-600 text-white hover:bg-green-700">Add ticket pool & Finish</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

//From this event/create/page.tsx file you can create events give them name descirpion start date and end date as well as location and also create pool of ticket. Beacause of lack of time i didn't implement fully feature with changing stauts of events and tickets