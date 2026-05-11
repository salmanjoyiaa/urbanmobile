"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mic, Square, Paperclip, CheckCircle2, X, Video } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance Repair",
  "Painting",
  "Deep Cleaning",
  "Carpentry",
  "Safety & Security",
  "Landscaping",
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestSchema = z.object({
  service_type: z.string().min(2, "Choose a category"),
  customer_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  customer_email: z.string().regex(emailRegex, "Valid email is required"),
  customer_phone: z.string().regex(/^\+\d{10,15}$/, "Invalid phone number"),
  details: z.string().max(5000).optional(),
  visit_date: z.string().min(1, "Preferred date is required"),
  visit_time: z.string().min(1, "Preferred time is required"),
});

type RequestInput = z.infer<typeof requestSchema>;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function defaultVisitDate() {
  return new Date().toISOString().split("T")[0];
}

export function GeneralMaintenanceRequestForm() {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    mode: "onTouched",
    defaultValues: {
      service_type: SERVICE_CATEGORIES[0],
      visit_date: defaultVisitDate(),
      visit_time: "09:00",
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      let duration = 0;
      timerRef.current = setInterval(() => {
        duration += 1;
        setRecordingDuration(duration);
        if (duration >= 60) {
          stopRecording();
        }
      }, 1000);
    } catch {
      toast.error("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setSelectedPhotos((prev) => [...prev, ...files].slice(0, 3));
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be 50MB or smaller.");
      return;
    }
    setSelectedVideo(file);
  };

  const onSubmit = async (values: RequestInput) => {
    setIsSubmitting(true);
    let audio_url: string | null = null;
    const media_urls: string[] = [];

    try {
      const folderId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const base = `requests/general/${folderId}`;

      if (audioBlob) {
        const path = `${base}/${Date.now()}-audio.webm`;
        const { error: uploadError } = await supabase.storage
          .from("maintenance-media")
          .upload(path, audioBlob, { contentType: "audio/webm" });

        if (uploadError) throw new Error("Failed to upload audio message");
        audio_url = path;
      }

      for (const photo of selectedPhotos) {
        const path = `${base}/${Date.now()}-${sanitizeFileName(photo.name)}`;
        const { error: uploadError } = await supabase.storage.from("maintenance-media").upload(path, photo);

        if (uploadError) throw new Error(`Failed to upload ${photo.name}`);
        media_urls.push(path);
      }

      if (selectedVideo) {
        const path = `${base}/${Date.now()}-${sanitizeFileName(selectedVideo.name)}`;
        const { error: uploadError } = await supabase.storage.from("maintenance-media").upload(path, selectedVideo, {
          contentType: selectedVideo.type || "video/mp4",
        });
        if (uploadError) throw new Error("Failed to upload video");
        media_urls.push(path);
      }

      const apiRes = await fetch("/api/maintenance-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: null,
          agent_id: null,
          service_type: values.service_type,
          customer_name: values.customer_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          details: values.details,
          visit_date: values.visit_date,
          visit_time: values.visit_time,
          audio_url,
          media_urls,
        }),
      });

      const apiData = (await apiRes.json()) as { error?: string };
      if (!apiRes.ok) throw new Error(apiData.error || "Failed to submit request");

      setSubmitted(true);
      toast.success("Request submitted successfully!");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 shadow-sm text-center py-10">
        <CardContent className="flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 mb-2">Request received</h3>
          <p className="text-emerald-700 max-w-sm">
            Our team will review your request and match you with a suitable maintenance professional.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle>Request maintenance help</CardTitle>
        <CardDescription>
          Tell us what you need — no need to pick a provider yet. Optional voice note, photos, or a short video.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="service_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.service_type && <p className="text-xs text-destructive">{errors.service_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("customer_name")} placeholder="John Doe" />
            {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...register("customer_email")} type="email" placeholder="john@example.com" />
            {errors.customer_email && <p className="text-xs text-destructive">{errors.customer_email.message}</p>}
          </div>

          <Controller
            name="customer_phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="WhatsApp number"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.customer_phone}
                showHelper={true}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred date</Label>
              <Input type="date" {...register("visit_date")} min={defaultVisitDate()} />
              {errors.visit_date && <p className="text-xs text-destructive">{errors.visit_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Preferred time</Label>
              <Input type="time" {...register("visit_time")} />
              {errors.visit_time && <p className="text-xs text-destructive">{errors.visit_time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Problem details (optional)</Label>
            <Textarea {...register("details")} placeholder="Describe the issue…" className="min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label>Voice message (optional)</Label>
            {!audioBlob ? (
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <>
                    <Button type="button" variant="destructive" size="icon" onClick={stopRecording} className="animate-pulse">
                      <Square className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-destructive">Recording… {recordingDuration}s</span>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" size="icon" onClick={startRecording} className="rounded-full">
                      <Mic className="w-4 h-4 text-primary" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Record up to 60s</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-muted p-3 rounded-xl border">
                <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 max-w-[200px]" />
                <Button type="button" variant="ghost" size="icon" onClick={removeAudio} className="ml-auto text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photos (max 3)</Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => document.getElementById("general-photo-upload")?.click()}>
                <Paperclip className="w-4 h-4 mr-2" />
                Attach photos
              </Button>
              <span className="text-sm text-muted-foreground">{selectedPhotos.length}/3</span>
              <input
                id="general-photo-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
                disabled={selectedPhotos.length >= 3}
              />
            </div>
            {selectedPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative group rounded-md overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(photo)} alt="" className="w-16 h-16 object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Short video (optional, one file, max 50MB)</Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => document.getElementById("general-video-upload")?.click()}>
                <Video className="w-4 h-4 mr-2" />
                Attach video
              </Button>
              {selectedVideo && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">{selectedVideo.name}</span>
              )}
              <input
                id="general-video-upload"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="hidden"
                onChange={handleVideoSelect}
              />
              {selectedVideo && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedVideo(null)}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
