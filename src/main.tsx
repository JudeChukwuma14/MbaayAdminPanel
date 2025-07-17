import { createRoot } from "react-dom/client";
import "./index.css";
import store, { persistor } from "./components/redux/store.ts";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { mainRouter } from "./router/mainRouter.tsx";
import { DarkModeProvider } from "./components/context/DarkModeContext.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ToastContainer position="bottom-right" autoClose={5000} />
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <RouterProvider router={mainRouter} />
        </DarkModeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
