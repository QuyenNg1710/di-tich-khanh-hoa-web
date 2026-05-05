"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { LuUpload, LuX, LuImage } from "react-icons/lu";
import SupabaseMediaPicker from "./SupabaseMediaPicker";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
}

export default function ImageUpload({ value, onChange, bucket = "images" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File vượt quá 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error("Lỗi upload: " + (data.error || "Không upload được file"));
      setUploading(false);
      return;
    }

    setPreview(data.url);
    onChange(data.url);
    setUploading(false);
    toast.success("Upload thành công");
  }, [bucket, onChange]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleRemove() {
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handlePickFromLibrary(url: string) {
    setPreview(url);
    onChange(url);
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              dragActive
                ? "border-teal-500 bg-teal-50/50"
                : "border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-teal-50/30"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Đang upload...</p>
              </div>
            ) : (
              <>
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  {dragActive ? <LuImage className="h-6 w-6" /> : <LuUpload className="h-6 w-6" />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {dragActive ? "Thả ảnh vào đây" : "Kéo thả hoặc click để upload ảnh mới"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP - Tối đa 5MB</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">hoặc</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <SupabaseMediaPicker
            bucket={bucket}
            accept="image"
            onSelect={handlePickFromLibrary}
          >
            Chọn từ thư viện đã upload
          </SupabaseMediaPicker>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
