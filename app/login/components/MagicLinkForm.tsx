import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { ArrowLeft } from "lucide-react";
import { WaitingForMagicLink } from "./WaitingForMagicLink";

export const MagicLinkForm = ({
  toggleState,
}: {
  toggleState: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Magic Link error:", error);
      toast({
        title: "Magic Link Error",
        variant: "destructive",
        description: error.message,
        duration: 5000,
      });
      setIsLoading(false);
    } else {
      setIsMagicLinkSent(true);
    }
  };

  if (isMagicLinkSent) {
    return <WaitingForMagicLink toggleState={toggleState} />;
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-sm w-full">
        <h1 className="text-xl">Send Magic Link</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-2 border-purple-300 dark:border-purple-700 focus:border-pink-500 dark:focus:border-pink-400 transition-colors duration-300"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-semibold py-3 rounded-lg transition-colors duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
        <div>
          <Button onClick={toggleState} variant="secondary" size="sm">
            <ArrowLeft size={14} />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
};