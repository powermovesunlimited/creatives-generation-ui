import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import PublicAdGalleryClient from "@/components/gallery/PublicAdGalleryClient";

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
    <div className="w-full flex flex-col items-center bg-white text-foreground min-h-screen">
      <div className="text-center max-w-5xl px-4 py-2">

        <h1 className="text-6xl font-bold mb-4">
          Generate beautiful Ads in seconds
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Boost your marketing with Auto Creatives. Our AI generates stunning ad images tailored to your brand or product, perfect for social media, display ads, and more.
        </p>
        <div className="flex justify-center">
          <Link href="/generate-ad">
            <Button className="w-full lg:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Generate Ad Creatives
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full py-8">
        <PublicAdGalleryClient />
      </div>
    </div>
  );
}