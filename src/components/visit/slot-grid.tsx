import { formatSlotLabel } from "@/lib/slots";
import { Button } from "@/components/ui/button";

type SlotGridProps = {
  slots: Array<{ time: string; available?: boolean }>;
  selectedSlot: string | null;
  onSelect: (time: string) => void;
};

function isMorning(time: string): boolean {
  const [h] = time.split(":").map(Number);
  return h < 12;
}

export function SlotGrid({ slots, selectedSlot, onSelect }: SlotGridProps) {
  const morning = slots.filter((s) => isMorning(s.time));
  const afternoon = slots.filter((s) => !isMorning(s.time));

  const slotButton = (s: { time: string }) => {
    const active = selectedSlot === s.time;
    return (
      <Button
        key={s.time}
        type="button"
        variant={active ? "default" : "outline"}
        onClick={() => onSelect(s.time)}
      >
        {formatSlotLabel(s.time)}
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      {morning.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Morning
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {morning.map(slotButton)}
          </div>
        </div>
      )}
      {afternoon.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Afternoon
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {afternoon.map(slotButton)}
          </div>
        </div>
      )}
    </div>
  );
}
