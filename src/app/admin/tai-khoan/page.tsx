"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { HiPlus } from "react-icons/hi";

interface User {
  id: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  trangThai: boolean;
  createdAt: string;
  _count: { danhGias: number; yeuThichs: number };
}

export default function AdminTaiKhoanPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "USER" });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.email || !form.password || !form.fullName) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Tạo tài khoản thành công");
      setShowCreate(false);
      setForm({ email: "", password: "", fullName: "", role: "USER" });
      fetchData();
    } else {
      toast.error(data.error || "Lỗi tạo tài khoản");
    }
    setCreating(false);
  }

  async function toggleStatus(id: string, current: boolean) {
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: !current }),
    });
    toast.success(current ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản");
    fetchData();
  }

  async function toggleRole(id: string, current: string) {
    const newRole = current === "ADMIN" ? "USER" : "ADMIN";
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    toast.success(`Đã đổi role thành ${newRole}`);
    fetchData();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] font-heading">Quản lý Tài khoản</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} tài khoản trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all active:scale-95"
        >
          <HiPlus className="h-4 w-4" /> Tạo tài khoản
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Yêu thích</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-32">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400">Đang tải...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400">Chưa có tài khoản</TableCell></TableRow>
            ) : users.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-teal-50 text-teal-700 text-xs font-heading">{u.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email || "—"}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="text-xs">{u.role}</Badge>
                </TableCell>
                <TableCell>{u._count.danhGias}</TableCell>
                <TableCell>{u._count.yeuThichs}</TableCell>
                <TableCell>{format(new Date(u.createdAt), "dd/MM/yyyy", { locale: vi })}</TableCell>
                <TableCell>
                  <Badge variant={u.trangThai ? "default" : "destructive"} className="text-xs">
                    {u.trangThai ? "Hoạt động" : "Khoá"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleRole(u.id, u.role)}>
                      {u.role === "ADMIN" ? "→ User" : "→ Admin"}
                    </Button>
                    <Button variant={u.trangThai ? "destructive" : "default"} size="sm" className="text-xs" onClick={() => toggleStatus(u.id, u.trangThai)}>
                      {u.trangThai ? "Khoá" : "Mở"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Tạo tài khoản mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên *</Label>
              <Input placeholder="Nguyễn Văn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu *</Label>
              <Input type="password" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select
                value={form.role}
                onValueChange={(v) => v && setForm({ ...form, role: v })}
                items={{ USER: "User", ADMIN: "Admin" }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowCreate(false)} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold font-heading border border-slate-200 hover:bg-slate-50 transition-all">
              Huỷ
            </button>
            <button onClick={handleCreate} disabled={creating} className="inline-flex items-center bg-[#0D9488] hover:bg-[#008378] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all disabled:opacity-50">
              {creating ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
