"use client";

import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define an interface for the event to keep TypeScript happy if you use it
interface Event {
  id: string | number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch(process.env.URL_FETCH_EVENTS ?? 'http://localhost:3000/v3/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const signedIn = document.cookie.split(';').some((c) => c.trim().startsWith('bookit-signed-in='));
    setIsLoggedIn(signedIn);
  }, []);

  return (
    <main className="min-h-screen text-muted-foreground overflow-y-auto pb-12">
      {/* Navigation (Matches Home Page) */}
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

            {!isLoggedIn ? (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink onClick={(e) => {
                    e.preventDefault();
                    router.push("/register");
                  }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200 cursor-pointer">
                    Register
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200 cursor-pointer">
                    Log in
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#"
                  className="text-lg font-semibold cursor-pointer"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (typeof document !== 'undefined') {
                      document.cookie = 'bookit-signed-in=; Max-Age=0; path=/';
                      const emailCookie = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('bookit-user-email='));
                      const email = emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : undefined;
                      document.cookie = 'bookit-user-email=; Max-Age=0; path=/';
                      if (email) {
                        try {
                          await fetch((process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') + `/v3/auth/logout/${encodeURIComponent(email)}`, {
                            method: 'PUT',
                            credentials: 'include',
                          });
                        } catch (err) {
                          console.warn('Logout request failed', err);
                        }
                      }
                    }
                    setIsLoggedIn(false);
                  }}
                >
                  Sign out
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Events Page Header */}
      <section className="max-w-[1080px] mx-auto px-6 mb-8 text-center">
        <h1 className="text-5xl font-bold text-slate-800 mb-4">Discover Events</h1>
        <p className="text-slate-600 text-lg max-w-[720px] mx-auto">
          Browse our complete catalog of upcoming concerts, sports events, and conferences. 
          Find your next experience and secure your tickets today.
        </p>
      </section>

      {/* Events Grid Section */}
      <section className="max-w-[1080px] mx-auto px-6 grid gap-6">
        <div className="bg-white rounded-[24px] p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)] min-h-[400px]">
          
          {/* Status Messages */}
          {loading && (
            <div className="flex justify-center items-center h-full text-xl text-slate-500">
              Loading events...
            </div>
          )}
          
          {error && (
            <div className="flex justify-center items-center h-full text-xl text-red-500 bg-red-50 p-4 rounded-md">
              Error: {error}
            </div>
          )}
          
          {!loading && !error && events.length === 0 && (
            <div className="flex justify-center items-center h-full text-xl text-slate-500">
              No events available at the moment. Check back soon!
            </div>
          )}

          {/* Render the Grid */}
          {!loading && !error && events.length > 0 && (
            <>
              <p className="text-slate-600 mb-6 font-medium">
                Showing {events.length} available events
              </p>
              
              {/* Responsive Grid instead of fixed widths */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50"
                  >
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1" title={event.name}>
                        {event.name}
                      </h2>
                      <p className="text-sm font-semibold text-blue-600 mb-3">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto border-t border-slate-200 pt-4">
                      <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {event.location}
                      </p>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}