import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/use-toast";

interface EmailPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: () => void;
}

export function EmailPromptDialog({ isOpen, onClose, onEmailSubmit }: EmailPromptDialogProps) {
  const [email, setEmail] = useState("");
  const supabase = createClientComponentClient();

  const handleEmailSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update user's email
    const { error: updateError } = await supabase.auth.updateUser({ email: email });
    if (updateError) {
      console.error("Error updating email:", updateError);
      toast({
        title: "Error",
        description: "Unable to update your email. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Add 5 credits to the account
    const { error: creditsError } = await supabase
      .from('credits')
      .update({ credits: 5 })
      .eq('user_id', user.id);

    if (creditsError) {
      console.error("Error adding credits:", creditsError);
      toast({
        title: "Error",
        description: "Unable to add credits to your account. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email Updated",
      description: "Your email has been updated and 5 credits have been added to your account!",
    });

    onEmailSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get 5 More Credits</DialogTitle>
          <DialogDescription>
            Provide your email to get 5 additional credits and continue generating ads.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleEmailSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}