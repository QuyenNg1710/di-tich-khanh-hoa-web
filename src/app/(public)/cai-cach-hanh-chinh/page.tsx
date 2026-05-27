"use client";

import { FormEvent, useMemo, useState } from "react";
import { LuDownload, LuSearch } from "react-icons/lu";

const documents = [
  {
    id: 1,
    code: "",
    title: "Công khai tình hình đầu tư xây dựng, mua sắm, giao, thuê tài sản công tháng 01/2022",
    issuedAt: "",
    category: "Văn bản của Trung tâm",
    hasFile: false,
  },
  {
    id: 2,
    code: "",
    title: "Công khai tình hình đầu tư xây dựng, mua sắm, giao, thuê tài sản công tháng 05/2022",
    issuedAt: "",
    category: "Văn bản của Trung tâm",
    hasFile: false,
  },
  {
    id: 3,
    code: "",
    title: "Công khai tình hình đầu tư xây dựng, mua sắm, giao, thuê tài sản công tháng 06/2022",
    issuedAt: "",
    category: "Văn bản của Trung tâm",
    hasFile: false,
  },
  {
    id: 4,
    code: "",
    title: "Công khai dự toán thu chi ngân sách 6 tháng năm 2022",
    issuedAt: "",
    category: "Văn bản của Trung tâm",
    hasFile: true,
  },
  {
    id: 5,
    code: "",
    title: "Công khai tình hình đầu tư xây dựng, mua sắm, giao, thuê tài sản công tháng 07 năm 2022",
    issuedAt: "",
    category: "Văn bản của Trung tâm",
    hasFile: false,
  },
  {
    id: 6,
    code: "21/QĐ-BTDT",
    title: "Quyết định về việc ban hành Quy chế quản lý, sử dụng tài sản nhà nước tại Trung tâm Bảo tồn di tích tỉnh Khánh Hòa",
    issuedAt: "20-01-2021",
    category: "Văn bản của Trung tâm",
    hasFile: true,
  },
  {
    id: 7,
    code: "20/QĐ-BTDT",
    title: "Quyết định về việc ban hành quy chế chi tiêu nội bộ của Trung tâm Bảo tồn di tích tỉnh Khánh Hòa",
    issuedAt: "20-01-2021",
    category: "Văn bản của Trung tâm",
    hasFile: true,
  },
  {
    id: 8,
    code: "67/QĐ-BTDT",
    title: "Quyết định ban hành kế hoạch tuyên truyền cải cách hành chính năm 2021",
    issuedAt: "05-04-2021",
    category: "Văn bản của Trung tâm",
    hasFile: true,
  },
  {
    id: 9,
    code: "82/QĐ-BTDT",
    title: "Quyết định công bố công khai quyết toán ngân sách năm 2020 và dự toán ngân sách năm 2021",
    issuedAt: "23-04-2021",
    category: "Văn bản của Trung tâm",
    hasFile: true,
  },
  {
    id: 10,
    code: "82/QĐ-BTDT",
    title: "Quyết định ban hành kế hoạch cải cách hành chính năm 2021",
    issuedAt: "23-04-2021",
    category: "Văn bản của Trung tâm",
    hasFile: true,
  },
];

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export default function CaiCachHanhChinhPage() {
  const [category, setCategory] = useState("all");
  const [keyword, setKeyword] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(documents.map((document) => document.category))),
    []
  );

  const filteredDocuments = useMemo(() => {
    const searchValue = normalizeSearch(keyword.trim());

    return documents.filter((document) => {
      const matchesCategory = category === "all" || document.category === category;
      const matchesKeyword =
        !searchValue ||
        normalizeSearch(`${document.code} ${document.title} ${document.issuedAt} ${document.category}`).includes(searchValue);

      return matchesCategory && matchesKeyword;
    });
  }, [category, keyword]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleExportDocument = (document: typeof documents[number]) => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${document.title}</title>
          <style>
            body { font-family: "Times New Roman", serif; font-size: 14pt; line-height: 1.5; }
            h1 { text-align: center; font-size: 18pt; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            td { border: 1px solid #333; padding: 8px 10px; vertical-align: top; }
            td:first-child { width: 170px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Thông tin văn bản</h1>
          <table>
            <tr><td>Số thứ tự</td><td>${document.id}</td></tr>
            <tr><td>Ký hiệu</td><td>${document.code || "Chưa cập nhật"}</td></tr>
            <tr><td>Tên văn bản</td><td>${document.title}</td></tr>
            <tr><td>Ngày ban hành</td><td>${document.issuedAt || "Chưa cập nhật"}</td></tr>
            <tr><td>Danh mục</td><td>${document.category}</td></tr>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    const fileName = `van-ban-${document.id}.doc`;

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Cải cách hành chính</h1>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 w-full border border-slate-300 bg-white px-4 text-base text-slate-700 outline-none transition-colors focus:border-blue-600 md:w-64"
          >
            <option value="all">-Danh mục-</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="relative w-full md:w-72">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm kiếm"
              className="h-12 w-full border border-slate-300 bg-white px-4 pr-10 text-base text-slate-700 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-600"
            />
            <LuSearch className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="submit"
            className="h-12 bg-blue-700 px-7 text-base font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="mt-10 overflow-x-auto border border-slate-300 bg-white">
          <table className="min-w-[1100px] w-full border-collapse text-left text-base text-slate-900">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="w-14 border-r border-blue-600 px-4 py-3 font-semibold" />
                <th className="w-48 border-r border-blue-600 px-4 py-3 font-semibold">Ký hiệu</th>
                <th className="border-r border-blue-600 px-4 py-3 font-semibold">Tên văn bản</th>
                <th className="w-56 border-r border-blue-600 px-4 py-3 text-center font-semibold">Ngày ban hành</th>
                <th className="w-72 border-r border-blue-600 px-4 py-3 font-semibold">Danh mục</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="border-t border-slate-300 align-top">
                  <td className="border-r border-slate-300 px-4 py-3 text-center">{document.id}</td>
                  <td className="border-r border-slate-300 px-4 py-3">{document.code}</td>
                  <td className="border-r border-slate-300 px-4 py-3 leading-7">{document.title}</td>
                  <td className="border-r border-slate-300 px-4 py-3 text-center">{document.issuedAt}</td>
                  <td className="border-r border-slate-300 px-4 py-3">{document.category}</td>
                  <td className="px-3 py-3 text-center">
                    {document.hasFile && (
                      <button
                        type="button"
                        onClick={() => handleExportDocument(document)}
                        className="inline-flex h-7 w-7 items-center justify-center text-slate-700 transition-colors hover:text-blue-700"
                        aria-label={`Tải văn bản ${document.title}`}
                      >
                        <LuDownload className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDocuments.length === 0 && (
            <div className="border-t border-slate-300 px-4 py-8 text-center text-slate-500">
              Không tìm thấy văn bản phù hợp.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
