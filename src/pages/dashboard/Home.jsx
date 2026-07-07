import React from "react";
import StatCards from "../../components/home/StatCards";
import TodaysBookingsTable from "../../components/home/TodaysBookingsTable";
import TransactionsList from "../../components/home/TransactionsList";
import AllPayments from "../../components/home/AllPayments";
import PaymentGrowthChart from "../../components/home/PaymentGrowthChart";

const Home = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
      {/* Row 1: Stat Cards */}
      <div>
        <StatCards />
      </div>

      {/* Row 2: Todays Bookings (Left) & Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-stretch">
          <TodaysBookingsTable />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-stretch">
          <TransactionsList />
        </div>
      </div>

      {/* Row 3: All Payments (Left) & Payment Growth (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AllPayments />
        <PaymentGrowthChart />
      </div>
    </div>
  )
};

export default Home;