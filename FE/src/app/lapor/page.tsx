"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import VillageMapPicker, { type SelectedCell } from "./VillageMapPicker";

export default function LaporPage() {
  const router = useRouter();
  const [vegetasi, setVegetasi] = useState(true);
  const [selectedGrid, setSelectedGrid] = useState<SelectedCell | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/lapor/sukses");
  }

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* TopAppBar Mobile */}
      <header
        className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 shadow-sm"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <span
          className="text-xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          MalariaWatch
        </span>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full"
            style={{ color: "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="p-2 rounded-full"
            style={{ color: "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* TopNav Desktop */}
      <header
        className="hidden md:flex fixed top-0 right-0 z-40 w-[calc(100%-256px)] justify-between items-center px-6 h-16 border-b"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-outline-variant)",
        }}
      >
        <span
          className="text-2xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          MalariaWatch Admin
        </span>
        <div
          className="flex items-center gap-4"
          style={{ color: "var(--color-primary)" }}
        >
          <button className="p-2 rounded-full">
            <span className="material-symbols-outlined">warning</span>
          </button>
          <button className="p-2 rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* SideNav Desktop */}
      <nav
        className="hidden md:flex fixed left-0 top-0 h-full flex-col py-8 px-4 w-64 border-r z-50"
        style={{
          backgroundColor: "var(--color-surface-container-low)",
          borderColor: "var(--color-outline-variant)",
        }}
      >
        <div className="mb-8 px-2">
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "var(--color-primary)" }}
          >
            MalariaWatch
          </h1>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Surveillance Unit
          </p>
        </div>
        <div
          className="flex flex-col gap-2 flex-grow text-base"
        >
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-2 rounded-lg transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2 rounded-lg font-bold border-r-4"
            style={{
              color: "var(--color-primary)",
              borderColor: "var(--color-primary)",
              backgroundColor: "var(--color-surface-container-high)",
            }}
          >
            <span className="material-symbols-outlined filled-icon">
              description
            </span>
            Reports
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2 rounded-lg transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined">explore</span>
            Map View
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2 rounded-lg transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined">leaderboard</span>
            Analytics
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2 rounded-lg transition-all mt-auto"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </div>
        <button
          className="mt-6 w-full py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-on-primary)",
          }}
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add New Report
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full md:pl-64 max-w-7xl mx-auto px-4 md:px-12 py-6 pt-20 pb-28 md:pb-8">
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-semibold"
            style={{ color: "var(--color-on-surface)" }}
          >
            New Puddle Report
          </h1>
          <p
            className="text-base mt-2"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Please complete the field observation data accurately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

            {/* Lokasi Genangan — full width */}
            <div
              className="rounded-xl p-4 border shadow-sm col-span-1 md:col-span-2"
              style={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-2"
                style={{
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  map
                </span>
                Puddle Location (Dummy Map)
              </h3>
              
              {/* Interactive 50×50 canvas map */}
              <VillageMapPicker selected={selectedGrid} onSelect={setSelectedGrid} />

              {/* Hidden form inputs carrying the selected grid coords */}
              <input type="hidden" name="grid_x" value={selectedGrid?.x ?? ""} />
              <input type="hidden" name="grid_y" value={selectedGrid?.y ?? ""} />
              <input type="hidden" name="grid_land" value={selectedGrid?.land ?? ""} />
            </div>

            {/* Karakteristik Genangan — full width */}
            <div
              className="rounded-xl p-4 border shadow-sm col-span-1 md:col-span-2"
              style={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-2"
                style={{
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  schedule
                </span>
                Puddle Characteristics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lama genangan */}
                <div>
                  <label
                    className="block text-sm font-medium mb-4"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Puddle duration
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "lt3", label: "<3 days" },
                      { value: "3-7", label: "3-7 days" },
                      { value: "gt7", label: ">7 days" },
                    ].map((opt, i) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-4 cursor-pointer group"
                      >
                        <input
                          className="custom-radio"
                          name="lama_genangan"
                          type="radio"
                          value={opt.value}
                          defaultChecked={i === 1}
                        />
                        <span
                          className="text-base"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Jenis genangan */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="jenis_genangan"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Puddle type
                  </label>
                  <div className="relative">
                    <select
                      id="jenis_genangan"
                      name="jenis_genangan"
                      className="w-full appearance-none border rounded-lg px-4 py-2 text-base outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--color-surface-bright)",
                        borderColor: "var(--color-outline-variant)",
                        color: "var(--color-on-surface)",
                      }}
                    >
                      <option value="alami">Natural (swamp/puddle)</option>
                      <option value="buatan">Artificial (tire, excavation, container)</option>
                    </select>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kondisi Air */}
            <div
              className="rounded-xl p-4 border shadow-sm"
              style={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: "var(--color-on-surface)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  water_drop
                </span>
                Water Condition
              </h3>
              <div className="space-y-2">
                {[
                  { value: "jernih", label: "Clear" },
                  { value: "keruh", label: "Murky" },
                  { value: "tercemar", label: "Polluted" },
                ].map((opt, i) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <input
                      className="custom-radio"
                      name="kondisi_air"
                      type="radio"
                      value={opt.value}
                      defaultChecked={i === 1}
                    />
                    <span
                      className="text-base"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lingkungan Sekitar */}
            <div
              className="rounded-xl p-4 border shadow-sm"
              style={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: "var(--color-on-surface)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  wb_sunny
                </span>
                Surrounding Environment
              </h3>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Sun exposure
                </label>
                <div className="space-y-2">
                  {[
                    { value: "terbuka", label: "Fully open" },
                    { value: "sebagian", label: "Partial" },
                    { value: "ternaungi", label: "Shaded" },
                  ].map((opt, i) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-4 cursor-pointer"
                    >
                      <input
                        className="custom-radio"
                        name="paparan"
                        type="radio"
                        value={opt.value}
                        defaultChecked={i === 1}
                      />
                      <span
                        className="text-base"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div
                className="flex items-center justify-between py-2 border-t mt-2"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <label
                  className="text-sm font-medium cursor-pointer"
                  htmlFor="vegetasi_toggle"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Surrounding vegetation?
                </label>
                <input
                  className="custom-toggle"
                  id="vegetasi_toggle"
                  name="vegetasi"
                  type="checkbox"
                  checked={vegetasi}
                  onChange={(e) => setVegetasi(e.target.checked)}
                />
              </div>
            </div>

            {/* Risiko Eksposur — full width */}
            <div
              className="rounded-xl p-4 border shadow-sm col-span-1 md:col-span-2"
              style={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2"
                style={{
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-error)" }}
                >
                  radar
                </span>
                Exposure Risk
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Jarak pemukiman */}
                <div>
                  <label
                    className="block text-sm font-medium mb-4"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Distance to residential area
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        className="custom-radio"
                        name="jarak"
                        type="radio"
                        value="lt100"
                      />
                      <span className="text-base" style={{ color: "var(--color-on-surface-variant)" }}>
                        &lt;100m{" "}
                        <span
                          className="inline-block ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: "var(--color-error-container)",
                            color: "var(--color-on-error-container)",
                          }}
                        >
                          High
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        className="custom-radio"
                        name="jarak"
                        type="radio"
                        value="100-300"
                      />
                      <span className="text-base" style={{ color: "var(--color-on-surface-variant)" }}>
                        100-300m
                      </span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        className="custom-radio"
                        name="jarak"
                        type="radio"
                        value="gt300"
                        defaultChecked
                      />
                      <span className="text-base" style={{ color: "var(--color-on-surface-variant)" }}>
                        &gt;300m
                      </span>
                    </label>
                  </div>
                </div>
                {/* Aktivitas nyamuk */}
                <div>
                  <label
                    className="block text-sm font-medium mb-4"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Mosquito activity visible?
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "ya", label: "Yes" },
                      { value: "tidak", label: "No" },
                      { value: "tidak_yakin", label: "Not sure" },
                    ].map((opt, i) => (
                      <label key={opt.value} className="flex items-center gap-4 cursor-pointer">
                        <input
                          className="custom-radio"
                          name="aktivitas_nyamuk"
                          type="radio"
                          value={opt.value}
                          defaultChecked={i === 2}
                        />
                        <span className="text-base" style={{ color: "var(--color-on-surface-variant)" }}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload — full width */}
            <div className="col-span-1 md:col-span-2">
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-on-surface)" }}
              >
                Upload Verification Photo (Required)
              </label>
              <div
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[200px] text-center transition-colors"
                style={{
                  borderColor: "var(--color-primary-fixed-dim)",
                  backgroundColor: "var(--color-surface-container-low)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm"
                  style={{
                    backgroundColor: "var(--color-primary-container)",
                    color: "var(--color-on-primary-container)",
                  }}
                >
                  <span className="material-symbols-outlined text-3xl">
                    add_a_photo
                  </span>
                </div>
                <p
                  className="text-base font-medium mb-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  Tap to capture or select photo
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Ensure the puddle is clearly visible along with its surrounding area.
                </p>
                <input accept="image/*" capture="environment" className="hidden" type="file" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 flex justify-end pb-8">
            <button
              type="submit"
              id="submit-laporan"
              className="w-full md:w-auto px-8 py-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              <span className="material-symbols-outlined filled-icon text-lg">send</span>
              Submit Report
            </button>
          </div>
        </form>
      </main>

      {/* Bottom Nav — Mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 shadow-lg rounded-t-xl"
        style={{ backgroundColor: "var(--color-surface-container)" }}
      >
        <Link
          href="/"
          className="flex flex-col items-center justify-center"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined text-lg">home</span>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <button
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full shadow-sm"
          style={{
            backgroundColor: "var(--color-secondary-container)",
            color: "var(--color-on-secondary-container)",
          }}
        >
          <span className="material-symbols-outlined filled-icon text-lg">medical_services</span>
          <span className="text-xs font-bold mt-1">Report</span>
        </button>
        <button
          className="flex flex-col items-center justify-center"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined text-lg">map</span>
          <span className="text-xs mt-1">Map</span>
        </button>
        <button
          className="flex flex-col items-center justify-center"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined text-lg">person</span>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
