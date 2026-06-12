"use client";

import Image from "next/image";
import { useState } from "react";
import { FaFacebookF, FaYoutube, FaTwitter } from "react-icons/fa";
import { LuCheck, LuMail, LuMapPin, LuPhone, LuX } from "react-icons/lu";

export default function LienHePage() {
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    content: "",
  });

  function validateForm() {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phoneDigits = formData.phone.replace(/\D/g, "");
    const content = formData.content.trim();

    if (!name || !email || !formData.phone.trim() || !content) {
      return "Vui lòng nhập đầy đủ thông tin.";
    }

    if (name.length < 3) {
      return "Họ và tên phải có ít nhất 3 ký tự.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Hộp thư chưa đúng định dạng email.";
    }

    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      return "Số điện thoại phải có từ 9 đến 11 chữ số.";
    }

    if (content.length < 10) {
      return "Nội dung cần có ít nhất 10 ký tự.";
    }

    return "";
  }

  function updateField(field: keyof typeof formData, value: string) {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);
    setMessage("");
    setSent(false);

    if (Object.values(nextFormData).some((fieldValue) => fieldValue.trim().length === 0)) {
      setVerified(false);
    }
  }

  function handleVerify() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setVerified(false);
      setMessage(validationMessage);
      return;
    }

    setVerified((value) => !value);
    setMessage("");
  }

  async function handleSubmit() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setSent(false);
      setMessage(validationMessage);
      return;
    }

    if (!verified) {
      setSent(false);
      setMessage("Vui lòng xác nhận bạn không phải là người máy.");
      return;
    }

    setSending(true);
    setSent(false);
    setMessage("");

    try {
      const response = await fetch("/api/lien-he", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof responseData?.message === "string"
            ? responseData.message
            : "Không gửi được email. Vui lòng thử lại sau."
        );
      }

      setSent(true);
      setVerified(false);
      setFormData({ name: "", email: "", phone: "", content: "" });
    } catch (error) {
      setSent(false);
      setMessage(error instanceof Error ? error.message : "Không gửi được email. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <p className="text-xs font-semibold uppercase text-orange-500">Liên hệ</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 font-heading">
            Tư vấn và hỏi đáp
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[0.95fr_1fr]">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">Thông tin liên hệ</h2>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h3 className="text-sm font-extrabold uppercase text-slate-900">
                Trung tâm bảo tồn di sản văn hoá tỉnh Khánh Hoà
              </h3>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">Địa chỉ</h4>
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
                <LuMapPin className="mt-1 h-4 w-4 shrink-0 text-slate-700" />
                54 Sinh Trung, Nha Trang, Khánh Hòa
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">Điện thoại</h4>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <LuPhone className="h-4 w-4 text-slate-700" />
                (0258) 3813758
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">Hộp thư</h4>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <LuMail className="h-4 w-4 text-slate-700" />
                quyen.nh.64cntt@ntu.edu.vn
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">Theo dõi chúng tôi tại</h4>
              <div className="mt-3 flex items-center gap-7 text-slate-800">
                <FaFacebookF className="h-4 w-4" />
                <FaTwitter className="h-4 w-4" />
                <FaYoutube className="h-4 w-4" />
                <span className="text-sm italic">Zalo</span>
              </div>
            </div>
          </div>

          {sent && (
            <div className="mt-8 flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
              <span>Tin nhắn của bạn đã được gửi đi thành công.</span>
              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={() => setSent(false)}
                className="rounded p-1 text-emerald-700 hover:bg-emerald-200"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">Gửi email cho chúng tôi</h2>

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="h-11 w-full rounded-sm border border-slate-300 bg-white px-4 text-sm outline-none transition-colors focus:border-orange-500"
              placeholder="Họ và tên"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-11 w-full rounded-sm border border-slate-300 bg-white px-4 text-sm outline-none transition-colors focus:border-orange-500"
                placeholder="Hộp thư"
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="h-11 w-full rounded-sm border border-slate-300 bg-white px-4 text-sm outline-none transition-colors focus:border-orange-500"
                placeholder="Điện thoại"
              />
            </div>

            <textarea
              rows={5}
              value={formData.content}
              onChange={(event) => updateField("content", event.target.value)}
              className="w-full resize-none rounded-sm border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-orange-500"
              placeholder="Nội dung"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="flex min-h-16 w-full max-w-xs items-center gap-3 rounded-sm border border-slate-300 bg-white px-3 py-3 text-left"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center border transition-colors ${
                      verified ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                    }`}
                  >
                    <LuCheck className="h-4 w-4 text-white" />
                  </span>
                  <span className="text-xs leading-4 text-slate-700">Tôi không phải là người máy</span>
                  <div className="ml-auto flex w-[72px] flex-col items-center text-center text-[9px] leading-3 text-slate-500">
                    <span className="mb-1 flex h-8 w-8 items-center justify-center">
                      <Image
                        src="/recaptcha-logo.png"
                        alt=""
                        width={32}
                        height={32}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="font-medium text-slate-600">reCAPTCHA</span>
                    <span className="text-[8px] text-slate-400">Bảo mật - Điều khoản</span>
                  </div>
                </button>
                {message && <p className="mt-2 max-w-xs text-sm text-red-500">{message}</p>}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="h-11 rounded-sm bg-amber-500 px-9 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Đang gửi..." : "Gửi ngay"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
