"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import SearchForm from "../../component/searchForm";
import { Proforma } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllProformas } from "../../../lib/electronUtils";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Use client-side search params

export default function Page() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams(); // Get search params on the client
  const query = searchParams.get("query") || "";

  useEffect(() => {
    async function fetchProformas() {
      try {
        const data = await getAllProformas();
        setProformas(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch proformas:", error);
        setError("Failed to fetch proformas");
        setLoading(false);
      }
    }
    fetchProformas();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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

  // Filter proformas based on query
  let filteredProformas = sortedProformas;
  if (query) {
    filteredProformas = sortedProformas.filter((proforma: Proforma) =>
      proforma.customerName.toLowerCase().includes(query.toLowerCase()) ||
      proforma.plateNumber.toLowerCase().includes(query.toLowerCase()) ||
      proforma.referenceNumber?.toLowerCase().includes(query.toLowerCase()) ||
      proforma.proformaNumber?.toLowerCase().includes(query.toLowerCase()) 
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-3/4 mt-4 flex flex-col gap-8">
        <div className="flex justify-center">
          <SearchForm query={query} />
        </div>
        {query && <h3 className="font-semibold text-slate-800 text-2xl text-start dark:text-slate-200">Searched Proformas: {query}</h3>}
        {!query && <h3 className="font-semibold text-slate-800 text-2xl text-start dark:text-slate-300">All Proformas</h3>}
        {filteredProformas.length === 0 ? (
          <p className="text-slate-800">No proformas found for {query}.</p>
        ) : (
          <ScrollArea className="h-[500px] p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProformas.map((proforma: Proforma, index) => {
                // Safely handle proformaNumber, provide a fallback if undefined
                const proformaId = proforma.proformaNumber
                  ? proforma.proformaNumber.split("-").join("").split("/").join("")
                  : `fallback_${index}`; // Fallback to a unique ID if proformaNumber is undefined

                return (
                  <div key={proformaId} className="relative dark:bg-gray-800 p-3 pb-10 rounded-md bg-Sidebar">
                    <ul className="flex flex-col gap-2">
                      <li className="text-slate-800 dark:text-slate-200 dark:bg-gray-900 bg-white px-5 py-1 rounded-md">
                        <span className="font-semibold">PRF Number:</span>{" "} 
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
                        <span className="font-semibold">Reference Number:</span>{" "}
                        {proforma.referenceNumber}
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
          </ScrollArea>
        )}
      </div>
    </div>
  );
}