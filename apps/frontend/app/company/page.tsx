"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
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

export default function CreateCompanyPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check auth and grab email on mount
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const signedIn = cookies.some((c) => c.startsWith("bookit-signed-in="));
    setIsLoggedIn(signedIn);

    if (!signedIn) {
      router.push("/login"); // Redirect if not logged in
      return;
    }

    const emailCookie = cookies.find((c) => c.startsWith("bookit-user-email="));
    if (emailCookie) {
      setEmail(decodeURIComponent(emailCookie.split("=")[1]));
    }
  }, [router]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        console.log(`${document.cookie.split('; ').find((c) => c.startsWith('bookit-access-token='))?.split('=')[1]}` )
      const res = await fetch("http://localhost:3000/v3/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${document.cookie.split('; ').find((c) => c.startsWith('bookit-access-token='))?.split('=')[1]}` },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          email,}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create company");
      }

      setSuccess(true);
      

      setTimeout(() => {
        router.push("/dashboard"); 
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-muted-foreground overflow-y-auto pb-12 bg-slate-50/50">
      {/* Navigation */}
      <nav className="border-b border-gray-400 px-5 py-5 flex flex-row justify-between rounded-md shadow-xl m-auto mb-10 bg-white">
        <div 
          className="text-2xl font-bold hover:scale-125 transition-transform duration-200 cursor-pointer text-slate-900" 
          onClick={() => router.push("/")}
        >
          Bookit
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink 
                onClick={(e) => { e.preventDefault(); router.push("/"); }} 
                className="text-lg font-semibold hover:scale-115 transition-transform duration-200 cursor-pointer"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                onClick={(e) => { e.preventDefault(); router.push("/events"); }} 
                className="text-lg font-semibold hover:scale-115 transition-transform duration-200 cursor-pointer"
              >
                Events
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Page Header */}
      <section className="max-w-270 mx-auto px-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Become an Organizer</h1>
        <p className="text-slate-600 text-lg max-w-180 mx-auto">
          Register your company to start creating events, managing tickets, and reaching thousands of attendees.
        </p>
      </section>

      {/* Form Section */}
      <section className="max-w-xl mx-auto px-6">
        <Card className="w-full shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">Company Details</CardTitle>
            <CardDescription>
              Set up your public organizer profile.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleCreateCompany}>
            <CardContent className="flex flex-col gap-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium">
                  Company created successfully! Redirecting to your dashboard...
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Live Nation, Acme Tech Meetups"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || success}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Tell attendees a little bit about the events you host..."
                  required
                  rows={4}
                  className="flex min-h-20 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading || success}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Linked Email Account</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">
                  Your company is permanently linked to your personal user account.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-slate-100 pt-6">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={isLoading || success || !email}
              >
                {isLoading ? "Creating Company..." : "Create Company"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-600"
                onClick={() => router.push("/")}
                disabled={isLoading || success}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </main>
  );
}