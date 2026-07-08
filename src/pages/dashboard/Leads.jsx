import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LeadsStatCards from "../../components/leads/LeadsStatCards";
import LeadsTable from "../../components/leads/LeadsTable";

const Leads = () => {
  const { data: leads = [], isLoading, isError } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await axios.get("/leads.json");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading leads data...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">Failed to load leads database.</p>
        </div>
      ) : (
        <>
          <div>
            <LeadsStatCards leads={leads} />
          </div>
          <div>
            <LeadsTable leads={leads} />
          </div>
        </>
      )}
    </div>
  );
};

export default Leads;