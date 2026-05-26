import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
    "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
  );

export const diTichSchema = z.object({
  tenDiTich: z
    .string()
    .min(1, "Tên di tích không được để trống")
    .max(200, "Tên di tích tối đa 200 ký tự"),
  moTa: z.string().min(1, "Mô tả không được để trống"),
  moTaChiTiet: z.string().optional(),
  diaChi: z.string().min(1, "Địa chỉ không được để trống"),
  toaDoLat: z.number().min(-90).max(90),
  toaDoLng: z.number().min(-180).max(180),
  danhMucId: z
    .number({ error: "Vui lòng chọn danh mục" })
    .int("Vui lòng chọn danh mục")
    .positive("Vui lòng chọn danh mục"),
  capDiTich: z.enum(["CAP_TINH", "CAP_QUOC_GIA"]),
  hinhAnhDaiDien: z.string().optional(),
});

export const danhMucSchema = z.object({
  tenDanhMuc: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
  moTa: z.string().optional(),
  thuTu: z.number().int().min(0).optional(),
});

export const danhGiaSchema = z.object({
  diemSo: z.number().int().min(1, "Tối thiểu 1 sao").max(5, "Tối đa 5 sao"),
  binhLuan: z.string().optional(),
});

export const baiVietSchema = z.object({
  tieuDe: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(300, "Tiêu đề tối đa 300 ký tự"),
  noiDung: z.string().min(1, "Nội dung không được để trống"),
  hinhAnh: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Họ tên không được để trống"),
    email: z.string().trim().email("Email không hợp lệ"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type DiTichInput = z.infer<typeof diTichSchema>;
export type DanhMucInput = z.infer<typeof danhMucSchema>;
export type DanhGiaInput = z.infer<typeof danhGiaSchema>;
export type BaiVietInput = z.infer<typeof baiVietSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
