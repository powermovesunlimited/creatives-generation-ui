import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import ExplainerSection from "@/components/ExplainerSection";
import PricingSection from "@/components/PricingSection";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/ad-gallery");
  }

  return (
    <div className="flex flex-col items-center pt-16 bg-background text-foreground">
      <div className="flex flex-col lg:flex-row items-center gap-8 p-8 max-w-7xl w-full">
        <div className="flex flex-col space-y-6 lg:w-1/2 w-full z-10">
          <h1 className="text-6xl font-bold text-accent-foreground leading-tight">
            AI-Powered Ad Creatives in Minutes
          </h1>
          <p className="text-muted-foreground text-xl">
            Boost your marketing with Auto Creatives. Our AI generates stunning ad images tailored to your brand or product, perfect for social media, display ads, and more.
          </p>
          <div className="flex flex-col space-y-4">
            <Link href="/generate-ad">
              <Button className="w-full lg:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Generate Ad Creatives
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground italic">
              Empowering businesses with AI-driven marketing solutions.
            </p>
          </div>
          <div className="mt-4 text-muted-foreground">
            <span>Already a member? </span>
            <Link className="text-primary hover:underline font-medium" href="/login">
              Sign In
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full mt-8 lg:mt-0 relative h-[500px]">
          <Image
            src="/ad_0_style_demo.png"
            alt="AI Ad Creative Demo 1"
            width={600}
            height={600}
            className="absolute top-0 left-0 w-64 h-64 object-cover rounded-lg shadow-xl transform rotate-3 z-30"
          />
          <Image
            src="/ad_1_style_demo.png"
            alt="AI Ad Creative Demo 2"
            width={600}
            height={600}
            className="absolute top-20 left-20 w-72 h-72 object-cover rounded-lg shadow-xl transform -rotate-6 z-20"
          />
          <Image
            src="/ad_2_style_demo.png"
            alt="AI Ad Creative Demo 3"
            width={600}
            height={600}
            className="absolute top-40 left-40 w-80 h-80 object-cover rounded-lg shadow-xl transform rotate-12 z-10"
          />
        </div>
      </div>
      <div className="w-full bg-accent text-accent-foreground py-16">
        <ExplainerSection />
      </div>
    </div>
  );
}