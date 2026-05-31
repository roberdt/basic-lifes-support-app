import Head from 'next/head'

const steps = [
  {
    icon: '📞',
    title: 'Step 1 — Call for Help',
    body: 'Call 911 (or your local emergency number) immediately. If others are present, point to someone and say "You — call 911 now."',
  },
  {
    icon: '🤲',
    title: 'Step 2 — Check the Scene',
    body: 'Ensure the scene is safe. Tap the person firmly on the shoulder and shout "Are you okay?" to check for responsiveness.',
  },
  {
    icon: '🫁',
    title: 'Step 3 — Open the Airway',
    body: 'Tilt the head back and lift the chin to open the airway. Check for normal breathing for no more than 10 seconds.',
  },
  {
    icon: '💗',
    title: 'Step 4 — Begin Chest Compressions',
    body: 'Push hard and fast in the center of the chest. Aim for 100–120 compressions per minute, compressing at least 2 inches deep.',
  },
  {
    icon: '😮‍💨',
    title: 'Step 5 — Give Rescue Breaths',
    body: 'After 30 compressions, give 2 rescue breaths (if trained). Each breath should make the chest visibly rise. Continue the 30:2 cycle.',
  },
  {
    icon: '⚡',
    title: 'Step 6 — Use an AED',
    body: 'As soon as an AED is available, power it on and follow the voice prompts. Resume CPR immediately after each shock.',
  },
]

const aedSteps = [
  { num: '1', text: 'Power on the AED — open the lid or press the power button.' },
  { num: '2', text: 'Attach the pads — place one pad on the upper right chest, one on the lower left side.' },
  { num: '3', text: 'Clear the person — make sure no one is touching them, then press ANALYZE.' },
  { num: '4', text: 'Deliver the shock — press SHOCK if advised. Resume CPR immediately afterward.' },
]

const chokingSteps = [
  { label: 'Conscious Adult/Child', action: 'Give 5 back blows between the shoulder blades, then 5 abdominal thrusts (Heimlich). Alternate until the object is dislodged or the person loses consciousness.' },
  { label: 'Infant (<1 year)', action: 'Give 5 back blows face-down on your forearm, then 5 chest thrusts. Never perform abdominal thrusts on an infant.' },
  { label: 'Unconscious Person', action: 'Lower the person carefully to the ground and begin CPR. Each time you open the airway, look for and remove any visible object before giving rescue breaths.' },
]

