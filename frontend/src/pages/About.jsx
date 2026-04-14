function About() {
  return (
    <section className="space-y-6">
      <div className="surface-panel">
        <p className="chip mb-4">Since 2005</p>
        <h1 className="page-title">About Malwa Hardware</h1>
        <p className="page-subtitle">
          Malwa Hardware is a trusted local hardware supplier focused on genuine products, fast delivery, and support
          for contractors, retailers, and homeowners. It owns Oil paints, Alamira fittings , Locks , and etc.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface-soft">
          <h3 className="font-heading text-xl text-slate-900">Wide Selection</h3>
          <p className="mt-2 text-sm text-slate-600">Wide collection of Oil paints , Locks , Almeira fittings , Hardware items etc.</p>
        </article>
        <article className="surface-soft">
          <h3 className="font-heading text-xl text-slate-900">Fast Support</h3>
          <p className="mt-2 text-sm text-slate-600">Direct owner support through live chat and quick call response.</p>
        </article>
        <article className="surface-soft">
          <h3 className="font-heading text-xl text-slate-900">Reliable Supply</h3>
          <p className="mt-2 text-sm text-slate-600">Steady stock for contractors, retailers, and home repair customers.</p>
        </article>
      </div>
    </section>
  );
}

export default About;
