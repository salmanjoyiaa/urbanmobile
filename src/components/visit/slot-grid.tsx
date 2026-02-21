import { formatSlotLabel } from "@/lib/slots";
import { Button } from "@/components/ui/button";

type SlotGridProps = {
  slots: Array<{ time: string; available: boolean }>;
  selectedSlot: string | null;
  onSelect: (time: string) => void;
};

export function SlotGrid({ slots, selectedSlot, onSelect }: SlotGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const active = selectedSlot === slot.time;
        return (
          <Button
            key={slot.time}
            type="button"
            variant={active ? "default" : "outline"}
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
            className={
              !slot.available
                ? "border-red-200 bg-red-50 text-red-400 hover:bg-red-50 hover:text-red-400 disabled:opacity-100 disabled:bg-red-50 disabled:text-red-400 disabled:border-red-200 line-through"
                : ""
            }
          >
            {slot.available ? formatSlotLabel(slot.time) : `${formatSlotLabel(slot.time)} · Booked`}
          </Button>
        );
      })}
    </div>
  );
}
