import { ProductionDashboard } from "@/components/production-dashboard";
import { productionRecords } from "@/lib/production-data";

export default function ProductionPage() {
  return <ProductionDashboard records={productionRecords} />;
}
