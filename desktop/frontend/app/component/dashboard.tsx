"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Proforma } from "@/lib/utils";
import { getAllProformas } from "@/lib/electronUtils";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [proformas, setProformas] = useState<Proforma[]>([]);

  useEffect(() => {
    const fetchProformas = async () => {
      try {
        const data = await getAllProformas();
        setProformas(data);
      } catch (e) {
        console.error("Error fetching proformas:", e);
      }
    };
    fetchProformas();
  }, []); // Empty dependency array to run once on mount


  // Sort proformas by dateCreated (newest first) and proformaNumber (highest sequence first) as secondary key
  const sortedProformas = proformas.sort((a: Proforma, b: Proforma) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();

    // Primary sort: dateCreated descending
    if (dateB - dateA !== 0) {
      return dateB - dateA;
    }

    // Secondary sort: proformaNumber sequence (descending)
    const seqA = parseInt(a.proformaNumber?.split("-").pop() || "0");
    const seqB = parseInt(b.proformaNumber?.split("-").pop() || "0");
    return seqB - seqA;
  });
  
  let recentProformas = sortedProformas;

  if (proformas && proformas.length >= 6) {
    recentProformas = sortedProformas.slice(0, 6);
  }

  return (
    <div className="flex relative flex-col gap-8 items-center pt-8 pb-14">
      <div className="w-4/5 bg-Sidebar rounded dark:bg-gray-800">
        <p className="font-sans text-3xl dark:text-slate-300 font-light text-center p-8">
          <span className="font-semibold">Create</span>,{" "}
          <span className="font-semibold">manage</span>, and{" "}
          <span className="font-semibold">generate</span> proforma invoices seamlessly. Stay organized with quick search, PDF generation, and offline access—no complex setup required!
        </p>
      </div>
      <hr className="w-3/4 text-white" />
      <p className="bg-slate-100 text-slate-800 px-2 rounded-md py-1 text-lg"><span className="font-semibold">Total-Proformas:</span> {proformas?.length}</p>
      <div className="w-3/4 flex flex-col gap-8 ">
        <div className="relative flex justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-2xl text-start">
            Recent Proformas
          </h3>
          <Link
            href="/view-proformas"
            className="flex text-blue-800 absolute right-0 dark:text-blue-500"
          >
            <ArrowLeft /> All proformas
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* card */}
          {recentProformas.map((proforma: Proforma, index) => {
            // Safely handle proformaNumber, provide a fallback if undefined
            const proformaId = proforma.proformaNumber
              ? proforma.proformaNumber.split("-").join("").split("/").join("")
              : `fallback_${index}`; // Fallback to a unique ID if proformaNumber is undefined

            return (
              <div key={proformaId} className="relative dark:bg-gray-800 p-3 pb-10 rounded-md bg-Sidebar">
                <ul className="flex flex-col gap-2">
                  <li className="text-slate-800 dark:text-slate-200 dark:bg-gray-900 bg-white px-5 py-1 rounded-md">
                    <span className="font-semibold">PRF-</span>{" "}
                    {proforma.proformaNumber || "N/A"}
                  </li>
                  <li className="text-slate-800 dark:text-slate-200 dark:bg-gray-900 bg-white px-5 py-1 rounded-md">
                    <span className="font-semibold">Customer Name:</span>{" "}
                    {proforma.customerName}
                  </li>
                  <li className="text-slate-800 dark:text-slate-200 dark:bg-gray-900 bg-white px-5 py-1 rounded-md">
                    <span className="font-semibold">Plate Number:</span>{" "}
                    {proforma.plateNumber}
                  </li>
                  <li className="text-slate-800 dark:text-slate-200 dark:bg-gray-900 bg-white px-5 py-1 rounded-md">
                    <span className="font-semibold">Created at:</span>{" "}
                    <span className="text-sm">{proforma.dateCreated}</span>
                  </li>
                </ul>
                <div className="w-full flex justify-end">
                  <Link
                    href={`/view-proformas/${proformaId}`}
                    className="absolute flex gap-2 dark:bg-gray-700 bg-slate-50 rounded px-3 bottom-1 hover:bg-slate-200 transition-colors duration-300"
                  >
                    more <ArrowRight />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;