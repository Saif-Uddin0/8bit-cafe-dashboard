import React from "react";
import LeadsStatCards from "../../components/leads/LeadsStatCards";
import LeadsTable from "../../components/leads/LeadsTable";

const Leads = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
      {/* Row 1: Leads Stats Cards */}
      <div>
        <LeadsStatCards />
      </div>

      {/* Row 2: Leads responsive Table with sorting and pagination */}
      <div>
        <LeadsTable />
      </div>
    </div>
  );
};

export default Leads;