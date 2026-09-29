"use client";

import { Button } from "@/components/ui/button";
import { Mail, Users } from "lucide-react";
import Link from "next/link";

const AboutUsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="pb-8 text-center">
        <p className="font-semibold dark:text-slate-300 text-2xl text-slate-700 font-sans">
          About Us
        </p>
        <p className="font-extralight dark:text-slate-400 text-slate-600">
          Meet the team behind volatage auto parts Fast-Proforma custom desktop application for generating proforma invoices.
        </p>
      </div>

      <div className="w-[400px] space-y-8">
        {/* Team Description */}
        <div className="relative">
          <Users className="absolute left-3 top-4 w-6 h-6 text-gray-500" />
          <div className="custom-input-logout dark:bg-gray-800 bg-gray-100 p-4 pl-12 rounded-md">
            <p className="dark:text-slate-300 text-slate-700 font-sans">
              We are a dedicated team of developers at Swift technologies,
              passionate about creating tools that streamline your workflow.
              Voltage auto parts is a customized desktop application designed to
              help you generate professional documents quickly and efficiently,
              powered by cutting-edge technology.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="relative">
          <Mail className="absolute left-3 top-4 w-6 h-6 text-gray-500" />
          <div className="custom-input-logout dark:bg-gray-800 bg-gray-100 p-4 pl-12 rounded-md">
            <p className="dark:text-slate-300 text-slate-700 font-sans">
              Have questions or feedback? Reach out to us!
            </p>
            <Link
              href="mailto:bsr7349@gmail.com"
              className="dark:text-blue-300 text-blue-800 text-sm hover:underline"
            >bsr7349@gmail.com
            </Link>
          </div>
        </div>
        <p className="dark:text-blue-300 text-blue-800 text-sm hover:underline">our phone number : +251983742730</p>

        {/* Back Button */}
        <Link href="/">
          <Button className="bg-blue-700 w-full hover:bg-blue-800 font-sans font-semibold transition">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AboutUsPage;
