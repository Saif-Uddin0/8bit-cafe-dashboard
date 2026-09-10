import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxios";
import StatCards from "../../components/home/StatCards";
import TodaysBookingsTable from "../../components/home/TodaysBookingsTable";
import TransactionsList from "../../components/home/TransactionsList";
import AllPayments from "../../components/home/AllPayments";
import PaymentGrowthChart from "../../components/home/PaymentGrowthChart";

const Home = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 1. Payment Counter & Methods API
  const {
    data: counterData,
    isLoading: counterLoading,
  } = useQuery({
    queryKey: ["paymentCounter"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/payment/all-transection-counter");
      return res.data?.data ?? {};
    },
  });

  // 2. Today's Transactions API
  const {
    data: todayData,
    isLoading: todayLoading,
  } = useQuery({
    queryKey: ["todayTransection"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/payment/todayTransection");
      return res.data?.data ?? {};
    },
  });

  // 3. Payment Growth API
  const {
    data: growthData,
    isLoading: growthLoading,
  } = useQuery({
    queryKey: ["paymentGrowth", selectedYear],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/api/payment/paymentGrowth?year=${selectedYear}`
      );
      return res.data?.data ?? {};
    },
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
      {/* Row 1: Stat Cards */}
      <StatCards
        totalTransaction={counterData?.totalTransaction}
        totalAmount={counterData?.totalAmount}
        totalGame={counterData?.totalGame}
        totalFood={counterData?.totalFood}
        isLoading={counterLoading}
      />

      {/* Row 2: Today's Game Transactions + Today's Food Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <TodaysBookingsTable
            gamesbooking={todayData?.gamesbooking}
            isLoading={todayLoading}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <TransactionsList
            foodsBooking={todayData?.foodsBooking}
            isLoading={todayLoading}
          />
        </div>
      </div>

      {/* Row 3: All Payments + Payment Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AllPayments
          paymentMethods={counterData?.paymentMethods}
          successPercentage={
            counterData?.paymentStatus?.success?.percentage
              ? Math.round(counterData.paymentStatus.success.percentage)
              : 80
          }
          isLoading={counterLoading}
        />
        <PaymentGrowthChart
          growthData={growthData}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          isLoading={growthLoading}
        />
      </div>
    </div>
  );
};

export default Home;