export default function Home() {
  return (
    <div className="page">
      <Head>
        <title>Basic Life Support — Emergency Guide</title>
        <meta name="description" content="Step-by-step Basic Life Support guide covering CPR, AED usage, and choking response." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <span className="logo-icon">🚑</span>
          <span className="logo-text">Basic Life Support</span>
          <a className="emergency-btn" href="tel:911">Call 911</a>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <h1 className="hero-title">Every Second Counts</h1>
          <p className="hero-sub">
            Immediate action saves lives. Follow these evidence-based steps from the American Heart Association.
          </p>
          <div className="hero-badges">
            <span className="badge">🫀 CPR</span>
            <span className="badge">⚡ AED</span>
            <span className="badge">🤧 Choking</span>
          </div>
        </section>

        {/* ── CPR Steps ── */}
        <section className="section" id="cpr">
          <h2 className="section-title">CPR — Step by Step</h2>
          <p className="section-sub">For adults and children over 1 year old.</p>
          <div className="grid">
            {steps.map((s) => (
              <div className="card" key={s.title}>
                <div className="card-icon">{s.icon}</div>
                <h3 className="card-title">{s.title}</h3>
                <p className="card-body">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── AED ── */}
        <section className="section section-dark" id="aed">
          <h2 className="section-title">Using an AED</h2>
          <p className="section-sub">Automated External Defibrillators are simple — the device will guide you.</p>
          <ol className="aed-list">
            {aedSteps.map((s) => (
              <li className="aed-item" key={s.num}>
                <span className="aed-num">{s.num}</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <p className="aed-note">⚠️ AEDs are safe to use on children — use pediatric pads or a pediatric setting if available.</p>
        </section>

        {/* ── Choking ── */}
        <section className="section" id="choking">
          <h2 className="section-title">Choking Response</h2>
          <p className="section-sub">If a person cannot speak, cough forcefully, or breathe — act now.</p>
          <div className="choking-grid">
            {chokingSteps.map((s) => (
              <div className="choking-card" key={s.label}>
                <h3 className="choking-label">{s.label}</h3>
                <p className="choking-action">{s.action}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta">
          <h2 className="cta-title">Prepare Before an Emergency</h2>
          <p className="cta-sub">Consider taking a certified CPR/BLS course from the American Heart Association or Red Cross.</p>
          <div className="cta-links">
            <a className="cta-btn primary" href="https://www.heart.org/en/cpr" target="_blank" rel="noopener noreferrer">AHA CPR Training</a>
            <a className="cta-btn secondary" href="https://www.redcross.org/take-a-class/cpr" target="_blank" rel="noopener noreferrer">Red Cross CPR Class</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>This guide is for informational purposes only and does not replace professional medical training. Always call 911 in an emergency.</p>
      </footer>

      <style jsx>{`
        /* ── Reset & Base ── */
        .page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1a1a2e;
          background: #f8f9fa;
        }

        /* ── Header ── */
        .header {
          background: #d62828;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0.8rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .logo-icon { font-size: 1.5rem; }
        .logo-text {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          flex: 1;
          letter-spacing: 0.02em;
        }
        .emergency-btn {
          background: #fff;
          color: #d62828;
          font-weight: 700;
          padding: 0.45rem 1.1rem;
          border-radius: 50px;
          text-decoration: none;
          font-size: 0.9rem;
          transition: background 0.15s, color 0.15s;
        }
        .emergency-btn:hover { background: #ffe0e0; }

        /* ── Hero ── */
        .hero {
          background: linear-gradient(135deg, #d62828 0%, #a61c1c 100%);
          color: #fff;
          text-align: center;
          padding: 5rem 1.5rem 4rem;
        }
        .hero-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 800;
          margin: 0 0 1rem;
          line-height: 1.1;
        }
        .hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          max-width: 600px;
          margin: 0 auto 2rem;
          opacity: 0.92;
          line-height: 1.6;
        }
        .hero-badges { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .badge {
          background: rgba(255,255,255,0.2);
          border: 1.5px solid rgba(255,255,255,0.5);
          color: #fff;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        /* ── Sections ── */
        .section {
          padding: 4rem 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-dark {
          background: #1a1a2e;
          color: #f0f0f0;
          max-width: 100%;
          padding: 4rem 1.5rem;
        }
        .section-dark .section-title,
        .section-dark .section-sub { color: #f0f0f0; }
        .section-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: #1a1a2e;
        }
        .section-sub {
          color: #555;
          margin: 0 0 2.5rem;
          font-size: 1.05rem;
        }

        /* ── CPR Grid ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.25rem;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          border-left: 4px solid #d62828;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .card-icon { font-size: 1.8rem; margin-bottom: 0.6rem; }
        .card-title { font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem; color: #d62828; }
        .card-body { margin: 0; font-size: 0.95rem; line-height: 1.6; color: #444; }

        /* ── AED ── */
        .aed-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
          max-width: 700px;
        }
        .aed-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-size: 1rem;
          line-height: 1.6;
        }
        .aed-num {
          background: #d62828;
          color: #fff;
          font-weight: 700;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .aed-note {
          background: rgba(214,40,40,0.15);
          border: 1px solid rgba(214,40,40,0.4);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          max-width: 700px;
          line-height: 1.5;
        }

        /* ── Choking ── */
        .choking-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .choking-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          border-top: 4px solid #f77f00;
        }
        .choking-label { font-size: 1rem; font-weight: 700; color: #f77f00; margin: 0 0 0.6rem; }
        .choking-action { margin: 0; font-size: 0.95rem; line-height: 1.6; color: #444; }

        /* ── CTA ── */
        .cta {
          background: #eef2ff;
          text-align: center;
          padding: 4rem 1.5rem;
        }
        .cta-title { font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 700; margin: 0 0 0.75rem; }
        .cta-sub { color: #555; font-size: 1.05rem; max-width: 550px; margin: 0 auto 2rem; line-height: 1.6; }
        .cta-links { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .cta-btn {
          padding: 0.75rem 1.75rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          transition: opacity 0.15s, transform 0.15s;
        }
        .cta-btn:hover { opacity: 0.88; transform: translateY(-2px); }
        .cta-btn.primary { background: #d62828; color: #fff; }
        .cta-btn.secondary { background: #fff; color: #d62828; border: 2px solid #d62828; }

        /* ── Footer ── */
        .footer {
          background: #1a1a2e;
          color: #aaa;
          text-align: center;
          padding: 1.5rem 1.5rem;
          font-size: 0.8rem;
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .grid, .choking-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
