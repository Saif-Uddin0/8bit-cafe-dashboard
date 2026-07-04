import ReactDOM from "react-dom/client";
import "./index.css";
import { ToastContainer } from "react-toastify";
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from "react-router/dom";
import { router } from "./route/Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./pages/Provider/AuthProvider";

const queryClient = new QueryClient();

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={2000} />
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </AuthProvider>
  </QueryClientProvider>
)