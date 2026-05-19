function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function SampleRequestBar() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(200,164,74,0.12), rgba(200,164,74,0.05))',
      borderTop: '1px solid rgba(200,164,74,0.25)',
      borderBottom: '1px solid rgba(200,164,74,0.25)',
      padding: '14px 5%',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ color: 'var(--muted)', fontSize: 14 }}>
        ✦ Try before you commit —
      </span>
      <button
        onClick={() => scrollTo('contact')}
        style={{
          background: 'none', border: '1px solid rgba(200,164,74,0.5)',
          color: 'var(--gold)', fontSize: 14, fontWeight: 600,
          padding: '7px 20px', borderRadius: 50, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s',
        }}
        className="sample-btn"
      >
        Request a Sample Bottle →
      </button>
    </div>
  );
}
