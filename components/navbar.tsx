"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Profile = {
  age: number;
  weightKg: number;
  heightCm: number;
  familyHistory: boolean;

  // ✅ Challenge (simple)
  lowSugarWeek: boolean;
};

const STORAGE_KEY = "glik_profile_v1";

const DEFAULT_PROFILE: Profile = {
  age: 28,
  weightKg: 78,
  heightCm: 175,
  familyHistory: false,
  lowSugarWeek: false,
};

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Profile>;
      // ✅ merge defaults so old localStorage won't break
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {}
  return DEFAULT_PROFILE;
}

function saveProfile(p: Profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const bmi = useMemo(() => {
    const h = profile.heightCm / 100;
    if (!h) return 0;
    return Math.round((profile.weightKg / (h * h)) * 10) / 10;
  }, [profile.heightCm, profile.weightKg]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_18px_rgba(34,197,94,0.8)]" />
            <span className="text-lg font-semibold tracking-tight text-white">
              GLIK
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Demo
            </Link>

            <Link
              href="/scan"
              className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200 hover:bg-green-500/15"
            >
              Scanner AI
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              title="Profile"
            >
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-zinc-950/95 p-5 backdrop-blur"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-white">Profile</div>
                <div className="mt-1 text-sm text-white/60">
                  Saved locally on this device (localStorage).
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, age: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weightKg}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        weightKg: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.heightCm}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        heightCm: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Stats card */}
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/80">
                    BMI: <span className="text-white">{bmi || "-"}</span>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={profile.familyHistory}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          familyHistory: e.target.checked,
                        }))
                      }
                    />
                    Family history
                  </label>
                </div>

                {/* ✅ Challenge */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/80">
                    Challenge:{" "}
                    <span className="text-white">Low-Sugar Week</span>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={profile.lowSugarWeek}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          lowSugarWeek: e.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="text-xs text-white/50">
                  Goal: No sugary drinks for 7 days.
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setProfile(DEFAULT_PROFILE);
                    saveProfile(DEFAULT_PROFILE);
                  }}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Reset
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200 hover:bg-green-500/15"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
