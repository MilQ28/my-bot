// src/lib/lanyardPhysics.ts

interface Particle {
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    pinned: boolean;
    damp: number;
}

interface Anchor {
    x: number;
    y: number;
}

interface PhysicsConfig {
    segments: number;
    segLen: number;
    gravity: number;
    damping: number;
    iters: number;
    anchorY: number;
    strapW: number;
    comDist: number;
    comDamping: number;
    maxVel: number;
    maxSpeedGuard: number;
    releaseDamp: number;
    itersDrag: number;
}

export function initLanyard(root: HTMLElement): () => void {
    const simulation = (root.matches(".lanyard-simulation")
        ? root
        : root.querySelector(".lanyard-simulation")) as HTMLElement;
    const card = root.querySelector(".lanyard-memberCard") as HTMLElement;
    const strap = root.querySelector(".lanyard-strap") as HTMLElement;
    const hanger = root.querySelector(".lanyard-hanger") as HTMLElement;

    if (!simulation || !card || !strap || !hanger) {
        return () => { };
    }

    const CFG: PhysicsConfig = {
        segments: 6,
        segLen: 8,
        gravity: 0.4,
        damping: 0.978,
        iters: 12,
        anchorY: 0.065,
        strapW: 16,
        comDist: 72,
        comDamping: 0.975,
        maxVel: 24,
        maxSpeedGuard: 11,
        releaseDamp: 1,
        itersDrag: 28,
    };

    let W = 0;
    let H = 0;
    let cachedCardW = 0;
    let isMobile = window.innerWidth <= 640;
    let pts: Particle[] = [];
    let com: Particle | null = null;
    const anchor: Anchor = { x: 0, y: 0 };

    let lastSimW = 0;
    let lastSimH = 0;
    let lastAnchorX = 0;
    let lastAnchorY = 0;

    function createParticle(x: number, y: number, pinned = false, damp = CFG.damping): Particle {
        return { x, y, oldX: x, oldY: y, pinned, damp };
    }

    function resize(): void {
        const currentIsMobile = window.innerWidth <= 640;
        if (currentIsMobile !== isMobile) {
            isMobile = currentIsMobile;
            pts = [];
            lastSimW = 0;
            lastSimH = 0;
            lastAnchorX = 0;
            lastAnchorY = 0;
        }

        const cardRect = card.getBoundingClientRect();
        const cWidth = cardRect.width || (isMobile ? 160 : 232);
        const cHeight = cardRect.height || (isMobile ? 180 : 240);

        CFG.segLen = isMobile ? 14 : 16;
        CFG.comDist = isMobile ? 50 : 72;
        CFG.strapW = isMobile ? 10 : 16;
        CFG.gravity = isMobile ? 0.3 : 0.4;

        const simPaddingTop = isMobile ? 50 : 70;
        const simPaddingSides = isMobile ? 30 : 40;
        const simBottomExtra = isMobile ? 40 : 78;

        const simW = Math.max(cWidth + simPaddingSides, isMobile ? 180 : 120);
        const simH = Math.max(cHeight + simPaddingTop + simBottomExtra, isMobile ? 260 : 100);

        const roundedSimW = Math.round(simW);
        const roundedSimH = Math.round(simH);

        if (Math.abs(roundedSimW - lastSimW) < 2 && Math.abs(roundedSimH - lastSimH) < 2) {
            const newAnchorX = Math.round(W * 0.5);
            const newAnchorY = isMobile ? 8 : Math.round(H * CFG.anchorY);

            if (Math.abs(newAnchorX - lastAnchorX) > 1 || Math.abs(newAnchorY - lastAnchorY) > 1) {
                lastAnchorX = newAnchorX;
                lastAnchorY = newAnchorY;
                anchor.x = newAnchorX;
                anchor.y = newAnchorY;
                if (pts.length > 0) {
                    pts[0].x = anchor.x;
                    pts[0].y = anchor.y;
                }
            }
            return;
        }

        lastSimW = roundedSimW;
        lastSimH = roundedSimH;

        simulation.style.width = roundedSimW + "px";
        simulation.style.height = roundedSimH + "px";

        const rect = simulation.getBoundingClientRect();
        W = rect.width || roundedSimW;
        H = rect.height || roundedSimH;

        if (isMobile) {
            anchor.x = Math.round(W * 0.5);
            anchor.y = 8;
        } else {
            const clip = simulation.querySelector(".card-clip-slot");
            if (clip && clip.getBoundingClientRect().width > 0) {
                const clipR = clip.getBoundingClientRect();
                const simR = simulation.getBoundingClientRect();
                anchor.x = Math.round((clipR.left + clipR.right) / 2 - simR.left);
                anchor.y = Math.round(Math.max(8, clipR.top - simR.top - 18));
            } else {
                anchor.x = Math.round(W * 0.5);
                anchor.y = Math.round(H * CFG.anchorY);
            }
        }

        lastAnchorX = anchor.x;
        lastAnchorY = anchor.y;

        if (pts.length === 0) {
            resetSystem();
        } else {
            pts[0].x = anchor.x;
            pts[0].y = anchor.y;
            pts[0].oldX = anchor.x;
            pts[0].oldY = anchor.y;
        }
        cachedCardW = cWidth;
    }

    function resetSystem(): void {
        pts = [];
        for (let i = 0; i < CFG.segments; i++) {
            const y = anchor.y + i * CFG.segLen;
            const p = createParticle(anchor.x, y, i === 0);
            if (i > 0) p.oldY = y - 3;
            pts.push(p);
        }
        const attach = pts[pts.length - 1];
        com = createParticle(attach.x, attach.y + CFG.comDist, false, CFG.comDamping);
        com.oldY = com.y - 3;

        for (let k = 0; k < 50; k++) {
            for (let j = 0; j < pts.length - 1; j++) distConstraint(pts[j], pts[j + 1], CFG.segLen, null);
            if (com) distConstraint(pts[pts.length - 1], com, CFG.comDist, null);
            pts[0].x = anchor.x;
            pts[0].y = anchor.y;
        }

        render();
    }

    function integrate(p: Particle, extraAX: number, extraAY: number, dragPt: Particle | null): void {
        if (p.pinned || p === dragPt) return;
        let vx = (p.x - p.oldX) * p.damp;
        let vy = (p.y - p.oldY) * p.damp;
        const spd = Math.hypot(vx, vy);
        if (spd > CFG.maxVel) {
            const s = CFG.maxVel / spd;
            vx *= s;
            vy *= s;
        }
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx + (extraAX || 0);
        p.y += vy + CFG.gravity + (extraAY || 0);
        const m = 4;
        if (p.x < m) {
            p.x = m;
            p.oldX = p.x - vx * 0.2;
        }
        if (p.x > W - m) {
            p.x = W - m;
            p.oldX = p.x - vx * 0.2;
        }
        if (p.y < m) {
            p.y = m;
            p.oldY = p.y - vy * 0.2;
        }
        if (p.y > H - 6) {
            p.y = H - 6;
            p.oldY = p.y - vy * 0.2;
        }
    }

    function distConstraint(a: Particle, b: Particle, restLen: number, dragPt: Particle | null): void {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.0001) return;
        const diff = dist - restLen;
        const aFree = !a.pinned && a !== dragPt;
        const bFree = !b.pinned && b !== dragPt;
        if (aFree && bFree) {
            const corr = (diff / dist) * 0.5;
            a.x += dx * corr;
            a.y += dy * corr;
            b.x -= dx * corr;
            b.y -= dy * corr;
        } else if (aFree) {
            const corr = diff / dist;
            a.x += dx * corr;
            a.y += dy * corr;
        } else if (bFree) {
            const corr = diff / dist;
            b.x -= dx * corr;
            b.y -= dy * corr;
        }
    }

    function step(scrollImpulse: number, dragging: boolean, dragPt: Particle | null): number {
        const nudge = dragging ? 0 : scrollImpulse;
        for (let i = 0; i < pts.length; i++) integrate(pts[i], 0, nudge * (i / pts.length) * 0.16, dragPt);
        if (com) integrate(com, 0, nudge * 0.22, dragPt);
        pts[0].x = anchor.x;
        pts[0].y = anchor.y;
        for (let k = 0; k < (dragging ? CFG.itersDrag : CFG.iters); k++) {
            for (let j = 0; j < pts.length - 1; j++) distConstraint(pts[j], pts[j + 1], CFG.segLen, dragPt);
            if (com) distConstraint(pts[pts.length - 1], com, CFG.comDist, dragPt);
            pts[0].x = anchor.x;
            pts[0].y = anchor.y;
        }
        return scrollImpulse * 0.88;
    }

    function updateStrap(): void {
        if (!strap || pts.length < 2) return;
        const a = pts[0];
        const b = pts[pts.length - 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
        const strapW = Math.max(10, Math.min(30, CFG.strapW));
        strap.style.width = strapW + "px";
        strap.style.height = Math.max(10, len) + "px";
        strap.style.left = a.x - strapW / 2 + "px";
        strap.style.top = a.y + "px";
        strap.style.transform = `rotate(${angleDeg}deg)`;
        if (!strap.querySelector(".stitch")) {
            const s = document.createElement("div");
            s.className = "stitch";
            strap.appendChild(s);
        }
        const baseLen = CFG.segLen * (CFG.segments - 1);
        const taut = Math.max(0, len - baseLen);
        const tension = Math.min(1, taut * 0.01);
        strap.style.opacity = (0.95 - tension * 0.45).toString();
    }

    function positionCard(): void {
        const attach = pts[pts.length - 1];
        const currentCardW = card.offsetWidth;
        if (currentCardW !== cachedCardW) cachedCardW = currentCardW;

        const dx = com ? com.x - attach.x : 0;
        const dy = com ? com.y - attach.y : 0;
        const angle = Math.atan2(dx, dy);
        const deg = (angle * 180) / Math.PI;
        const yaw = Math.max(-24, Math.min(24, deg * 0.38));
        const x = attach.x - cachedCardW / 2;
        const y = attach.y - 14;
        card.style.transform = `translate(${x}px,${y}px) rotateZ(${deg}deg) rotateY(${yaw}deg)`;

        if (hanger && pts.length >= 2) {
            try {
                const hx = pts[0].x;
                const hy = pts[0].y;
                const vdx = pts[1].x - pts[0].x;
                const vdy = pts[1].y - pts[0].y;
                const hangAngle = (Math.atan2(vdy, vdx) * 180) / Math.PI - 90;
                hanger.style.transform = `translate(${hx - 13}px, ${hy - 13}px) rotate(${hangAngle}deg)`;
            } catch {
                // ignore
            }
        }
    }

    function render(): void {
        updateStrap();
        positionCard();
    }

    let dragging = false;
    let dragPt: Particle | null = null;
    let dragIsCard = false;
    const dragOffset = { x: 0, y: 0 };
    const ptr = { x: 0, y: 0 };
    let scrollImpulse = 0;
    let lastScrollY = window.scrollY;
    let rafId: number;

    function handleScroll(): void {
        const cy = window.scrollY;
        const delta = cy - lastScrollY;
        lastScrollY = cy;
        const multiplier = window.innerWidth <= 640 ? 0.02 : 0.045;
        scrollImpulse += Math.max(-1.2, Math.min(1.2, delta * multiplier));
        scrollImpulse = Math.max(-5, Math.min(5, scrollImpulse));
    }

    function updatePtr(e: PointerEvent): void {
        const r = simulation.getBoundingClientRect();
        ptr.x = e.clientX - r.left;
        ptr.y = e.clientY - r.top;
    }

    function startDrag(e: PointerEvent, p: Particle, isCard: boolean): void {
        dragging = true;
        dragPt = p;
        dragIsCard = isCard;
        try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
            // ignore
        }
        if (isCard) {
            const cr = card.getBoundingClientRect();
            const sr = simulation.getBoundingClientRect();
            dragOffset.x = ptr.x - (cr.left - sr.left + cr.width / 2);
            dragOffset.y = ptr.y - (cr.top - sr.top + 14);
        } else {
            dragOffset.x = 0;
            dragOffset.y = 0;
        }
        dragPt.oldX = dragPt.x;
        dragPt.oldY = dragPt.y;
    }

    function onPointerDown(e: PointerEvent): void {
        e.preventDefault();
        e.stopPropagation();
        updatePtr(e);
        if (pts.length > 0) {
            startDrag(e, pts[pts.length - 1], true);
        }
    }

    function onPointerMove(e: PointerEvent): void {
        updatePtr(e);
        if (!dragging || !dragPt) return;
        e.preventDefault();
        let targetX = ptr.x - dragOffset.x;
        let targetY = ptr.y - dragOffset.y;
        if (dragIsCard) {
            const dx = targetX - anchor.x;
            const dy = targetY - anchor.y;
            const dist = Math.hypot(dx, dy);
            const maxReach = Math.max(CFG.segLen * (CFG.segments - 1) + CFG.comDist, 20);
            if (dist > maxReach) {
                const s = maxReach / dist;
                targetX = anchor.x + dx * s;
                targetY = anchor.y + dy * s;
            }
            dragPt.oldX = dragPt.x;
            dragPt.oldY = dragPt.y;
            dragPt.x = targetX;
            dragPt.y = targetY;
        } else {
            let vx = targetX - dragPt.x;
            let vy = targetY - dragPt.y;
            const spd = Math.hypot(vx, vy);
            if (spd > CFG.maxSpeedGuard) {
                const s = CFG.maxSpeedGuard / spd;
                vx *= s;
                vy *= s;
            }
            dragPt.oldX = dragPt.x;
            dragPt.oldY = dragPt.y;
            dragPt.x += vx;
            dragPt.y += vy;
        }
    }

    function releaseDrag(): void {
        if (dragPt) {
            dragPt.oldX = dragPt.x - (dragPt.x - dragPt.oldX) * CFG.releaseDamp;
            dragPt.oldY = dragPt.y - (dragPt.y - dragPt.oldY) * CFG.releaseDamp;
        }
        dragging = false;
        dragPt = null;
        dragIsCard = false;
        dragOffset.x = 0;
        dragOffset.y = 0;
    }

    function animate(): void {
        scrollImpulse = step(scrollImpulse, dragging, dragPt);
        render();
        rafId = requestAnimationFrame(animate);
    }

    function onThemeChange(): void {
        // Force re-render saat theme berubah (untuk update warna stitch)
        render();
    }

    // Setup
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    card.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", releaseDrag);
    window.addEventListener("pointercancel", releaseDrag);
    window.addEventListener("themechange", onThemeChange);
    rafId = requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", handleScroll);
        card.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", releaseDrag);
        window.removeEventListener("pointercancel", releaseDrag);
        window.removeEventListener("themechange", onThemeChange);
    };
}
