import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page";
import WalletConnect from "./pages/connect-wallet";
import HomePage from "./pages/Home-Page.jsx";
// import CreateAccount from './pages/CreateAccount.jsx'
// import CreatePassword from './pages/create-password.jsx'
// import SetupComplete from './pages/setup-complete.jsx'
// import Login from './pages/login.jsx'
import Sidebar from "./pages/Sidebar.tsx";
import EmailList from "./pages/Email-list.jsx";
import EmailComposePage from "./pages/Email-view.jsx";
import InboxPage from "./pages/Inbox.jsx";
import { AppProvider } from "./utils/contexts/AppContext";

import Auth from "./utils/auth/page.tsx";
import CustomWalletProvider from "./utils/contexts/CustomWallet.tsx";
import { AuthenticationProvider } from "./utils/contexts/Authentication.tsx";
import { getFullnodeUrl } from "@mysten/sui/client";
import clientConfig from "./utils/config/clientConfig.ts";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EnokiFlowProvider } from "@mysten/enoki/react";

import { registerStashedWallet } from "@mysten/zksend";

import "@mysten/dapp-kit/dist/index.css";
registerStashedWallet("Breaking the Ice - Community Vote", {});

const sessionStorageAdapter = {
  getItem: async (key) => {
    return sessionStorage.getItem(key);
  },
  setItem: async (key, value) => {
    sessionStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    sessionStorage.removeItem(key);
  },
};

function App({ children }) {
  const { networkConfig } = createNetworkConfig({
    testnet: { url: getFullnodeUrl("testnet") },
    mainnet: { url: getFullnodeUrl("mainnet") },
  });
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={clientConfig.SUI_NETWORK_NAME}
      >
        <WalletProvider
          autoConnect
          stashedWallet={{
            name: "Breaking the Ice - Community Vote",
          }}
          storage={sessionStorageAdapter}
        >
          <EnokiFlowProvider apiKey={clientConfig.ENOKI_API_KEY}>
            <Router>
              <AuthenticationProvider>
                <CustomWalletProvider>
                  <AppProvider>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/" element={<LandingPage />} />
                      <Route
                        path="/connect-wallet"
                        element={<WalletConnect />}
                      />
                      <Route path="/Home-page" element={<HomePage />} />
                      {/* <Route path="/CreateAccount" element={<CreateAccount />} />
                        <Route path="/CreatePassword" element={<CreatePassword />} />
                        <Route path="/setup-complete" element={<SetupComplete />} />
                        <Route path="/login-page" element={<Login />} /> */}
                      <Route path="/Side-bar" element={<Sidebar />} />
                      <Route path="/Email-list" element={<EmailList />} />
                      <Route
                        path="/Email-view"
                        element={<EmailComposePage />}
                      />
                      <Route path="/Inbox" element={<InboxPage />} />
                      {/* <Route path="/email/:id" component={EmailView} /> */}
                      {/* Add more routes as needed */}
                    </Routes>
                  </AppProvider>
                  {children}
                </CustomWalletProvider>
              </AuthenticationProvider>
            </Router>
          </EnokiFlowProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
