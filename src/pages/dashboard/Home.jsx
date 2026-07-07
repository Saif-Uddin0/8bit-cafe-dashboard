import React from "react";
import StatCards from "../../components/home/StatCards";
import AllGamesTable from "../../components/home/AllGamesTable";
import TransactionsList from "../../components/home/TransactionsList";
import TodaysBookingsTable from "../../components/home/TodaysBookingsTable";
import PaymentGrowthChart from "../../components/home/PaymentGrowthChart";

const Home = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Row 1: Stat Cards */}
      <div>
        <StatCards />
      </div>

      {/* Row 2: All Games (Left) & Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-stretch">
          <AllGamesTable />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-stretch">
          <TransactionsList />
        </div>
      </div>

      {/* Row 3: Todays Bookings (Left) & Payment Growth (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-stretch">
          <TodaysBookingsTable />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-stretch">
          <PaymentGrowthChart />
        </div>
      </div>
    </div>
  );
};

export default Home;