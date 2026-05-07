/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Merge } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type City = { name: string };
type District = { id: string; city_name: string; name: string };

export function LocationsClient({
  initialCities,
  initialDistricts,
}: {
  initialCities: City[];
  initialDistricts: District[];
}) {
  const router = useRouter();
  const cities = initialCities;
  const districts = initialDistricts;
  
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCities[0]?.name || null);
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>([]);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergedDistrictName, setMergedDistrictName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [newDistrictName, setNewDistrictName] = useState("");

  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [editCityName, setEditCityName] = useState("");

  const [editingDistrict, setEditingDistrict] = useState<string | null>(null);
  const [editDistrictName, setEditDistrictName] = useState("");

  const handleCreateCity = async () => {
    if (!newCityName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCityName.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("City created");
      setNewCityName("");
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to create city");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCity = async (oldName: string) => {
    if (!editCityName.trim() || editCityName === oldName) {
      setEditingCity(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations/cities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: editCityName.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("City updated");
      setEditingCity(null);
      if (selectedCity === oldName) setSelectedCity(editCityName.trim());
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to update city");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCity = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? All its districts will be deleted, and properties will lose their city/district data.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/locations/cities?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("City deleted");
      if (selectedCity === name) setSelectedCity(cities.find(c => c.name !== name)?.name || null);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete city");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDistrict = async () => {
    if (!newDistrictName.trim() || !selectedCity) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city_name: selectedCity, name: newDistrictName.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("District created");
      setNewDistrictName("");
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to create district");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDistrict = async (id: string, oldName: string) => {
    if (!editDistrictName.trim() || editDistrictName === oldName) {
      setEditingDistrict(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations/districts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newName: editDistrictName.trim(), oldName, city_name: selectedCity }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("District updated");
      setEditingDistrict(null);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to update district");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDistrict = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? Properties in this district will lose their district data.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/locations/districts?id=${id}&name=${encodeURIComponent(name)}&city_name=${encodeURIComponent(selectedCity!)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("District deleted");
      setSelectedDistrictIds(prev => prev.filter(did => did !== id));
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete district");
    } finally {
      setLoading(false);
    }
  };

  const handleMergeDistricts = async () => {
    if (!mergedDistrictName.trim() || selectedDistrictIds.length < 2 || !selectedCity) return;
    setLoading(true);
    try {
      const selectedNames = districts
        .filter(d => selectedDistrictIds.includes(d.id))
        .map(d => d.name);

      const res = await fetch("/api/admin/locations/merge-districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_name: selectedCity,
          oldDistrictIds: selectedDistrictIds,
          oldDistrictNames: selectedNames,
          newDistrictName: mergedDistrictName.trim()
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success("Districts merged successfully");
      setMergeDialogOpen(false);
      setSelectedDistrictIds([]);
      setMergedDistrictName("");
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to merge districts");
    } finally {
      setLoading(false);
    }
  };

  const toggleDistrictSelection = (id: string) => {
    setSelectedDistrictIds(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const filteredDistricts = districts.filter(d => d.city_name === selectedCity);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Cities Panel */}
      <div className="bg-white rounded-xl border border-[#eff3f4] p-5">
        <h2 className="text-lg font-bold text-navy mb-4">Cities</h2>
        
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="New city name..." 
            value={newCityName}
            onChange={e => setNewCityName(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleCreateCity} disabled={loading || !newCityName.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {cities.map((city) => (
            <div 
              key={city.name} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${selectedCity === city.name ? "border-primary bg-primary/5" : "border-[#eff3f4] hover:bg-muted"}`}
              onClick={() => setSelectedCity(city.name)}
            >
              {editingCity === city.name ? (
                <div className="flex items-center gap-2 w-full mr-2" onClick={e => e.stopPropagation()}>
                  <Input 
                    value={editCityName} 
                    onChange={e => setEditCityName(e.target.value)} 
                    autoFocus 
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => handleUpdateCity(city.name)} disabled={loading}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingCity(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-[14px]">{city.name}</span>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-navy" onClick={() => { setEditingCity(city.name); setEditCityName(city.name); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteCity(city.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {cities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No cities found.</p>}
        </div>
      </div>

      {/* Districts Panel */}
      <div className="bg-white rounded-xl border border-[#eff3f4] p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-navy">Districts</h2>
          {selectedDistrictIds.length >= 2 && (
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                const firstSelected = districts.find(d => d.id === selectedDistrictIds[0])?.name || "";
                setMergedDistrictName(firstSelected);
                setMergeDialogOpen(true);
              }}
            >
              <Merge className="h-4 w-4 mr-2" />
              Merge Selected ({selectedDistrictIds.length})
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Showing districts for <strong className="text-navy">{selectedCity || "Select a city"}</strong>
        </p>
        
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="New district name..." 
            value={newDistrictName}
            onChange={e => setNewDistrictName(e.target.value)}
            disabled={loading || !selectedCity}
          />
          <Button onClick={handleCreateDistrict} disabled={loading || !newDistrictName.trim() || !selectedCity}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {filteredDistricts.map((district) => (
            <div key={district.id} className="flex items-center justify-between p-3 rounded-lg border border-[#eff3f4] hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  checked={selectedDistrictIds.includes(district.id)}
                  onChange={() => toggleDistrictSelection(district.id)}
                />
                {editingDistrict === district.id ? (
                  <div className="flex items-center gap-2 w-full mr-2">
                    <Input 
                      value={editDistrictName} 
                      onChange={e => setEditDistrictName(e.target.value)} 
                      autoFocus 
                      className="h-8"
                    />
                    <Button size="sm" onClick={() => handleUpdateDistrict(district.id, district.name)} disabled={loading}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDistrict(null)}>Cancel</Button>
                  </div>
                ) : (
                  <span className="font-medium text-[14px]" onClick={() => toggleDistrictSelection(district.id)}>{district.name}</span>
                )}
              </div>
              {editingDistrict !== district.id && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-navy" onClick={() => { setEditingDistrict(district.id); setEditDistrictName(district.name); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteDistrict(district.id, district.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          {selectedCity && filteredDistricts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No districts found for this city.</p>
          )}
          {!selectedCity && (
            <p className="text-sm text-muted-foreground text-center py-4">Select a city to view its districts.</p>
          )}
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Districts</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You are about to merge {selectedDistrictIds.length} selected districts. 
              Properties belonging to these districts will be updated to the new name.
            </p>
            <label className="text-sm font-semibold mb-2 block">Final District Name</label>
            <Input 
              value={mergedDistrictName} 
              onChange={e => setMergedDistrictName(e.target.value)}
              placeholder="e.g., Thuqbah"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={handleMergeDistricts} 
              disabled={loading || !mergedDistrictName.trim()}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
