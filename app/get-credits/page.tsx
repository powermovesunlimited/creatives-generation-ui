import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StripePricingTable from "@/components/stripe/StripeTable";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col items-center pt-16 bg-background text-foreground">
      <div className="flex flex-col lg:flex-row items-start gap-8 p-8 max-w-7xl w-full">
        <div className="flex flex-col space-y-6 lg:w-1/2 w-full">
          <h1 className="text-4xl font-bold text-accent-foreground leading-tight">
            Power Up Your Marketing with AI Credits
          </h1>
          <p className="text-muted-foreground text-xl">
            Unlock the full potential of Auto Creatives with our flexible credit system. Each credit allows you to generate a unique, AI-powered ad creative tailored to your brand or product.
          </p>
          <div className="bg-accent text-accent-foreground p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">What You Get with Credits:</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Generate high-quality ad creatives instantly</li>
              <li>Customize images for various platforms and sizes</li>
              <li>Access to advanced AI algorithms for unique designs</li>
              <li>Flexible usage - buy credits as you need them</li>
            </ul>
          </div>
          <div className="relative w-full h-[300px] mt-8">
            <Image
              src="/ad_0_style_demo.png"
              alt="AI Ad Creative Demo 1"
              width={300}
              height={300}
              className="absolute top-0 left-0 w-48 h-48 object-cover rounded-lg shadow-xl transform rotate-3 z-30"
            />
            <Image
              src="/ad_1_style_demo.png"
              alt="AI Ad Creative Demo 2"
              width={300}
              height={300}
              className="absolute top-12 left-32 w-48 h-48 object-cover rounded-lg shadow-xl transform -rotate-6 z-20"
            />
            <Image
              src="/ad_2_style_demo.png"
              alt="AI Ad Creative Demo 3"
              width={300}
              height={300}
              className="absolute top-24 left-64 w-48 h-48 object-cover rounded-lg shadow-xl transform rotate-12 z-10"
            />
          </div>
        </div>
        <div className="lg:w-2/3 w-full">
          <h2 className="text-3xl font-bold mb-2">Choose Your Credit Package</h2>
          <StripePricingTable user={user} />
        </div>
      </div>
    </div>
  );
}
