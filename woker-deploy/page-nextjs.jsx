"use client";
import { useState, useEffect, useRef } from "react";

export default function WokerLanding() {
  const [timerText, setTimerText] = useState("23:47:12");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Timer
    let h = 23, m = 47, s = 12;
    const pad = n => String(n).padStart(2, '0');
    const timer = setInterval(() => {
      s--;
      if (s < 0) { s = 59; m--; }
      if (m < 0) { m = 59; h--; }
      if (h < 0) { h = 23; m = 59; s = 59; }
      setTimerText(`${pad(h)}:${pad(m)}:${pad(s)}`);
    }, 1000);

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => observer.observe(el));

    // Counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          if (!target) return;
          let current = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.textContent = Math.floor(current).toLocaleString('cs-CZ') + suffix;
          }, 25);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

    // Particles
    const pc = document.getElementById('particles');
    function createParticle() {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = Math.random() * 5 + 's';
      p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
      pc?.appendChild(p);
      setTimeout(() => p.remove(), 25000);
    }
    for (let i = 0; i < 15; i++) createParticle();
    const particleInterval = setInterval(createParticle, 2000);

    // Navbar scroll
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (window.scrollY > 80) navbar?.classList.add('scrolled');
      else navbar?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll);

    // Mouse glow
    const handleMouse = (e) => {
      const glow = document.querySelector('.glow-orb-1');
      if (glow) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        glow.style.transform = `translate(${x * 50}px, ${y * 30}px)`;
      }
    };
    document.addEventListener('mousemove', handleMouse);

    return () => {
      clearInterval(timer);
      clearInterval(particleInterval);
      observer.disconnect();
      counterObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const faqs = [
    { q: "Nemám čas to studovat", a: "Průvodce je strukturovaný tak, abys našel odpověď do 5 minut. AI asistent ti odpoví ještě rychleji – zeptáš se a máš odpověď do vteřin." },
    { q: "Neumím německy ani anglicky", a: "Mnoho pozic ve Švýcarsku nevyžaduje žádný jazyk (manuální práce, výroba, stavebnictví). V naší databázi najdeš firmy, které aktivně nabírají bez jazykových požadavků. Navíc je vše v 10 jazycích včetně češtiny." },
    { q: "€9.99 je moc, najdu si to sám na internetu", a: "Můžeš. Zabere ti to 50+ hodin googlění, ověřování a překládání. My jsme to udělali za tebe. €9.99 je cena jednoho oběda – a první výplata ve Švýcarsku ti tuhle investici vrátí během první hodiny práce." },
    { q: "Co když to pro mě nebude fungovat?", a: "Máš 3denní zkušební dobu u ročního plánu. Vyzkoušej to bez rizika. Pokud nebudeš spokojený, zrušíš jedním klikem a neplatíš nic." },
    { q: "Čím se lišíte od agentur?", a: "Agentury berou stovky eur a jsou prostředníkem. My ti dáváme přímé kontakty na firmy – žádný prostředník, žádné skryté poplatky. Ty kontaktuješ zaměstnavatele přímo." },
  ];

  const countries = [
    ["🇩🇪", "Německo"], ["🇳🇴", "Norsko"], ["🇸🇪", "Švédsko"], ["🇳🇱", "Holandsko"], ["🇮🇸", "Island"],
    ["🇦🇹", "Rakousko"], ["🇩🇰", "Dánsko"], ["🇱🇺", "Lucembursko"], ["🇧🇪", "Belgie"], ["🇮🇪", "Irsko"],
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
  :root {
    --bg: #0a0a12;
    --bg-card: #111120;
    --bg-card-hover: #16162a;
    --bg-elevated: #1a1a30;
    --green: #39ff6e;
    --green-dim: #2bcc58;
    --green-glow: rgba(57, 255, 110, 0.15);
    --green-glow-strong: rgba(57, 255, 110, 0.3);
    --gold: #ffd700;
    --gold-dim: #cca800;
    --red: #ff3b3b;
    --text: #ffffff;
    --text-dim: rgba(255,255,255,0.55);
    --text-muted: rgba(255,255,255,0.3);
    --border: rgba(255,255,255,0.06);
    --border-light: rgba(255,255,255,0.1);
    --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-signature: 'Dancing Script', cursive;
    --radius: 16px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font);
    color: var(--text);
    background: var(--bg);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ════════════ GLOBAL EFFECTS ════════════ */
  .glow-orb {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }
  .glow-orb-1 {
    top: -200px;
    left: -100px;
    background: radial-gradient(circle, rgba(57,255,110,0.12), transparent 70%);
    animation: orbFloat1 20s ease-in-out infinite;
  }
  .glow-orb-2 {
    bottom: -300px;
    right: -200px;
    background: radial-gradient(circle, rgba(100,60,255,0.1), transparent 70%);
    animation: orbFloat2 25s ease-in-out infinite;
  }
  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(80px, 60px); }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-60px, -80px); }
  }

  /* Grain */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.5;
  }

  /* ════════════ SCROLL ANIMATIONS ════════════ */
  .reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }

  .reveal-scale {
    opacity: 0;
    transform: scale(0.92);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-scale.visible {
    opacity: 1;
    transform: scale(1);
  }

  /* ════════════ URGENCY BAR ════════════ */
  .urgency-bar {
    background: linear-gradient(90deg, var(--green-dim), #1fa84a);
    padding: 10px 20px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 20px rgba(57,255,110,0.2);
  }
  .urgency-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .urgency-text {
    color: #000;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.3px;
  }
  .urgency-timer {
    font-weight: 800;
    font-size: 15px;
    color: #000;
    background: rgba(0,0,0,0.15);
    padding: 4px 14px;
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 1px;
  }

  /* ════════════ HERO ════════════ */
  .hero {
    position: relative;
    padding: 140px 24px 80px;
    text-align: center;
    overflow: hidden;
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 70% at 50% 20%, rgba(57,255,110,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(100,60,255,0.06) 0%, transparent 50%),
      radial-gradient(ellipse 40% 40% at 10% 60%, rgba(255,200,0,0.03) 0%, transparent 50%);
    animation: heroPulse 12s ease-in-out infinite alternate;
  }
  @keyframes heroPulse {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  /* Animated grid lines */
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
    animation: gridDrift 30s linear infinite;
  }
  @keyframes gridDrift {
    0% { background-position: 0 0; }
    100% { background-position: 60px 60px; }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 850px;
  }

  /* Flag animation */
  .hero-flag {
    font-size: 48px;
    display: inline-block;
    animation: flagWave 2s ease-in-out infinite;
    margin-bottom: 20px;
  }
  @keyframes flagWave {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(35px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .anim-1 { animation: fadeUp 0.9s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-2 { animation: fadeUp 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-3 { animation: fadeUp 0.9s 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-4 { animation: fadeUp 0.9s 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-5 { animation: fadeUp 0.9s 0.65s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-6 { animation: fadeUp 0.9s 0.8s cubic-bezier(0.16,1,0.3,1) both; }

  .hero h1 {
    font-family: var(--font);
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 6px;
    letter-spacing: -1px;
  }
  .hero h1 .green {
    color: var(--green);
    text-shadow: 0 0 40px rgba(57,255,110,0.3);
  }

  .hero-sub {
    font-size: clamp(16px, 2.5vw, 20px);
    color: var(--text-dim);
    line-height: 1.7;
    max-width: 600px;
    margin: 24px auto 0;
    font-weight: 400;
  }
  .hero-sub .green-text {
    color: var(--green);
    font-weight: 600;
  }

  /* Social proof row */
  .social-proof-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin: 36px auto 0;
    flex-wrap: wrap;
  }
  .avatar-stack {
    display: flex;
    position: relative;
  }
  .avatar-stack .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--bg);
    margin-left: -10px;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    overflow: hidden;
    position: relative;
  }
  .avatar-stack .avatar:first-child { margin-left: 0; }
  .avatar-stack .avatar.green-border { border-color: var(--green); }

  .stars-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stars {
    color: var(--gold);
    font-size: 18px;
    letter-spacing: 2px;
  }
  .rating-text {
    font-weight: 700;
    font-size: 16px;
  }
  .rating-count {
    color: var(--text-muted);
    font-size: 14px;
  }

  /* CTA */
  .cta-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-top: 40px;
  }

  .cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 20px 52px;
    background: var(--green);
    color: #000;
    font-family: var(--font);
    font-size: 18px;
    font-weight: 800;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    box-shadow:
      0 0 0 0 var(--green-glow),
      0 0 40px rgba(57,255,110,0.2),
      0 8px 32px rgba(0,0,0,0.3);
    letter-spacing: 0.3px;
    position: relative;
    overflow: hidden;
  }
  .cta-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: none;
  }
  .cta-primary:hover::before {
    transform: translateX(100%);
    transition: transform 0.6s ease;
  }
  .cta-primary:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 0 0 10px var(--green-glow),
      0 0 60px rgba(57,255,110,0.3),
      0 16px 48px rgba(0,0,0,0.3);
  }
  .cta-primary .arrow {
    transition: transform 0.3s;
    font-size: 20px;
  }
  .cta-primary:hover .arrow {
    transform: translateX(4px);
  }

  @keyframes ctaPulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--green-glow), 0 0 40px rgba(57,255,110,0.2), 0 8px 32px rgba(0,0,0,0.3); }
    50% { box-shadow: 0 0 0 8px rgba(57,255,110,0.08), 0 0 60px rgba(57,255,110,0.25), 0 8px 32px rgba(0,0,0,0.3); }
  }
  .cta-pulse { animation: ctaPulse 3s ease-in-out infinite; }

  .cta-note {
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
  }

  /* Hero features */
  .hero-features {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 56px;
    flex-wrap: wrap;
  }
  .hero-feat {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s;
  }
  .hero-feat:hover { color: var(--text-dim); }
  .hero-feat .ico {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.3s;
  }
  .hero-feat:hover .ico {
    border-color: var(--green-glow-strong);
    background: var(--green-glow);
  }

  /* ════════════ STATS BAR ════════════ */
  .stats-bar {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 28px 24px;
    background: rgba(255,255,255,0.01);
  }
  .stats-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px;
  }
  .stat {
    text-align: center;
  }
  .stat-num {
    font-size: 32px;
    font-weight: 800;
    color: var(--green);
    text-shadow: 0 0 20px rgba(57,255,110,0.2);
    display: block;
  }
  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 4px;
    font-weight: 600;
  }

  /* Counter animation */
  .count-up {
    display: inline-block;
  }

  /* ════════════ SECTIONS ════════════ */
  .section {
    padding: 100px 24px;
    max-width: 920px;
    margin: 0 auto;
    position: relative;
  }
  .section-wide {
    padding: 100px 24px;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
  }
  .section-label {
    color: var(--green);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--green);
    border-radius: 2px;
  }
  .section-title {
    font-family: var(--font);
    font-size: clamp(28px, 4.5vw, 44px);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 16px;
    letter-spacing: -0.5px;
  }
  .section-desc {
    color: var(--text-dim);
    font-size: 17px;
    line-height: 1.7;
  }

  /* ════════════ PROBLEM ════════════ */
  .problem-section {
    background: linear-gradient(180deg, var(--bg) 0%, rgba(20,10,10,1) 100%);
    position: relative;
  }
  .problem-section::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255,59,59,0.06), transparent 70%);
    pointer-events: none;
  }

  .problem-card {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 22px 26px;
    background: rgba(255,60,60,0.04);
    border: 1px solid rgba(255,60,60,0.1);
    border-radius: 14px;
    margin-bottom: 10px;
    transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
    cursor: default;
  }
  .problem-card:hover {
    transform: translateX(8px);
    border-color: rgba(255,60,60,0.25);
    background: rgba(255,60,60,0.08);
  }
  .problem-emoji {
    font-size: 24px;
    flex-shrink: 0;
  }
  .problem-text {
    font-size: 16px;
    color: rgba(255,180,180,0.9);
    font-weight: 600;
    line-height: 1.5;
  }

  .bridge-text {
    text-align: center;
    margin-top: 48px;
    font-size: 26px;
    font-weight: 800;
  }
  .bridge-text .green { color: var(--green); }

  /* ════════════ VALUE CARDS ════════════ */
  .solution-section {
    background: linear-gradient(180deg, rgba(20,10,10,1), var(--bg) 30%, var(--bg));
    position: relative;
  }

  .value-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 50px;
  }
  .value-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    padding: 34px 28px;
    border: 1px solid var(--border);
    transition: all 0.45s cubic-bezier(0.16,1,0.3,1);
    position: relative;
    overflow: hidden;
  }
  .value-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--green), transparent);
    opacity: 0;
    transition: opacity 0.4s;
  }
  .value-card:hover {
    transform: translateY(-8px);
    border-color: rgba(57,255,110,0.15);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 30px var(--green-glow);
    background: var(--bg-card-hover);
  }
  .value-card:hover::before { opacity: 1; }

  .vc-icon {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 18px;
    background: rgba(57,255,110,0.08);
    border: 1px solid rgba(57,255,110,0.12);
  }
  .vc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 12px;
  }
  .value-card h3 {
    font-size: 20px;
    font-weight: 700;
  }
  .vc-tag {
    font-size: 11px;
    font-weight: 700;
    color: var(--green);
    background: var(--green-glow);
    padding: 4px 10px;
    border-radius: 6px;
    white-space: nowrap;
    letter-spacing: 0.3px;
  }
  .value-card p {
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.7;
  }

  /* ════════════ TESTIMONIALS ════════════ */
  .testimonials-section {
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }
  .testimonials-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 300px;
    background: radial-gradient(ellipse, rgba(57,255,110,0.04), transparent 70%);
    pointer-events: none;
  }

  .testimonial-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-top: 44px;
  }
  .testimonial-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    padding: 30px 26px;
    border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }
  .testimonial-card::before {
    content: '"';
    position: absolute;
    top: 16px;
    right: 22px;
    font-size: 60px;
    font-family: var(--font-display);
    color: rgba(57,255,110,0.08);
    line-height: 1;
  }
  .testimonial-card:hover {
    transform: translateY(-6px);
    border-color: var(--border-light);
    box-shadow: 0 16px 48px rgba(0,0,0,0.25);
  }
  .t-stars {
    color: var(--gold);
    font-size: 16px;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }
  .t-text {
    font-size: 16px;
    font-style: italic;
    line-height: 1.65;
    color: rgba(255,255,255,0.8);
    margin-bottom: 22px;
  }
  .t-author {
    font-weight: 700;
    font-size: 14px;
  }
  .t-role {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* ════════════ PRICING ════════════ */
  .pricing-section {
    background: linear-gradient(180deg, var(--bg), #0d0d1a);
    position: relative;
  }
  .pricing-section::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(57,255,110,0.06), transparent 70%);
    pointer-events: none;
  }

  .pricing-card {
    background: var(--bg-card);
    border: 2px solid rgba(57,255,110,0.2);
    border-radius: 24px;
    padding: 52px 44px;
    max-width: 540px;
    margin: 50px auto 0;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 60px rgba(57,255,110,0.06);
    transition: box-shadow 0.5s;
  }
  .pricing-card:hover {
    box-shadow: 0 0 80px rgba(57,255,110,0.1);
  }
  .pricing-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--green), var(--gold), var(--green));
    background-size: 200% 100%;
    animation: shimmer 4s linear infinite;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .pricing-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--green);
    background: var(--green-glow);
    padding: 7px 20px;
    border-radius: 100px;
    margin-bottom: 28px;
    border: 1px solid rgba(57,255,110,0.15);
  }
  .pricing-old {
    font-size: 15px;
    color: var(--text-muted);
    text-decoration: line-through;
    margin-bottom: 4px;
  }
  .pricing-price {
    font-size: 72px;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    margin-bottom: 2px;
    text-shadow: 0 0 40px rgba(255,255,255,0.05);
  }
  .pricing-period {
    font-size: 16px;
    color: var(--text-dim);
    margin-bottom: 6px;
  }
  .pricing-daily {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 36px;
  }
  .pricing-daily strong {
    color: var(--green);
    font-weight: 700;
  }

  .pricing-features {
    text-align: left;
    margin-bottom: 36px;
  }
  .pf-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    font-size: 15px;
    color: rgba(255,255,255,0.8);
    transition: all 0.3s;
  }
  .pf-item:last-child { border-bottom: none; }
  .pf-item:hover { color: var(--text); transform: translateX(4px); }
  .pf-check {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--green-glow);
    color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;
    border: 1px solid rgba(57,255,110,0.2);
  }

  .cta-pricing {
    display: block;
    width: 100%;
    padding: 20px;
    background: var(--green);
    color: #000;
    font-family: var(--font);
    font-size: 18px;
    font-weight: 800;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 0 30px rgba(57,255,110,0.2), 0 8px 30px rgba(0,0,0,0.3);
    position: relative;
    overflow: hidden;
  }
  .cta-pricing::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: translateX(-100%);
  }
  .cta-pricing:hover::before {
    transform: translateX(100%);
    transition: transform 0.6s ease;
  }
  .cta-pricing:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 50px rgba(57,255,110,0.3), 0 12px 40px rgba(0,0,0,0.3);
  }
  .pricing-secure {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 16px;
  }

  /* ════════════ GUARANTEE ════════════ */
  .guarantee-section {
    background: var(--bg);
  }
  .guarantee-box {
    max-width: 620px;
    margin: 0 auto;
    background: rgba(57,255,110,0.04);
    border: 2px solid rgba(57,255,110,0.15);
    border-radius: 20px;
    padding: 44px 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .guarantee-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(57,255,110,0.06), transparent 60%);
    pointer-events: none;
  }
  .guarantee-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }
  .guarantee-box h3 {
    font-size: 24px;
    font-weight: 800;
    color: var(--green);
    margin-bottom: 14px;
  }
  .guarantee-box p {
    color: rgba(255,255,255,0.6);
    line-height: 1.7;
    font-size: 16px;
  }
  .guarantee-box strong {
    color: var(--text);
  }

  /* Signature */
  .signature {
    font-family: var(--font-signature);
    font-size: 38px;
    color: var(--green);
    margin-top: 24px;
    display: inline-block;
    text-shadow: 0 0 20px rgba(57,255,110,0.2);
    position: relative;
  }
  .signature::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, var(--green), transparent);
    border-radius: 2px;
  }
  .signature-role {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 8px;
    font-weight: 500;
  }

  /* ════════════ FAQ ════════════ */
  .faq-section {
    background: linear-gradient(180deg, var(--bg), #0d0d18);
  }
  .faq-list {
    max-width: 660px;
    margin: 44px auto 0;
  }
  .faq-item {
    background: var(--bg-card);
    border-radius: 14px;
    border: 1px solid var(--border);
    margin-bottom: 8px;
    overflow: hidden;
    transition: all 0.3s;
  }
  .faq-item:hover { border-color: var(--border-light); }
  .faq-item.open { border-color: rgba(57,255,110,0.15); }
  .faq-q {
    padding: 22px 24px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    user-select: none;
    gap: 16px;
    transition: color 0.3s;
  }
  .faq-q:hover { color: var(--green); }
  .faq-toggle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--text-dim);
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .faq-item.open .faq-toggle {
    transform: rotate(45deg);
    background: var(--green-glow);
    color: var(--green);
    border-color: rgba(57,255,110,0.2);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.16,1,0.3,1), padding 0.3s;
    padding: 0 24px;
    color: var(--text-dim);
    line-height: 1.7;
    font-size: 15px;
  }
  .faq-item.open .faq-a {
    max-height: 200px;
    padding: 0 24px 22px;
  }

  /* ════════════ FINAL CTA ════════════ */
  .final-cta {
    background: var(--bg);
    padding: 100px 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .final-cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 100%, rgba(57,255,110,0.08), transparent 60%);
  }
  .final-content {
    position: relative;
    z-index: 2;
    max-width: 700px;
    margin: 0 auto;
  }
  .final-cta h2 {
    font-size: clamp(30px, 5vw, 46px);
    font-weight: 800;
    margin-bottom: 32px;
    line-height: 1.15;
    letter-spacing: -0.5px;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 40px;
  }
  .option-card {
    border-radius: 16px;
    padding: 28px 24px;
    text-align: left;
    transition: all 0.3s;
  }
  .option-card.muted {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
  }
  .option-card.highlight {
    background: var(--green-glow);
    border: 1px solid rgba(57,255,110,0.2);
  }
  .option-card.highlight:hover {
    border-color: rgba(57,255,110,0.35);
    box-shadow: 0 0 30px rgba(57,255,110,0.08);
  }
  .option-label {
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .option-card.muted .option-label { color: var(--text-muted); }
  .option-card.highlight .option-label { color: var(--green); }
  .option-card p {
    font-size: 15px;
    line-height: 1.6;
  }
  .option-card.muted p { color: var(--text-muted); }
  .option-card.highlight p { color: rgba(255,255,255,0.7); }

  .final-features {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 24px;
    flex-wrap: wrap;
  }
  .final-features span {
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
  }

  /* ════════════ FOOTER ════════════ */
  .footer {
    background: #060610;
    border-top: 1px solid var(--border);
    padding: 28px 24px;
    text-align: center;
  }
  .footer p {
    color: rgba(255,255,255,0.15);
    font-size: 13px;
  }
  .footer a {
    color: rgba(255,255,255,0.2);
    text-decoration: none;
    transition: color 0.2s;
  }
  .footer a:hover { color: rgba(255,255,255,0.4); }

  /* ════════════ FLOATING PARTICLES ════════════ */
  .particles {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--green);
    border-radius: 50%;
    opacity: 0;
    animation: particleRise linear infinite;
  }
  @keyframes particleRise {
    0% { opacity: 0; transform: translateY(100vh) scale(0); }
    10% { opacity: 0.4; }
    90% { opacity: 0.1; }
    100% { opacity: 0; transform: translateY(-10vh) scale(1); }
  }


  /* ════════════ FOUNDER SECTION ════════════ */
  .founder-section {
    background: linear-gradient(180deg, var(--bg), #0d0d1a, var(--bg));
    position: relative;
    overflow: hidden;
  }
  .founder-section::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(57,255,110,0.05), transparent 70%);
    pointer-events: none;
  }
  .founder-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    align-items: center;
    max-width: 1000px;
    margin: 0 auto;
  }
  .founder-photo-wrap {
    position: relative;
  }
  .founder-photo {
    width: 100%;
    border-radius: 20px;
    border: 2px solid var(--border-light);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .founder-photo:hover {
    transform: scale(1.02);
    border-color: rgba(57,255,110,0.2);
    box-shadow: 0 24px 70px rgba(0,0,0,0.5), 0 0 30px var(--green-glow);
  }
  .founder-photo-badge {
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--green);
    color: #000;
    font-weight: 800;
    font-size: 12px;
    padding: 8px 20px;
    border-radius: 100px;
    letter-spacing: 1px;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(57,255,110,0.3);
  }
  .founder-text h3 {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 8px;
  }
  .founder-text .role {
    color: var(--green);
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .founder-text p {
    color: var(--text-dim);
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 16px;
  }
  .founder-text .highlight {
    color: var(--green);
    font-weight: 600;
  }
  .founder-stats {
    display: flex;
    gap: 28px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .founder-stat {
    text-align: center;
  }
  .founder-stat .num {
    font-size: 24px;
    font-weight: 800;
    color: var(--green);
    display: block;
  }
  .founder-stat .lbl {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  /* Guarantee photo */
  .guarantee-photo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--green);
    box-shadow: 0 0 20px var(--green-glow);
    margin-bottom: 12px;
  }

  @media (max-width: 768px) {
    .founder-grid { grid-template-columns: 1fr; gap: 30px; text-align: center; }
    .founder-stats { justify-content: center; }
  }


  /* Nav W icon */
  .nav-w {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #e63920;
    color: white;
    font-weight: 800;
    font-size: 16px;
    border-radius: 8px;
    letter-spacing: 0;
  }

  /* ════════════ DUAL PRICING ════════════ */
  .pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    max-width: 760px;
    margin: 50px auto 0;
  }
  .pricing-card {
    max-width: none;
    margin: 0;
  }
  .pricing-card.popular {
    border-color: var(--green);
    box-shadow: 0 0 60px rgba(57,255,110,0.08);
    padding-top: 60px;
    overflow: visible;
    margin-top: 8px;
  }
  .pricing-card.yearly {
    border-color: var(--border-light);
    background: var(--bg-elevated);
  }
  .pricing-card.yearly:hover {
    border-color: rgba(255,255,255,0.15);
    box-shadow: 0 0 40px rgba(255,255,255,0.04);
  }
  .popular-tag {
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--green);
    color: #000;
    font-weight: 800;
    font-size: 12px;
    padding: 6px 20px;
    border-radius: 100px;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow: 0 4px 16px rgba(57,255,110,0.3);
    z-index: 2;
  }
  .save-tag {
    display: inline-block;
    background: var(--green-glow);
    color: var(--green);
    font-weight: 700;
    font-size: 13px;
    padding: 5px 14px;
    border-radius: 8px;
    margin-top: 6px;
    margin-bottom: 10px;
    border: 1px solid rgba(57,255,110,0.15);
  }
  .pricing-card.yearly .pricing-price {
    font-size: 60px;
  }
  .pricing-card.yearly .cta-pricing {
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border-light);
    box-shadow: none;
  }
  .pricing-card.yearly .cta-pricing:hover {
    background: var(--bg-card-hover);
    border-color: rgba(255,255,255,0.2);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  @media (max-width: 768px) {
    .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
  }

  /* ════════════ SOCIAL LINKS ════════════ */
  .social-links {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .social-link {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
    text-decoration: none;
    color: var(--text-dim);
  }
  .social-link:hover {
    background: var(--green-glow);
    border-color: rgba(57,255,110,0.25);
    color: var(--green);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(57,255,110,0.15);
  }
  .social-link svg { width: 18px; height: 18px; fill: currentColor; }

  /* Navbar with logo + socials */
  .navbar {
    position: fixed;
    top: 42px;
    left: 0;
    right: 0;
    z-index: 999;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(10,10,18,0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s;
  }
  .navbar.scrolled {
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .nav-logo {
    font-weight: 800;
    font-size: 22px;
    color: var(--text);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.5px;
  }
  .nav-logo .dot {
    width: 10px;
    height: 10px;
    background: var(--green);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--green-glow-strong);
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .nav-cta {
    padding: 10px 24px;
    background: var(--green);
    color: #000;
    font-weight: 700;
    font-size: 14px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.3s;
  }
  .nav-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(57,255,110,0.3);
  }

  /* Avatar improvements */
  .avatar-stack .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--bg);
    margin-left: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    overflow: hidden;
    position: relative;
  }
  .avatar-stack .avatar:first-child { margin-left: 0; }
  .av-1 { background: linear-gradient(135deg, #667eea, #764ba2); }
  .av-2 { background: linear-gradient(135deg, #f093fb, #f5576c); }
  .av-3 { background: linear-gradient(135deg, #4facfe, #00f2fe); }
  .av-4 { background: linear-gradient(135deg, #43e97b, #38f9d7); }
  .av-5 { background: linear-gradient(135deg, #fa709a, #fee140); }

  /* Footer social */
  .footer-social {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .footer-social .social-link {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    .navbar { top: 40px; padding: 10px 16px; }
    .nav-cta { display: none; }
    .hero { padding-top: 120px; }
  }

  /* ════════════ RESPONSIVE ════════════ */
  @media (max-width: 768px) {
    .hero { padding: 60px 20px 60px; min-height: auto; }
    .value-grid { grid-template-columns: 1fr; }
    .testimonial-grid { grid-template-columns: 1fr; }
    .options-grid { grid-template-columns: 1fr; }
    .section, .section-wide { padding: 70px 20px; }
    .cta-primary { padding: 18px 36px; font-size: 16px; width: 100%; justify-content: center; }
    .pricing-card { padding: 40px 24px; }
    .stats-inner { gap: 16px; }
    .hero-features { gap: 16px; }
    .social-proof-row { gap: 10px; }
    .guarantee-box { padding: 32px 24px; }
  }
`}} />

      <div className="particles" id="particles"></div>
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      {/* URGENCY BAR */}
      <div className="urgency-bar">
        <div className="urgency-inner">
          <span className="urgency-text">🔥 LIMITOVANÁ NABÍDKA – Speciální cena pro nové členy</span>
          <span className="urgency-timer">{timerText}</span>
        </div>
      </div>

      {/* NAVBAR */}
      <div className="navbar" id="navbar">
        <a href="#" className="nav-logo"><span className="nav-w">W</span> Woker</a>
        <div className="nav-right">
          <div className="social-links">
            <a href="https://www.tiktok.com/@vasicenko" target="_blank" rel="noopener noreferrer" className="social-link" title="TikTok">
              <svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>
            </a>
            <a href="https://www.instagram.com/vasicenko" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
          </div>
          <a href="#pricing" className="nav-cta">Získat přístup →</a>
        </div>
      </div>

      {/* Content is rendered from the full HTML - see landing-page.html */}
      {/* For full deployment, use landing-page.html directly or convert remaining sections */}
    </>
  );
}
