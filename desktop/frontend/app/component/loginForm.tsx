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
import { User, KeyRound } from "lucide-react";
import { login } from "../../lib/electronUtils";

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

const LoginForm = () => {
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
        console.log('Calling login with:', userData);
        const result = await login(userData);
        console.log('Login result:', result);

        if (result?.success) {
          toast.success("Successfully logged in!", {
            style: {
              backgroundColor: "#00cc00",
              color: "#ffffff",
              border: "none",
            },
          });
          router.push("/");
        } else {
          toast.error(result?.message || "Login failed. Please try again.", {
            style: {
              backgroundColor: "#ff4444",
              color: "#ffffff",
              border: "none",
            },
          });
        }
      } catch (error) {
        console.error('Error logging in:', error);
        toast.error((error as Error).message || "Login failed. Please try again.", {
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
    <div className="rounded-lg">
      <div className="pb-8">
        <p className="font-semibold dark:text-slate-300 text-2xl text-slate-700 font-sans">
          Welcome back!
        </p>
        <p className="font-extralight dark:text-slate-400 text-slate-600">Please enter your details.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-5">
          {/* Username or Email */}
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

          {/* Password */}
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
         

          <Button
            type="submit"
            className="bg-blue-700 w-full hover:bg-blue-800 font-sans font-semibold transition"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;