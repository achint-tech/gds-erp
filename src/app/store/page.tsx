import { StoreWorkspace } from "@/components/store-workspace";
import {
  inventoryItems,
  materialRequests,
  stockIssues,
  stockReceipts,
} from "@/lib/store-data";

export default function StorePage() {
  return (
    <StoreWorkspace
      initialItems={inventoryItems}
      initialRequests={materialRequests}
      initialReceipts={stockReceipts}
      initialIssues={stockIssues}
    />
  );
}
