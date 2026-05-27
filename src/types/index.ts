import type {
  DiTich,
  DanhMuc,
  HinhAnh,
  Video,
  Audio,
  DanhGia,
  YeuThich,
  BaiViet,
  Profile,
  ThongKeTruyCap,
  DonViQuanLy,
} from "@prisma/client";

export type {
  DiTich,
  DanhMuc,
  HinhAnh,
  Video,
  Audio,
  DanhGia,
  YeuThich,
  BaiViet,
  Profile,
  ThongKeTruyCap,
  DonViQuanLy,
};

export interface DiTichWithRelations extends DiTich {
  danhMuc: DanhMuc;
  hinhAnhs: HinhAnh[];
  videos: Video[];
  audios: Audio[];
  danhGias: (DanhGia & { user: Profile })[];
}

export interface DiTichForMap {
  id: number;
  tenDiTich: string;
  diaChi: string;
  donViQuanLy: string | null;
  toaDoLat: number;
  toaDoLng: number;
  capDiTich: string;
  hinhAnhDaiDien: string | null;
  tenDanhMuc: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface DiTichFilter {
  search?: string;
  danhMucId?: number;
  capDiTich?: "CAP_TINH" | "CAP_QUOC_GIA";
  donViQuanLy?: string;
  donViQuanLyId?: number;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ThongKeTongQuan {
  tongDiTich: number;
  tongBaiViet: number;
  tongNguoiDung: number;
  tongLuotXem: number;
}
