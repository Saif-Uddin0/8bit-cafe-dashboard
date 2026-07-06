import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import ErrorPage from "../components/global/ErrorPage";
import Home from "../pages/dashboard/Home";
import Leads from "../pages/dashboard/Leads";
import Category from "../pages/dashboard/Category";
import GameManagement from "../pages/dashboard/GameManagement";
import FoodManagement from "../pages/dashboard/FoodManagement";
import Schedule from "../pages/dashboard/Schedule";
import Booking from "../pages/dashboard/Booking";
import SubAdmin from "../pages/dashboard/SubAdmin";
import Settings from "../pages/dashboard/Settings";
import Auth from "../layout/Auth";
import Login from "../pages/authentications/Login";
import ForgetPassword from "../pages/authentications/ForgetPassword";
import Otp from "../pages/authentications/Otp";
import SetPassword from "../pages/authentications/SetPassword";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root></Root>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [

            {
                index: true,
                element: <Home></Home>
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
        element: <Auth></Auth>,
        children: [
          { path: "login", element: <Login></Login> },
          { path: "forget-password", element: <ForgetPassword></ForgetPassword> },
          { path: "otp", element: <Otp></Otp> },
          { path: "set-password", element: <SetPassword></SetPassword> },
        ],
      },
]);