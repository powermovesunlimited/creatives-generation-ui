"use client";

import { AvatarIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React, { useEffect, useState } from "react";
import { Database } from "@/types/supabase";
import ClientSideCredits from "./realtime/ClientSideCredits";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export default function Navbar({ authState }: { authState: 'authenticated' | 'unauthenticated' | 'loading' }) {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
  const [credits, setCredits] = useState<Database['public']['Tables']['credits']['Row'] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndCredits = async () => {
      if (authState === 'authenticated') {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: creditsData } = await supabase
            .from("credits")
            .select("*")
            .eq("user_id", user.id)
            .single();
          setCredits(creditsData);
        }
      } else {
        setUser(null);
        setCredits(null);
      }
    };

    fetchUserAndCredits();
  }, [authState, supabase]);

  const navItems = [
    { href: "/generate-ad", label: "Generate Ads" },
    { href: "/ad-gallery", label: "Ad Gallery" },
    ...(stripeIsConfigured ? [{ href: "/get-credits", label: "Get Credits" }] : []),
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            className={mobile ? "w-full justify-start" : ""}
            onClick={() => setIsSidebarOpen(false)}
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between">
      <div className="flex items-center gap-2">
        {authState === 'authenticated' && (
          <div className="lg:hidden">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  <NavLinks mobile />
                  <Link href="/privacy-policy">
                    <Button variant="ghost" className="w-full justify-start">
                      Privacy Policy
                    </Button>
                  </Link>
                  <Link href="/terms-of-service">
                    <Button variant="ghost" className="w-full justify-start">
                      Terms of Service
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
        <Link href="/">
          <h2 className="font-bold">Auto Creatives</h2>
        </Link>
      </div>
      {authState === 'authenticated' && (
        <div className="hidden lg:flex flex-row gap-2">
          <NavLinks />
        </div>
      )}
      <div className="flex gap-4 lg:ml-auto">
        {authState === 'unauthenticated' && (
          <Link href="/login">
            <Button variant="ghost">Login / Signup</Button>
          </Link>
        )}
        {authState === 'authenticated' && user && (
          <div className="flex flex-row gap-4 text-center align-middle justify-center">
            {stripeIsConfigured && (
              <ClientSideCredits creditsRow={credits} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <AvatarIcon height={24} width={24} className="text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-primary text-center overflow-hidden text-ellipsis">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/ad-gallery">
                  <DropdownMenuItem>Ad Gallery</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/privacy-policy">
                  <DropdownMenuItem>Privacy Policy</DropdownMenuItem>
                </Link>
                <Link href="/terms-of-service">
                  <DropdownMenuItem>Terms of Service</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button
                    type="submit"
                    className="w-full text-left"
                    variant="ghost"
                  >
                    Log out
                  </Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
