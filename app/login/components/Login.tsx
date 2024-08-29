"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthError } from "@supabase/supabase-js";
import disposableDomains from "disposable-email-domains";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineGoogle } from "react-icons/ai";
import { WaitingForMagicLink } from "./WaitingForMagicLink";
import { ConfirmSignUp } from "./ConfirmSignUp";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Inputs = {
  email: string;
  password: string;
  confirmPassword?: string;
};

const cardVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.6, ease: "easeInOut" }
  }
};

const contentVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  back: {
    rotateY: -180,
    transition: { duration: 0.6, ease: "easeInOut" }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { y: -20, opacity: 0 }
};

export const Login = ({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (data.password !== data.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await signUpWithEmail(data.email, data.password);
      } else {
        await signInWithEmail(data.email, data.password);
        router.push("/ad-gallery");
      }
      setIsSubmitting(false);
      if (!isSignUp) {
        toast({
          title: "Sign in successful",
          description: "You have been signed in.",
          duration: 5000,
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          variant: "destructive",
          description: error.message,
          duration: 5000,
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: error.message,
          duration: 5000,
        });
      } else {
        toast({
          title: "Something went wrong",
          variant: "destructive",
          description:
            "Please try again. If the problem persists, contact us at hello@tryleap.ai",
          duration: 5000,
        });
      }
      console.error("Authentication error:", error);
    }
  };

  let inviteToken = null;
  if (searchParams && "inviteToken" in searchParams) {
    inviteToken = searchParams["inviteToken"];
  }

  const protocol = host?.includes("localhost") ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/auth/callback`;

  console.log({ redirectUrl });

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      toast({
        title: "Google Sign-In Error",
        variant: "destructive",
        description: error.message,
        duration: 5000,
      });
    } else {
      router.push("/ad-gallery");
    }
  };

  const signInWithMagicLink = async (email: string) => {
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
    } else {
      setIsMagicLinkSent(true);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      throw error;
    }
    setSignUpEmail(email);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  if (signUpEmail) {
    return <ConfirmSignUp email={signUpEmail} />;
  }

  if (isMagicLinkSent) {
    return (
      <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center ">
      <div className="w-full max-w-md perspective-1000 mt-20">
        <motion.div 
          className="rounded-3xl shadow-2xl overflow-hidden relative bg-white dark:bg-gray-800"
          initial="front"
          animate={isSignUp ? "back" : "front"}
          variants={cardVariants}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div 
            className="p-8 backface-hidden"
            variants={contentVariants}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.h2 
              className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 dark:from-purple-300 dark:to-pink-500"
              variants={itemVariants}
            >
              {isSignUp ? "Join Us" : "Welcome Back"}
            </motion.h2>
            
            <motion.div variants={itemVariants}>
              <Button
                onClick={signInWithGoogle}
                variant="outline"
                className="w-full mb-6 font-semibold text-gray-700 dark:text-gray-200 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-300"
              >
                <AiOutlineGoogle size={24} className="mr-2 text-purple-500 dark:text-purple-400" />
                Continue with Google
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <OR />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isSignUp ? "signup" : "signin"}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div variants={itemVariants}>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-2 border-purple-300 dark:border-purple-700 focus:border-pink-500 dark:focus:border-pink-400 transition-colors duration-300"
                    {...register("email", {
                      required: true,
                      validate: {
                        emailIsValid: (value) =>
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                          "Please enter a valid email",
                        emailIsntDisposable: (value) =>
                          !disposableDomains.includes(value.split("@")[1]) ||
                          "Please use a permanent email address",
                      },
                    })}
                  />
                  {isSubmitted && errors.email && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-2 border-purple-300 dark:border-purple-700 focus:border-pink-500 dark:focus:border-pink-400 transition-colors duration-300"
                    {...register("password", { required: true, minLength: 6 })}
                  />
                  {isSubmitted && errors.password && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">Password must be at least 6 characters long</p>
                  )}
                </motion.div>

                {isSignUp && (
                  <motion.div variants={itemVariants}>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-2 border-purple-300 dark:border-purple-700 focus:border-pink-500 dark:focus:border-pink-400 transition-colors duration-300"
                      {...register("confirmPassword", {
                        required: true,
                        validate: (value) =>
                          value === watch("password") || "Passwords do not match",
                      })}
                    />
                    {isSubmitted && errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
                    )}
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className={`w-full text-white font-semibold py-3 rounded-lg transition-colors duration-300 ${
                      isSignUp 
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>
                </motion.div>
              </motion.form>
            </AnimatePresence>

            <motion.div variants={itemVariants} className="mt-6">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`w-full ${
                  isSignUp 
                    ? 'text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300' 
                    : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                } transition-colors duration-300`}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <OR />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={() => signInWithMagicLink(register("email").value)}
                variant="outline"
                className="w-full mt-4 text-gray-700 dark:text-gray-200 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-300"
              >
                Continue with Magic Link
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const OR = () => (
  <div className="flex items-center my-6">
    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
    <span className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</span>
    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
  </div>
);