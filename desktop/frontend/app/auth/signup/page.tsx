"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { User, KeyRound } from "lucide-react";
import { signup } from "../../../lib/electronUtils";

const formSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(2)
    .max(50)
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || val.length >= 2,
      { message: "Must be a valid email or at least 2 characters long." }
    ),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
});

const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const userData = {
          usernameOrEmail: values.usernameOrEmail,
          password: values.password,
        };
        console.log('Calling signup with:', userData);
        const result = await signup(userData);
        console.log('Signup result:', result);

        if (result?.success) {
          toast.success("Successfully signed up! Please log in.", {
            style: {
              backgroundColor: "#00cc00",
              color: "#ffffff",
              border: "none",
            },
          });
          router.push("/auth/login");
        } else {
          toast.error(result?.message || "Signup failed. Please try again.", {
            style: {
              backgroundColor: "#ff4444",
              color: "#ffffff",
              border: "none",
            },
          });
        }
      } catch (error) {
        console.error('Error signing up:', error);
        const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again.";
        toast.error(errorMessage, {
          style: {
            backgroundColor: "#ff4444",
            color: "#ffffff",
            border: "none",
          },
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="pb-8">
        <p className="font-semibold dark:text-slate-300 text-2xl text-slate-700 font-sans">
          Create an Account
        </p>
        <p className="font-extralight dark:text-slate-400 text-slate-600">
          Please enter your details to sign up.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-5">
          <FormField
            control={form.control}
            name="usernameOrEmail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                    <Input
                      className="custom-input-logout dark:bg-gray-800"
                      placeholder="Enter your username or email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                    <Input
                      type="password"
                      className="custom-input-logout dark:bg-gray-800"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Link
            className="flex justify-end dark:text-blue-300 text-sm text-blue-800"
            href="/auth/login"
          >
            Already have an account? Login
          </Link>
          <Button
            type="submit"
            className="bg-blue-700 w-full hover:bg-blue-800 font-sans font-semibold transition"
            disabled={isPending}
          >
            {isPending ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;