import { PurchaseDashboard } from "@/components/purchase-dashboard";
import { purchaseRequests } from "@/lib/purchase-data";

export default function PurchasePage() {
  return <PurchaseDashboard requests={purchaseRequests} />;
}
