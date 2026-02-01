import { createBrowserRouter } from "react-router";
import { Dashboard } from "./components/Dashboard";
import { CropDetail } from "./components/CropDetail";
import { NearbyFarmers } from "./components/NearbyFarmers";
import { FarmerDetail } from "./components/FarmerDetail";
import { Transaction } from "./components/Transaction";
import { Messages } from "./components/Messages";
import { AIAssistant } from "./components/AIAssistant";
import { PriceGraph } from "./components/PriceGraph";
import { Transport } from "./components/Transport";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "crop/:cropName", Component: CropDetail },
      { path: "nearby-farmers", Component: NearbyFarmers },
      { path: "nearby-farmers/:farmerId", Component: FarmerDetail },
      { path: "transaction", Component: Transaction },
      { path: "messages", Component: Messages },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "price-graph", Component: PriceGraph },
      { path: "transport", Component: Transport },
    ],
  },
]);