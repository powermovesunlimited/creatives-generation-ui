import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/use-toast";

interface EmailPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (confirmed: boolean) => void;
}

export function EmailPromptDialog({ isOpen, onClose, onEmailSubmit }: EmailPromptDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
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

    // Send confirmation email
    const { error: confirmError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/confirm-email`,
    });

    if (confirmError) {
      console.error("Error sending confirmation email:", confirmError);
      toast({
        title: "Error",
        description: "Unable to send confirmation email. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email Updated",
      description: "A confirmation email has been sent. Please confirm your email to receive 5 additional credits!",
    });

    setIsEmailSent(true);
  };

  const handleConfirmation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (user.email_confirmed_at) {
      setIsPasswordSet(true);
    } else {
      toast({
        title: "Email Not Confirmed",
        description: "Please check your email and confirm your new address before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) {
      console.error("Error setting password:", error);
      toast({
        title: "Error",
        description: "Unable to set password. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Set",
      description: "Your password has been set successfully.",
    });

    onEmailSubmit(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get 5 More Credits</DialogTitle>
          <DialogDescription>
            {!isEmailSent
              ? "Provide your email to get 5 additional credits. You'll need to confirm your email to receive the credits."
              : !isPasswordSet
              ? "Please check your email and confirm your new address to receive 5 additional credits."
              : "Set a password for your account. If you don't set a password now, you'll need to use the 'Forgot Password' feature to access your account later."}
          </DialogDescription>
        </DialogHeader>
        {!isEmailSent ? (
          <>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleEmailSubmit}>Submit</Button>
            </DialogFooter>
          </>
        ) : !isPasswordSet ? (
          <DialogFooter>
            <Button onClick={handleConfirmation}>I confirmed it!</Button>
            <Button variant="outline" onClick={() => onEmailSubmit(false)}>Nevermind</Button>
          </DialogFooter>
        ) : (
          <>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handlePasswordSubmit}>Set Password</Button>
              <Button variant="outline" onClick={() => onEmailSubmit(true)}>Skip</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}