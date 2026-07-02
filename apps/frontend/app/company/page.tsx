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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const signedIn = cookies.some((c) => c.startsWith("bookit-signed-in="));
    setIsLoggedIn(signedIn);

    if (!signedIn) {
      router.push("/login");
      return;
    }

    let currentEmail = "";
    const emailCookie = cookies.find((c) => c.startsWith("bookit-user-email="));
    if (emailCookie) {
      currentEmail = decodeURIComponent(emailCookie.split("=")[1]);
      setEmail(currentEmail);
    }
      
    const checkUserCompanyAndRedirect = async (targetEmail: string) => {
      if (!targetEmail) return;
      try {
        const response = await fetch(`http://localhost:3000/v3/companies/email/${targetEmail}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        })
        console.log(targetEmail)
        if (response.ok) {
          const data = await response.json();
          const userId = data.userId;
          console.log(userId)
          if (userId) {
            router.push(`/dashboard/${userId}`);
          }
        } else {
          console.error("Company not found or user context registration is required.");
        }
      } catch (error) {
        console.error("Network error while fetching company:", error);
      }
    };

    if (currentEmail) {
      checkUserCompanyAndRedirect(currentEmail);
    }
  }, [router]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/v3/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          name,
          description,
          email,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create company");
      }

      setSuccess(true);

      setTimeout(() => {
        const userIdCookie = document.cookie.split('; ').find((c) => c.startsWith('bookit-user-id='));
        const userId = userIdCookie ? userIdCookie.split('=')[1] : null;
        if (userId) {
          router.push(`/dashboard/${userId}`);
        } else {
          router.push("/");
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-muted-foreground overflow-y-auto pb-12 bg-slate-50/50">
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

      <section className="max-w-270 mx-auto px-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Become an Organizer</h1>
        <p className="text-slate-600 text-lg max-w-180 mx-auto">
          Register your company to start creating events, managing tickets, and reaching thousands of attendees.
        </p>
      </section>

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
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}

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

//company/page.tsx file allows for creation of company. Given company has email the same as its creator so if you have company already made you will be redirected to dashboard/[userId]/page/tsx. In creation of company you can choose your own title as well as description. Shadcn componets work and i dont'know why they are giving me errors but they're fine