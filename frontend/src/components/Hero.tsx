import React, { useEffect, useRef } from 'react';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';

// Animated GPS tracking map with truck dots
const TrackingMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    const W = canvas.width = 320;
    const H = canvas.height = 320;

    // Routes: array of waypoints for each truck
    const routes = [
      { points: [{x:60,y:80},{x:120,y:100},{x:180,y:70},{x:240,y:110},{x:260,y:160}], color: '#c9a96e', progress: 0, speed: 0.003 },
      { points: [{x:40,y:200},{x:100,y:180},{x:160,y:220},{x:220,y:190},{x:280,y:210}], color: '#e4e4e7', progress: 0.3, speed: 0.002 },
      { points: [{x:160,y:40},{x:150,y:100},{x:170,y:160},{x:140,y:220},{x:160,y:280}], color: '#c9a96e', progress: 0.6, speed: 0.0025 },
      { points: [{x:80,y:260},{x:140,y:240},{x:200,y:260},{x:260,y:240},{x:300,y:270}], color: '#e4e4e7', progress: 0.15, speed: 0.002 },
    ];

    // Hub locations
    const hubs = [
      {x:160,y:160,label:'RUH'},{x:60,y:80,label:'JED'},{x:260,y:90,label:'DMM'},
      {x:100,y:240,label:'MED'},{x:240,y:210,label:'ABH'},
    ];

    function getPointOnPath(points: {x:number,y:number}[], t: number) {
      const total = points.length - 1;
      const seg = Math.floor(t * total);
      const segT = (t * total) - seg;
      const p1 = points[Math.min(seg, total - 1)];
      const p2 = points[Math.min(seg + 1, total)];
      return { x: p1.x + (p2.x - p1.x) * segT, y: p1.y + (p2.y - p1.y) * segT };
    }

    let animId: number;
    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Background grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Draw route paths
      routes.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.points[0].x, r.points[0].y);
        for (let i = 1; i < r.points.length; i++) {
          ctx.lineTo(r.points[i].x, r.points[i].y);
        }
        ctx.strokeStyle = r.color === '#c9a96e' ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw hubs
      hubs.forEach((h, i) => {
        const pulse = Math.sin(frame * 0.04 + i) * 0.4 + 0.6;
        // Outer ring
        ctx.beginPath();
        ctx.arc(h.x, h.y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,169,110,${0.15 * pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Inner dot
        ctx.beginPath();
        ctx.arc(h.x, h.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#c9a96e';
        ctx.fill();
        // Label
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(201,169,110,0.7)';
        ctx.fillText(h.label, h.x + 6, h.y - 5);
      });

      // Draw moving trucks
      routes.forEach(r => {
        r.progress += r.speed;
        if (r.progress > 1) r.progress = 0;
        const pos = getPointOnPath(r.points, r.progress);

        // Glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
        grd.addColorStop(0, r.color === '#c9a96e' ? 'rgba(201,169,110,0.6)' : 'rgba(255,255,255,0.4)');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Truck dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Trail
        const trailT = Math.max(0, r.progress - 0.08);
        const trail = getPointOnPath(r.points, trailT);
        ctx.beginPath();
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = r.color === '#c9a96e' ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Center crosshair
      ctx.strokeStyle = 'rgba(201,169,110,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W/2-12, H/2); ctx.lineTo(W/2+12, H/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W/2, H/2-12); ctx.lineTo(W/2, H/2+12); ctx.stroke();
      ctx.beginPath();
      ctx.arc(W/2, H/2, 6, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(201,169,110,0.5)';
      ctx.stroke();

      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-full opacity-80 w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] lg:w-[320px] lg:h-[320px]"
      style={{ width: 320, height: 320 }}
    />
  );
};

const Hero: React.FC = () => {
  const { t, lang } = useI18n();
  const { content } = useSiteData();

  const videoUrl = content.hero_video_url || 'https://carvo.sico.sa/gps.mp4';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40" poster="">
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950/80 to-zinc-900/95" />
        <div className="absolute inset-0 topo-lines opacity-30" />
        <div className="absolute inset-0 grid-overlay-dark opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 60%)' }} />
      </div>

      {/* HUD top-left */}
      <div className="absolute top-28 left-6 lg:left-10 z-10 hidden md:block">
        <div className="font-mono text-xs text-white/30 tracking-wide uppercase mb-2">◉ SYSTEM STATUS</div>
        <div className="flex flex-col gap-1.5 font-mono text-xs text-white/50">
          <div className="flex items-center gap-2"><span className="live-dot scale-75" />DISPATCH ONLINE</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />47 UNITS ACTIVE</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20" />15 KSA HUBS</div>
        </div>
      </div>



      {/* Main layout: text left, tracking map right */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Left: copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-8 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wide uppercase animate-slide-up">
              <span className="live-dot" />
              {t('KSA Vehicle Logistics · Live', 'لوجستيات المركبات في المملكة · مباشر')}
            </div>

            {/* HOOK */}
            <h1 className={`font-black leading-[1.15] mb-6 animate-slide-up ${lang === 'ar' ? 'font-arabic text-4xl sm:text-5xl md:text-6xl tracking-normal text-right lg:text-right' : 'text-5xl sm:text-6xl md:text-7xl tracking-tight'}`}
                style={{ animationDelay: '120ms' }}>
              {lang === 'ar' ? (
                <>
                  <span className="block text-white">سيارتك. أسطولك.</span>
                  <span className="block text-white">مطالبتك.</span>
                  <span className="block gold-text">كارفو يُدير الكل.</span>
                </>
              ) : (
                <>
                  <span className="font-display block text-white">YOUR VEHICLE.</span>
                  <span className="font-display block text-white">YOUR FLEET.</span>
                  <span className="font-display block gold-text">ONE PLATFORM.</span>
                </>
              )}
            </h1>

            <p className={`text-base md:text-lg text-white/60 font-light leading-relaxed mb-10 animate-slide-up max-w-xl ${lang === 'ar' ? 'font-arabic text-right lg:text-right mr-auto lg:mr-0' : ''}`}
               style={{ animationDelay: '200ms' }}>
              {t(
                'Towing, inspection, storage, maintenance, repair and spare parts. Complete vehicle services for individuals and full claims infrastructure for insurance companies and fleets across Saudi Arabia.',
                'سحب وفحص وتخزين وصيانة وإصلاح وقطع غيار. خدمات شاملة للأفراد ومنظومة متكاملة لإدارة مطالبات التأمين وأساطيل الشركات في المملكة.'
              )}
            </p>

            <div className={`flex flex-col sm:flex-row items-center gap-4 animate-slide-up ${lang === 'ar' ? 'justify-center lg:justify-end' : 'justify-center lg:justify-start'}`}
                 style={{ animationDelay: '300ms' }}>
              <button onClick={() => scrollTo('services')}
                className="w-full sm:w-auto px-8 py-4 brand-gradient rounded-full text-zinc-900 font-black text-sm shadow-2xl shadow-black/40 hover:scale-[1.03] transition-all">
                {t('View Services', 'اكتشف خدماتنا')}
              </button>
              <button onClick={() => scrollTo('contact')}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 bg-white/5 backdrop-blur-md rounded-full text-white font-black text-sm hover:bg-white/10 transition-all">
                {t('Contact Us', 'تواصل معنا')}
              </button>
            </div>

            {/* Stats */}
            <div className={`mt-14 grid grid-cols-2 md:grid-cols-4 gap-5 animate-fade-in ${lang === 'ar' ? 'direction-rtl' : ''}`}
                 style={{ animationDelay: '450ms' }}>
              {[
                { v: '24/7', l: t('Live Dispatch', 'إرسال فوري') },
                { v: '<30m', l: t('Response Time', 'وقت الاستجابة') },
                { v: '15+', l: t('KSA Hubs', 'مركز في المملكة') },
                { v: '99.9%', l: t('Uptime', 'الاستمرارية') },
              ].map((s, i) => (
                <div key={i} className="border-t border-white/10 pt-4">
                  <div className="font-display text-3xl text-white">{s.v}</div>
                  <div className="text-xs text-white/50 font-semibold mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GPS tracking map — visible on all screens */}
          <div className="flex items-center justify-center order-1 lg:order-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="relative">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full border border-amber-400/10 scale-110" />
              <div className="absolute inset-0 rounded-full border border-amber-400/5 scale-125" />
              <div className="absolute inset-0 rounded-full"
                   style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)' }} />

              {/* Radar sweep overlay */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="radar-sweep rounded-full w-full h-full opacity-60" />
              </div>

              {/* Canvas tracking map */}
              <div className="relative rounded-full overflow-hidden border border-white/5 bg-zinc-900/50 backdrop-blur-sm">
                <TrackingMap />
              </div>

              {/* Live badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/90 border border-white/10 rounded-full backdrop-blur-md">
                <span className="live-dot scale-75" />
                <span className="font-mono text-xs text-white/60 tracking-wide uppercase">{t("LIVE TRACKING", "تتبع مباشر")}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30">
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default Hero;
