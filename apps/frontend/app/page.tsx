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
export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      console.log("Fetched events:", data);
    } catch (err) {
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
    <main className="min-h-screen  text-muted-foreground overflow-y-auto" >
      <nav className="border-b border-gray-400 px-5 py-5 flex flex-row justify-between rounded-md shadow-xl m-auto " >
      
          <div className="text-2xl font-bold hover:scale-125 transition-transform  duration-200">Bookit</div>
          <NavigationMenu className="flex flex-row gap-4 ">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink onClick={(e)=>{
                  e.preventDefault();
                  router.push("/");
                }}className="text-blue-600 hover:text-blue-700 text-lg font-semibold hover:scale-115 transition-transform duration-200 ">
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              {!isLoggedIn ? (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink onClick={(e) => {
                      e.preventDefault();
                      router.push("/register");
                    }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200" >
                      Register
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink onClick={(e) => {
                      e.preventDefault();
                      router.push("/login");
                    }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200">
                      Log in
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              ) : (
                <NavigationMenuItem>
                  <NavigationMenuLink className="text-lg font-semibold hover:scale-115 transition-transform duration-200"
                    href="#"
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
              {isLoggedIn && 
                <NavigationMenuItem>    
                 <NavigationMenuLink onClick={(e) => {
                      e.preventDefault();
                      router.push("/events");
                    }} className="text-lg font-semibold hover:scale-115 transition-transform duration-200">
                      Events
                      
                    </NavigationMenuLink>
                    </NavigationMenuItem>
              }
            </NavigationMenuList>
          </NavigationMenu>
      </nav>

     <section id="home" className="max-w-270 mx-auto py-16 px-6 grid gap-6">
  <div className="border-2 border-gray-200 bg-white rounded-md p-8 shadow-lg">
    <p className="uppercase tracking-[0.24em] text-xs text-slate-500 mb-2">
      Welcome to Bookit
    </p>
    <h1 className="text-4xl mb-3">
      Reserve your next event ticket in seconds
    </h1>
    <p className="text-slate-600 max-w-180 leading-[1.7]">
      Discover concerts, sports events and conferences. Reserve your ticket in
      less than a minute and enjoy a seamless experience. Bookit is your go-to
      platform for hassle-free ticket reservations.
    </p>
    <div className="mt-5 flex gap-3 flex-wrap">
      <Button className="px-4 py-3 rounded-full border-none bg-blue-600 text-white cursor-pointer transition-colors hover:bg-blue-700" onClick={() => router.push('/register')}>
        Get Started
      </Button>
    </div>
  </div>
</section>

<section id="events" className="max-w-270 mx-auto py-16 px-6 grid gap-6">
  <div className="bg-white rounded-[24px] p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
    <h1 className="text-4xl mb-3">
      Upcoming events that you can reserve tickets for
    </h1>
    <p className="text-slate-600 max-w-180 leading-[1.7]">
      {loading
        ? "Loading events..."
        : error
        ? `Error: ${error}`
        : events.length === 0
        ? "No events available."
        : `We have ${events.length} upcoming events.`}
    </p>
    <div className="mt-5 flex gap-3 flex-wrap">
      {events.map((event) => (
        <div
          key={event.id}
          className="border border-slate-200 rounded-xl p-4 w-50"
        >
          <h2 className="text-lg mb-2">{event.name}</h2>
          <p className="text-slate-600 mb-2">{event.description}</p>
          <p className="text-slate-600 mb-2">{event.location}</p>
          <p className="text-slate-600 mb-2">
            {new Date(event.startDate).toLocaleDateString()} -{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
    </main>
  );
}

//page.tsx is home page for that project. From this site you can see what events are on the site as well as you can register and login. My project uses shacn/ui components but i have errors with importing them even though site is functional and working