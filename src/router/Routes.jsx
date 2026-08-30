import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import ErrorPage from "../components/global/ErrorPage";
import Auth from "../layout/Auth";
import PrivateRoute from "../components/global/PrivateRoute";
import AdminOnlyRoute from "../components/global/AdminOnlyRoute";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/dashboard/Home"));
const Leads = lazy(() => import("../pages/dashboard/Leads"));
const Category = lazy(() => import("../pages/dashboard/Category"));
const GameManagement = lazy(() => import("../pages/dashboard/GameManagement"));
const FoodManagement = lazy(() => import("../pages/dashboard/FoodManagement"));
const Schedule = lazy(() => import("../pages/dashboard/Schedule"));
const Booking = lazy(() => import("../pages/dashboard/Booking"));
const SubAdmin = lazy(() => import("../pages/dashboard/SubAdmin"));
const Settings = lazy(() => import("../pages/dashboard/Settings"));
const Transaction = lazy(() => import("../pages/dashboard/Transaction"));

const Login = lazy(() => import("../pages/authentications/Login"));
const ForgetPassword = lazy(() => import("../pages/authentications/ForgetPassword"));
const Otp = lazy(() => import("../pages/authentications/Otp"));
const SetPassword = lazy(() => import("../pages/authentications/SetPassword"));

// Reusable Suspense wrapper
const withSuspense = (Component) => (
  <Suspense
    fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }
  >
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <PrivateRoute />,
                children: [
                    {
                        index: true,
                        element: withSuspense(Home)
                    },
                    {
                        path: "game-management",
                        element: withSuspense(GameManagement)
                    },
                    {
                        path: "category",
                        element: withSuspense(Category)
                    },
                    {
                        path: "leads",
                        element: withSuspense(Leads)
                    },
                    {
                        path: "food-management",
                        element: withSuspense(FoodManagement)
                    },
                    {
                        path: "schedule",
                        element: withSuspense(Schedule)
                    },
                    {
                        path: "booking",
                        element: withSuspense(Booking)
                    },
                    {
                        path: "transaction",
                        element: withSuspense(Transaction)
                    },
                    {
                        element: <AdminOnlyRoute />,
                        children: [
                            {
                                path: "sub-admin",
                                element: withSuspense(SubAdmin)
                            },
                        ]
                    },
                    {
                        path: "setting",
                        element: withSuspense(Settings)
                    },
                ]
            }
        ]
    },
    //  authentication routes
    {
        path: "auth",
        element: <Auth />,
        children: [
          { path: "login", element: withSuspense(Login) },
          { path: "forget-password", element: withSuspense(ForgetPassword) },
          { path: "otp", element: withSuspense(Otp) },
          { path: "set-password", element: withSuspense(SetPassword) },
        ],
      },
]);