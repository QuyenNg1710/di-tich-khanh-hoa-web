"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LuCheck, LuFolderOpen, LuImage, LuMusic, LuVideo } from "react-icons/lu";

interface FlatFile {
  path: string;
  name: string;
  url: string;
  metadata: { size?: number; mimetype?: string } | null;
}

interface Props {
  bucket: string;
  accept?: "image" | "video" | "audio";
  onSelect: (url: string) => void;
  children?: React.ReactNode;
}

export default function SupabaseMediaPicker({ bucket, accept, onSelect, children }: Props) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FlatFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FlatFile | null>(null);

  const fetchAllFiles = useCallback(async () => {
    setLoading(true);
    setSelected(null);

    const res = await fetch(`/api/upload?bucket=${encodeURIComponent(bucket)}`);
    const data = await res.json();

    if (!res.ok) {
      toast.error("Loi tai thu vien: " + (data.error || "Khong lay duoc danh sach file"));
      setFiles([]);
      setLoading(false);
      return;
    }

    setFiles(data.files || []);
    setLoading(false);
  }, [bucket]);

  useEffect(() => {
    if (open) fetchAllFiles();
  }, [open, fetchAllFiles]);

  function handleSelect() {
    if (!selected) return;
    onSelect(selected.url);
    setOpen(false);
    setSelected(null);
  }

  function getIcon() {
    if (accept === "video") return <LuVideo className="h-4 w-4" />;
    if (accept === "audio") return <LuMusic className="h-4 w-4" />;
    return <LuImage className="h-4 w-4" />;
  }

  function isPreviewable(file: FlatFile) {
    const mime = file.metadata?.mimetype || "";
    return mime.startsWith("image/");
  }

  function formatSize(bytes?: number) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all"
      >
        <LuFolderOpen className="h-4 w-4" />
        {children || "Chon tu thu vien"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chon tu thu vien ({files.length} file)</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 -mx-4 px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <p className="text-center py-12 text-sm text-slate-400">Chua co file nao</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {files.map((file) => {
                  const isSelected = selected?.path === file.path;
                  return (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : file)}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-teal-500 ring-2 ring-teal-200"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {isPreviewable(file) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square flex flex-col items-center justify-center gap-1 bg-slate-50 p-2">
                          {getIcon()}
                          <span className="text-[10px] text-slate-500 truncate w-full text-center">
                            {file.name}
                          </span>
                        </div>
                      )}
                      {file.metadata?.size && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatSize(file.metadata.size)}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 p-1 bg-teal-500 text-white rounded-full">
                          <LuCheck className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Huy
            </button>
            <button
              type="button"
              onClick={handleSelect}
              disabled={!selected}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Chon
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
