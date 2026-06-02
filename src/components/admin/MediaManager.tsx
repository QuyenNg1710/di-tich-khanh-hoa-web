"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LuImage, LuLink, LuMusic, LuUpload, LuVideo, LuVolume2, LuX } from "react-icons/lu";
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
  description?: string;
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

function getVideoEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsedUrl.hostname.includes("drive.google.com")) {
      const match = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
      return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
  } catch {}

  return url;
}

function isEmbedVideoUrl(url: string) {
  return /youtube\.com|youtu\.be|drive\.google\.com/i.test(url);
}

export default function MediaManager({ diTichId, hinhAnhs, videos, audios, description = "", onRefresh }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [linkInputs, setLinkInputs] = useState({ image: "", video: "" });
  const [manualImageLinks, setManualImageLinks] = useState<string[]>([]);
  const [ttsText, setTtsText] = useState(description);
  const [creatingAudio, setCreatingAudio] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const refs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    image: imageRef,
    video: videoRef,
    audio: audioRef,
  };
  const ttsAudio = audios.find((audio) => audio.url.startsWith("tts://"));
  const uploadedAudios = audios.filter((audio) => !audio.url.startsWith("tts://"));

  useEffect(() => {
    setTtsText(description);
  }, [description]);

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

  async function handleAddByUrl(type: "image" | "video") {
    const url = linkInputs[type].trim();

    if (!url) {
      toast.error("Vui lòng nhập link");
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid url");
      }
    } catch {
      toast.error("Link không hợp lệ");
      return;
    }

    const res = await fetch(`/api/ditich/${diTichId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url, moTa: url.split("/").pop() || "" }),
    });

    if (res.ok) {
      toast.success("Đã thêm link media");
      setLinkInputs((current) => ({ ...current, [type]: "" }));
      onRefresh();
    } else {
      toast.error("Không thể lưu link media");
    }
  }

  async function handleAddManualImageLink(index: number) {
    const url = manualImageLinks[index]?.trim();

    if (!url) {
      toast.error("Vui lòng nhập link ảnh");
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid url");
      }
    } catch {
      toast.error("Link ảnh không hợp lệ");
      return;
    }

    const res = await fetch(`/api/ditich/${diTichId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "image", url, moTa: url.split("/").pop() || "" }),
    });

    if (res.ok) {
      toast.success("Đã thêm link ảnh");
      setManualImageLinks((current) => current.filter((_, currentIndex) => currentIndex !== index));
      onRefresh();
    } else {
      toast.error("Không thể lưu link ảnh");
    }
  }

  async function handleCreateAudioFromText() {
    const text = ttsText.trim();

    if (!text) {
      toast.error("Vui lòng nhập nội dung để lưu giọng đọc");
      return;
    }

    setCreatingAudio(true);

    const res = await fetch(`/api/ditich/${diTichId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "audio", url: "tts://description", moTa: text }),
    });

    if (res.ok) {
      toast.success("Đã lưu văn bản đọc tiếng Việt");
      onRefresh();
    } else {
      toast.error("Không thể lưu văn bản đọc");
    }

    setCreatingAudio(false);
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
        {type === "video" && (
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={linkInputs[type]}
                onChange={(e) => setLinkInputs((current) => ({ ...current, [type]: e.target.value }))}
                placeholder="Nhập link video MP4, YouTube hoặc Drive..."
                className="h-10"
              />
              <Button type="button" onClick={() => handleAddByUrl(type)} className="h-10 sm:w-36">
                <LuLink className="h-4 w-4" />
                Thêm link
              </Button>
            </div>
          </div>
        )}

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
              <p className="text-sm text-slate-500">Kéo thả hoặc click để upload {label} mới</p>
              <p className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                <LuUpload className="h-3.5 w-3.5" />
                {type === "image" ? "Tải ảnh lên ImgBB và chuyển thành link" : "Tải file lên hệ thống"}
              </p>
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
        {type !== "image" && (
          <>
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
          </>
        )}
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
              isEmbedVideoUrl(item.url) ? (
                <iframe
                  src={getVideoEmbedUrl(item.url)}
                  title={item.moTa || "Video"}
                  className="h-56 w-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={item.url} controls className="w-full h-40 rounded-lg" />
              )
            ) : (
              <div className="p-4 flex items-center gap-3">
                <LuMusic className="h-8 w-8 text-teal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  {item.url.startsWith("tts://") ? (
                    <>
                      <p className="text-sm font-semibold">Văn bản đọc giọng nói</p>
                      <p className="mt-2 rounded-lg bg-teal-50 p-3 text-sm leading-6 text-slate-700">
                        {item.moTa}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{item.moTa || "Audio"}</p>
                      <audio src={item.url} controls className="w-full mt-2" />
                    </>
                  )}
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

  function ImageLinkInputs() {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Link ảnh media</p>
            <p className="text-xs text-slate-500">
              Mỗi ảnh đã tải lên sẽ hiển thị một ô link tương ứng.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setManualImageLinks((current) => [...current, ""])}
            className="sm:w-36"
          >
            <LuLink className="h-4 w-4" />
            Thêm link
          </Button>
        </div>

        {hinhAnhs.length > 0 ? (
          <div className="space-y-2">
            {hinhAnhs.map((image) => (
              <div key={image.id} className="flex flex-col gap-2 sm:flex-row">
                <Input value={image.url} readOnly className="h-10 bg-slate-50" />
                <Button
                  type="button"
                  variant="destructive"
                  className="h-10 sm:w-24"
                  onClick={() => handleDelete("image", image.id)}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Chưa có ảnh media nào.
          </p>
        )}

        {manualImageLinks.length > 0 ? (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            {manualImageLinks.map((value, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={value}
                  onChange={(e) =>
                    setManualImageLinks((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? e.target.value : item
                      )
                    )
                  }
                  placeholder="Nhập link ảnh..."
                  className="h-10"
                />
                <Button
                  type="button"
                  className="h-10 sm:w-28"
                  onClick={() => handleAddManualImageLink(index)}
                >
                  Lưu link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 sm:w-20"
                  onClick={() =>
                    setManualImageLinks((current) =>
                      current.filter((_, currentIndex) => currentIndex !== index)
                    )
                  }
                >
                  Hủy
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList>
        <TabsTrigger value="images">Hinh anh ({hinhAnhs.length})</TabsTrigger>
        <TabsTrigger value="videos">Video ({videos.length})</TabsTrigger>
        <TabsTrigger value="audios">Giọng nói ({ttsAudio ? 1 : 0})</TabsTrigger>
      </TabsList>

      <TabsContent value="images" className="space-y-4">
        <ImageLinkInputs />
        <DropZone type="image" label="hinh anh" icon={LuImage} />
        <MediaGrid items={hinhAnhs} type="image" />
      </TabsContent>

      <TabsContent value="videos" className="space-y-4">
        <DropZone type="video" label="video" icon={LuVideo} />
        <MediaGrid items={videos} type="video" />
      </TabsContent>

      <TabsContent value="audios" className="space-y-4">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <LuVolume2 className="h-4 w-4 text-teal-600" />
            Lưu văn bản đọc giọng Tiếng Việt
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Nội dung này sẽ hiển thị bằng nút loa ở trang chi tiết. Khi người dùng nhấn nghe, hệ thống sẽ tạo file giọng đọc tiếng Việt tự động và phát trực tiếp.
          </p>
          <Textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            rows={4}
            placeholder="Nhập hoặc chỉnh nội dung mô tả để đọc giọng Tiếng Việt..."
          />
          <Button type="button" onClick={handleCreateAudioFromText} disabled={creatingAudio}>
            <LuVolume2 className="h-4 w-4" />
            {creatingAudio ? "Đang lưu..." : "Lưu văn bản đọc"}
          </Button>
        </div>

        {ttsAudio ? (
          <div className="relative rounded-xl border border-teal-100 bg-teal-50/60 p-4">
            <div className="flex items-start gap-3">
              <LuVolume2 className="mt-1 h-5 w-5 shrink-0 text-teal-700" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">Văn bản đang dùng ở trang chi tiết</p>
                <p className="mt-2 rounded-lg bg-white p-3 text-sm leading-6 text-slate-700">{ttsAudio.moTa}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete("audio", ttsAudio.id)}
              className="absolute right-2 top-2 rounded-lg bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600"
            >
              <LuX className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            Chưa lưu văn bản đọc giọng nói.
          </p>
        )}

        {uploadedAudios.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Audio file đã upload trước đây</p>
            <MediaGrid items={uploadedAudios} type="audio" />
          </div>
        ) : null}

      </TabsContent>
    </Tabs>
  );
}
