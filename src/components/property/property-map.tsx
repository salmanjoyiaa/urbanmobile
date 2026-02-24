"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type PropertyMapProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number | null; longitude: number | null }) => void;
};

export function PropertyMap({ latitude, longitude, onChange }: PropertyMapProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Location picker</p>
      <p className="text-xs text-muted-foreground">
        Enter precise coordinates for listing placement.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="-90 to 90 (e.g. 24.71)"
            value={latitude ?? ""}
            onChange={(event) =>
              onChange({
                latitude: event.target.value ? Number(event.target.value) : null,
                longitude,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="-180 to 180 (e.g. 46.68)"
            value={longitude ?? ""}
            onChange={(event) =>
              onChange({
                latitude,
                longitude: event.target.value ? Number(event.target.value) : null,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
