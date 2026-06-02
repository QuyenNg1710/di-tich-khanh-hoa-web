"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileEditFormProps {
  fullName: string;
  avatarUrl?: string | null;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

export function ProfileEditForm({
  fullName,
  avatarUrl,
}: ProfileEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [name, setName] = useState(fullName);
  const [imageUrl, setImageUrl] = useState(avatarUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/auth/avatar-upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Không upload được ảnh.");
      }

      setImageUrl(data.url);
      toast.success("Đã upload ảnh lên ImgBB.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không upload được ảnh."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      toast.error("Họ tên phải có ít nhất 2 ký tự.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: trimmedName,
          avatarUrl: imageUrl.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Không cập nhật được thông tin.");
      }

      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: {
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
          },
        })
      );
      toast.success("Đã cập nhật thông tin cá nhân.");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không cập nhật được thông tin."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-teal-100 bg-white p-4 shadow-ambient-teal">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-slate-950">
            Chỉnh sửa thông tin
          </h3>
          <p className="text-sm text-slate-500">
            Cập nhật tên hiển thị và ảnh đại diện của tài khoản.
          </p>
        </div>
        <Button
          type="button"
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing((current) => !current)}
        >
          {isEditing ? "Đóng" : "Chỉnh sửa"}
        </Button>
      </div>

      {isEditing ? (
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="size-24 ring-4 ring-teal-100">
              {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
              <AvatarFallback className="bg-teal-50 font-heading text-3xl font-bold text-teal-700">
                {getInitial(name)}
              </AvatarFallback>
            </Avatar>

            {imageUrl ? (
              <div className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                <img
                  src={imageUrl}
                  alt="Ảnh đại diện"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-full-name">Họ và tên</Label>
              <Input
                id="profile-full-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nhập họ và tên"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-avatar-url">Link ảnh đại diện</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-avatar-url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://..."
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                  className="h-10"
                >
                  {isUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Bạn có thể nhập link ảnh trực tiếp hoặc upload ảnh lên ImgBB.
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleUpload(file);
                }
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Lưu thay đổi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={isSaving || isUploading}
              >
                <Camera className="size-4" />
                Chọn ảnh
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
