import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CalendarCheck2, Wallet, Gamepad2, CupSoda } from "lucide-react";
import TodaysBookingsTable from "../../components/home/TodaysBookingsTable";
import TransactionsList from "../../components/home/TransactionsList";
import AllPayments from "../../components/home/AllPayments";
import PaymentGrowthChart from "../../components/home/PaymentGrowthChart";

// Map icon string names from JSON to actual Lucide components
const ICONS = { CalendarCheck2, Wallet, Gamepad2, CupSoda };

// Stat card sub-component — pure display, no data fetching
const StatCard = ({ title, value, bgColor, icon }) => {
  const Icon = ICONS[icon];
  return (
    <div className={`p-6 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100/50 ${bgColor} transition-all duration-300 hover:scale-[1.02]`}>
      <span className="text-black">{Icon && <Icon size={24} strokeWidth={1.8} />}</span>
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#191C1E] leading-tight">{value}</h3>
        <p className="text-[10px] md:text-xs font-bold text-[#64748B] tracking-wider mt-1 uppercase">{title}</p>
      </div>
    </div>
  );
};

const Home = () => {
  // Single query fetches all home data from public/home.json
  const { data, isLoading, isError } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const res = await axios.get("/home.json");
      return res.data;
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
      Failed to load dashboard data.
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {data.stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Row 2: Today's Bookings + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <TodaysBookingsTable bookings={data.todaysBookings} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <TransactionsList transactions={data.transactions} />
        </div>
      </div>

      {/* Row 3: All Payments + Payment Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AllPayments payments={data.allPayments} />
        <PaymentGrowthChart chartData={data.paymentGrowth} />
      </div>

    </div>
  );
};

export default Home;