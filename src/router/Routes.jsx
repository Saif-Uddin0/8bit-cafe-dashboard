import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import Dashboard from "../pages/Dashboard";
import Conversations from "../pages/Conversations";
import Leads from "../pages/Leads";
import Auth from "../layout/Auth";
import Login from "../pages/Authintication/Login";
import ForgetPassword from "../pages/Authintication/ForgetPassword";
import Otp from "../pages/Authintication/Otp";
import SetPassword from "../pages/Authintication/SetPassword";
import PasswordSuccessfull from "../pages/Authintication/PasswordSuccessfull";
import AgentManage from "../pages/AgentManage";
import AdminManage from "../pages/AdminManage";
import Profile from "../pages/Profile";
import ErrorPage from "../components/ErrorPage";
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root></Root>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [

            {
                index: true,
                element: <Dashboard></Dashboard>
            },
            {
                path: "agent-Manage",
                element: <AgentManage></AgentManage>
            },
            {
                path: "conversation",
                element: <Conversations></Conversations>
            },
            {
                path: "leads",
                element: <Leads></Leads>
            },
            {
                path: "admin-manage",
                element: <AdminManage></AdminManage>
            },
            {
                path: "profile",
                element: <Profile></Profile>
            },

        ]
    },
    {
        path: "auth",
        element: <Auth></Auth>,
        children: [
          { path: "login", element: <Login></Login> },
          { path: "forget-password", element: <ForgetPassword></ForgetPassword> },
          { path: "otp", element: <Otp></Otp> },
          { path: "set-password", element: <SetPassword></SetPassword> },
          { path: "password-successfull", element: <PasswordSuccessfull></PasswordSuccessfull> },
        ],
      },
]);