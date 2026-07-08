import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BookingStatCards from '../../components/booking/BookingStatCards';
import BookingTable from '../../components/booking/BookingTable';

// API Fetcher function for Bookings data
const Booking = () => {
    // TanStack Query to handle fetching, caching, and loading states
    const {
        data: bookings = [],
        refetch,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["bookings"],
        queryFn: async () => {
            const res = await axios.get("/bookings.json");
            return res.data;
        }
    });

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
            {/* Conditional Rendering based on fetch states */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-semibold text-sm">Loading bookings data...</p>
                </div>
            ) : isError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                    <p className="font-semibold">Failed to load bookings: {error?.message || "Unknown error occurred"}</p>
                </div>
            ) : (
                <>
                    {/* Row 1: Booking Stats Cards */}
                    <BookingStatCards bookings={bookings} />

                    {/* Row 2: Interactive Table with Search, Filter & Pagination */}
                    <BookingTable bookings={bookings} />
                </>
            )}
        </div>
    );
};

export default Booking;