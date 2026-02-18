import { PropertyForm } from "@/components/property/property-form";

export default function AgentNewPropertyPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Create Property</h1>
      <PropertyForm mode="create" />
    </div>
  );
}
