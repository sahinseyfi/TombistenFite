"use client";

import SignOutButton from "@/components/SignOutButton";
import RequireAuth from "@/components/RequireAuth";

export default function AyarlarPage() {
  return (
    <RequireAuth>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Ayarlar</h1>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Karanlık tema</span>
                <input type="checkbox" className="toggle toggle-primary" disabled />
              </label>
            </div>
            <p className="text-xs text-base-content/60">Tema geçişi sonraki sürümde eklenecek.</p>
            <div className="mt-2"><SignOutButton /></div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
