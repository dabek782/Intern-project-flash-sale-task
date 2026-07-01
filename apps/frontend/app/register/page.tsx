"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const res = await fetch("http://localhost:3000/v3/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          password,
          status: "ACTIVE",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }

      if (typeof document !== "undefined") {
        document.cookie = `bookit-signed-in=true; path=/; max-age=${60 * 60 * 24}`;
        document.cookie = `bookit-user-email=${encodeURIComponent(
          email || ""
        )}; path=/; max-age=${60 * 60 * 24}`;
      }
      
      // Navigate on success
      router.push("/login");
      
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <main className="overflow-y-hidden">

      <Card className="w-full max-w-md my-20 mx-auto py-8 px-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Register for an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
			<p className="text-sm text-slate-500 mt-2 ">
            Already have an account?
            <button
              onClick={() => router.push("/login")}
              className="text-blue-500 hover:underline font-medium px-10"
            >
              Log In
            </button>
          </p>
          </CardDescription>
          
        </CardHeader>


        <form onSubmit={handleRegister}>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
              disabled={isLoading}
            >
              Back to Home
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}