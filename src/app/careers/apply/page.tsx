"use client";
import { useState } from "react";

const countries = [
  { code: "+977", name: "Nepal" },
  { code: "+1", name: "USA" },
  { code: "+91", name: "India" },
  { code: "+44", name: "UK" },
];

export default function ApplyPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState("+977");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);

    const email = fd.get("email")?.toString().trim();
    const phone = fd.get("phone")?.toString().trim();
    const position = fd.get("position")?.toString().trim();
    const cv = fd.get("cv") as File | null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email"), setStatus("error");
    if (!position) return setError("Select a position"), setStatus("error");
    if (!cv || !["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(cv.type))
      return setError("Upload valid CV"), setStatus("error");
    if (cv.size > 10 * 1024 * 1024) return setError("CV max 10MB"), setStatus("error");
    if (phone && !/^\d{6,15}$/.test(phone)) return setError("Invalid phone"), setStatus("error");

    fd.set("phone", phone ? `${countryCode}${phone}` : "");

    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setStatus("success");
      e.currentTarget.reset();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <section className="container mx-auto py-12 px-6 md:px-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12 space-y-8 max-w-3xl mx-auto border-2">
          <h1 className="text-3xl font-bold">Apply for a Position</h1>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Name" required className="w-full p-3 border rounded-lg" />
              <input type="email" name="email" placeholder="Email" required className="w-full p-3 border rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className=" border rounded-lg">
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                </select>
                <input name="phone" type="tel" placeholder="Phone (optional)" className="w-full p-3 border rounded-lg" />
              </div>
              <select name="position" required className="w-full p-3 border rounded-lg">
                <option value="">Select a position</option>
                <option>Senior Journalist</option>
                <option>Content Editor</option>
                <option>Digital Marketing Specialist</option>
                <option>Social Media Manager</option>
              </select>
            </div>

            <textarea name="coverNote" rows={4} placeholder="Cover Note (optional)" className="w-full p-3 border rounded-lg" />

            <input type="file" name="cv" accept=".pdf,.doc,.docx" required className="block" />

            <button disabled={status === "loading"} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg">
              {status === "loading" ? "Submitting…" : "Submit Application"}
            </button>

            {status === "success" && <p className="text-green-600">Application submitted.</p>}
            {status === "error" && <p className="text-red-600">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
