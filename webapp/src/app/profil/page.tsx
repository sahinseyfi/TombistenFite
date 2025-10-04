export default function ProfilPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Profil</h1>
      <p className="text-sm text-base-content/70">Profil bilgilerinizi burada yönetin.</p>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="form-control">
            <label className="label"><span className="label-text">Görünen İsim</span></label>
            <input className="input input-bordered" placeholder="Adınız" />
          </div>
          <div className="form-control mt-3">
            <button className="btn btn-primary btn-sm w-full">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );
}

