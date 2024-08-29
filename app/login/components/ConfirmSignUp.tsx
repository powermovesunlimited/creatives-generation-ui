import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface ConfirmSignUpProps {
  email: string;
}

export const ConfirmSignUp: React.FC<ConfirmSignUpProps> = ({ email }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-sm w-full">
        <h1 className="text-xl">Confirm Your Email</h1>
        <p className="text-sm">
          We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-sm">
          If you don't see the email, check your spam folder or try resending the confirmation email.
        </p>
        <Link href="/login" passHref>
          <Button variant="outline" className="w-full">
            Return to Login
          </Button>
        </Link>
      </div>
    </div>
  );
};