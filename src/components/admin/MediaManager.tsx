"use client";

import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LuImage, LuMusic, LuUpload, LuVideo, LuX } from "react-icons/lu";
import SupabaseMediaPicker from "./SupabaseMediaPicker";

interface MediaItem {
  id: number;
  url: string;
  moTa: string | null;
  thuTu: number;
}

interface Props {
  diTichId: number;
  hinhAnhs: MediaItem[];
  videos: MediaItem[];
  audios: MediaItem[];
  onRefresh: () => void;
}

const MAX_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
};

const ACCEPT: Record<string, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
};

const BUCKETS: Record<string, string> = {
  image: "images",
  video: "videos",
  audio: "audio",
};

export default function MediaManager({ diTichId, hinhAnhs, videos, audios, onRefresh }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const refs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    image: imageRef,
    video: videoRef,
    audio: audioRef,
  };

  async function handleUpload(file: File, type: "image" | "video" | "audio") {
    if (file.size > MAX_SIZES[type]) {
      const maxMB = MAX_SIZES[type] / (1024 * 1024);
      toast.error(`File vuot qua ${maxMB}MB`);
      return;
    }

    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", BUCKETS[type]);
    formData.append("prefix", String(diTichId));

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      toast.error("Loi upload: " + (uploadData.error || "Khong upload duoc file"));
      setUploading(null);
      return;
    }

    const res = await fetch(`/api/ditich/${diTichId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url: uploadData.url, moTa: file.name }),
    });

    if (res.ok) {
      toast.success("Upload thanh cong");
      onRefresh();
    } else {
      toast.error("Loi luu thong tin media");
    }
    setUploading(null);
  }

  async function handleDelete(type: "image" | "video" | "audio", mediaId: number) {
    const res = await fetch(`/api/ditich/${diTichId}/media?type=${type}&mediaId=${mediaId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Da xoa");
      onRefresh();
    } else {
      toast.error("Loi khi xoa");
    }
  }

  async function handlePickFromLibrary(url: string, type: "image" | "video" | "audio") {
    const res = await fetch(`/api/ditich/${diTichId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url, moTa: url.split("/").pop() || "" }),
    });

    if (res.ok) {
      toast.success("Da them tu thu vien");
      onRefresh();
    } else {
      toast.error("Loi luu thong tin media");
    }
  }

  function handleFileDrop(e: React.DragEvent, type: "image" | "video" | "audio") {
    e.preventDefault();
    setDragActive(null);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file, type);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "audio") {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => handleUpload(file, type));
    }
    e.target.value = "";
  }

  function DropZone({ type, label, icon: Icon }: { type: "image" | "video" | "audio"; label: string; icon: typeof LuImage }) {
    const isUploading = uploading === type;
    const isDragging = dragActive === type;

    return (
      <div className="space-y-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(type); }}
          onDragLeave={() => setDragActive(null)}
          onDrop={(e) => handleFileDrop(e, type)}
          onClick={() => refs[type]?.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging ? "border-teal-500 bg-teal-50/50" : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/30"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500">Dang upload...</span>
            </div>
          ) : (
            <>
              <Icon className={`h-8 w-8 ${isDragging ? "text-teal-500" : "text-slate-400"}`} />
              <p className="text-sm text-slate-500">Keo tha hoac click de upload {label} moi</p>
            </>
          )}
          <input
            ref={refs[type] as React.RefObject<HTMLInputElement>}
            type="file"
            accept={ACCEPT[type]}
            multiple={type === "image"}
            onChange={(e) => handleFileChange(e, type)}
            className="hidden"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">hoac</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <SupabaseMediaPicker
          bucket={BUCKETS[type]}
          accept={type}
          onSelect={(url) => handlePickFromLibrary(url, type)}
        >
          Chon {label} tu thu vien da upload
        </SupabaseMediaPicker>
      </div>
    );
  }

  function MediaGrid({ items, type }: { items: MediaItem[]; type: "image" | "video" | "audio" }) {
    if (items.length === 0) return <p className="text-sm text-slate-400 py-4 text-center">Chua co du lieu</p>;

    return (
      <div className={`grid gap-3 ${type === "image" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1"}`}>
        {items.map((item) => (
          <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white">
            {type === "image" ? (
              <img src={item.url} alt={item.moTa || ""} className="w-full h-32 object-cover" />
            ) : type === "video" ? (
              <video src={item.url} controls className="w-full h-40 rounded-lg" />
            ) : (
              <div className="p-4 flex items-center gap-3">
                <LuMusic className="h-8 w-8 text-teal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.moTa || "Audio"}</p>
                  <audio src={item.url} controls className="w-full mt-2" />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleDelete(type, item.id)}
              className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <LuX className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList>
        <TabsTrigger value="images">Hinh anh ({hinhAnhs.length})</TabsTrigger>
        <TabsTrigger value="videos">Video ({videos.length})</TabsTrigger>
        <TabsTrigger value="audios">Audio ({audios.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="images" className="space-y-4">
        <DropZone type="image" label="hinh anh" icon={LuImage} />
        <MediaGrid items={hinhAnhs} type="image" />
      </TabsContent>

      <TabsContent value="videos" className="space-y-4">
        <DropZone type="video" label="video" icon={LuVideo} />
        <MediaGrid items={videos} type="video" />
      </TabsContent>

      <TabsContent value="audios" className="space-y-4">
        <DropZone type="audio" label="audio thuyet minh" icon={LuMusic} />
        <MediaGrid items={audios} type="audio" />
      </TabsContent>
    </Tabs>
  );
}
