import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import ErrorPage from "../components/global/ErrorPage";
import Auth from "../layout/Auth";

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
                index: true,
                element: withSuspense(Home)
            },
            {
                path: "game-management",
                element: <GameManagement></GameManagement>
            },
            {
                path: "category",
                element: <Category></Category>
            },
            {
                path: "leads",
                element: <Leads></Leads>
            },
            {
                path: "food-management",
                element: <FoodManagement></FoodManagement>
            },
            {
                path: "schedule",
                element: <Schedule></Schedule>
            },
            {
                path: "booking",
                element: <Booking></Booking>
            },
            {
                path: "sub-admin",
                element: <SubAdmin></SubAdmin>
            },
            {
                path: "setting",
                element: <Settings></Settings>
            },
        ]
    },
    //  authentication routes
    {
        path: "auth",
        element: <Auth />,
        children: [
          { path: "login", element: <Login></Login> },
          { path: "forget-password", element: <ForgetPassword></ForgetPassword> },
          { path: "otp", element: <Otp></Otp> },
          { path: "set-password", element: <SetPassword></SetPassword> },
        ],
      },
]);