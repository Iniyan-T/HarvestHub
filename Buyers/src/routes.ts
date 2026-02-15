import { createBrowserRouter, redirect } from "react-router";
import { Dashboard } from "./components/Dashboard";
import { CropDetail } from "./components/CropDetail";
import { NearbyFarmers } from "./components/NearbyFarmers";
import { FarmerDetail } from "./components/FarmerDetail";
import { Transaction } from "./components/Transaction";
import { Messages } from "./components/Messages";
import { AIAssistant } from "./components/AIAssistant";
import { Transport } from "./components/Transport";
import { MarketInsights } from "./components/MarketInsights";
import { Layout } from "./components/Layout";
import { RootRedirect } from "./components/RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootRedirect,
  },
  {
    path: "/:userId",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "crop/:cropName", Component: CropDetail },
      { path: "nearby-farmers", Component: NearbyFarmers },
      { path: "nearby-farmers/:farmerId", Component: FarmerDetail },
      { path: "transaction", Component: Transaction },
      { path: "messages", Component: Messages },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "market-insights", Component: MarketInsights },
      { path: "transport", Component: Transport },
    ],
  },
]);