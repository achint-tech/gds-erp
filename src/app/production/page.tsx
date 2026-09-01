import { ProductionDashboard } from "@/components/production-dashboard";
import { dispatchRecords, productionRecords } from "@/lib/production-data";

export default function ProductionPage() {
  return (
    <ProductionDashboard
      records={productionRecords}
      dispatches={dispatchRecords}
    />
  );
}
