(() => {
    const canvas = document.getElementById("heroTechCanvas");
    if (!canvas) return;

    const hero = canvas.closest(".hero-tech");
    const ctx = canvas.getContext("2d", { alpha: true });

    if (!ctx || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = () => window.innerWidth < 760;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;
    let isVisible = true;
    let lastTime = 0;

    let nodes = [];
    let bits = [];
    let signals = [];
    let edges = [];


    const random = (min, max) =>
        Math.random() * (max - min) + min;


    function resize() {
        const rect = hero.getBoundingClientRect();

        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 1.6);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        buildScene();
    }


    function buildScene() {
        const nodeCount = mobile() ? 22 : 42;
        const bitCount = mobile() ? 28 : 58;

        nodes = [];
        bits = [];
        signals = [];
        edges = [];

        /*
         * Nodes are distributed over the whole hero, but with extra
         * weight toward the center/right so the main heading stays readable.
         */
        for (let i = 0; i < nodeCount; i++) {
            const rightWeighted = Math.random() < 0.62;

            nodes.push({
                x: rightWeighted
                    ? random(width * 0.42, width * 1.02)
                    : random(-20, width * 0.52),
                y: random(20, height - 20),
                vx: random(-0.055, 0.055),
                vy: random(-0.045, 0.045),
                radius: random(1.1, 2.8),
                phase: random(0, Math.PI * 2)
            });
        }

        for (let i = 0; i < bitCount; i++) {
            bits.push({
                x: random(0, width),
                y: random(-height, height),
                speed: random(7, 18),
                value: Math.random() > 0.5 ? "1" : "0",
                size: random(8, 13),
                alpha: random(.055, .16),
                drift: random(-2.5, 2.5)
            });
        }

        rebuildEdges();

        const signalCount = mobile() ? 3 : 7;

        for (let i = 0; i < signalCount; i++) {
            spawnSignal(i / signalCount);
        }
    }


    function rebuildEdges() {
        edges = [];

        const maxDistance = mobile() ? 115 : 155;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];

                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.hypot(dx, dy);

                if (distance < maxDistance && Math.random() < .56) {
                    edges.push({
                        a: i,
                        b: j,
                        distance
                    });
                }
            }
        }
    }


    function randomEdge() {
        if (!edges.length) return null;
        return edges[Math.floor(Math.random() * edges.length)];
    }


    function spawnSignal(initialProgress = 0) {
        const edge = randomEdge();
        if (!edge) return;

        signals.push({
            edge,
            progress: initialProgress,
            speed: random(.035, .075),
            size: random(1.5, 2.7),
            cyan: Math.random() > .32
        });
    }


    function resetSignal(signal) {
        signal.edge = randomEdge() || signal.edge;
        signal.progress = 0;
        signal.speed = random(.035, .075);
        signal.size = random(1.5, 2.7);
        signal.cyan = Math.random() > .32;
    }


    function drawBinary(dt) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const bit of bits) {
            bit.y += bit.speed * dt;
            bit.x += bit.drift * dt;

            if (bit.y > height + 20) {
                bit.y = random(-160, -20);
                bit.x = random(0, width);
                bit.value = Math.random() > .5 ? "1" : "0";
                bit.alpha = random(.055, .16);
            }

            if (bit.x < -20) bit.x = width + 20;
            if (bit.x > width + 20) bit.x = -20;

            const fadeLeft = Math.min(
                1,
                Math.max(.15, bit.x / (width * .42))
            );

            ctx.font =
                `${bit.size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

            ctx.fillStyle =
                `rgba(34,211,238,${bit.alpha * fadeLeft})`;

            ctx.fillText(
                bit.value,
                bit.x,
                bit.y
            );
        }

        ctx.restore();
    }


    function updateNodes(dt, time) {
        for (const node of nodes) {
            node.x += node.vx * 60 * dt;
            node.y += node.vy * 60 * dt;

            if (node.x < -25) node.x = width + 25;
            if (node.x > width + 25) node.x = -25;
            if (node.y < -25) node.y = height + 25;
            if (node.y > height + 25) node.y = -25;

            node.pulse =
                .72 +
                Math.sin(
                    time * .0012 + node.phase
                ) * .28;
        }
    }


    function drawGraph(time) {
        const maxDistance = mobile() ? 115 : 155;

        ctx.save();

        for (const edge of edges) {
            const a = nodes[edge.a];
            const b = nodes[edge.b];

            if (!a || !b) continue;

            const distance = Math.hypot(
                a.x - b.x,
                a.y - b.y
            );

            if (distance > maxDistance * 1.3) {
                continue;
            }

            const strength =
                Math.max(
                    0,
                    1 - distance / (maxDistance * 1.3)
                );

            const gradient =
                ctx.createLinearGradient(
                    a.x,
                    a.y,
                    b.x,
                    b.y
                );

            gradient.addColorStop(
                0,
                `rgba(139,92,246,${.05 + strength * .10})`
            );

            gradient.addColorStop(
                1,
                `rgba(34,211,238,${.035 + strength * .12})`
            );

            ctx.strokeStyle = gradient;
            ctx.lineWidth = .7;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }


        for (const node of nodes) {
            const halo =
                7 +
                node.radius * 4 +
                node.pulse * 3;

            const glow =
                ctx.createRadialGradient(
                    node.x,
                    node.y,
                    0,
                    node.x,
                    node.y,
                    halo
                );

            glow.addColorStop(
                0,
                `rgba(34,211,238,${.16 + node.pulse * .10})`
            );

            glow.addColorStop(
                1,
                "rgba(34,211,238,0)"
            );

            ctx.fillStyle = glow;

            ctx.beginPath();
            ctx.arc(
                node.x,
                node.y,
                halo,
                0,
                Math.PI * 2
            );
            ctx.fill();


            ctx.fillStyle =
                Math.sin(
                    time * .0008 + node.phase
                ) > 0
                    ? "rgba(34,211,238,.72)"
                    : "rgba(139,92,246,.72)";

            ctx.beginPath();

            ctx.arc(
                node.x,
                node.y,
                node.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }


    function drawSignals(dt) {
        ctx.save();

        for (const signal of signals) {
            const { edge } = signal;

            const a = nodes[edge.a];
            const b = nodes[edge.b];

            if (!a || !b) continue;

            signal.progress += signal.speed * dt;

            if (signal.progress >= 1) {
                resetSignal(signal);
                continue;
            }

            const x =
                a.x +
                (b.x - a.x) * signal.progress;

            const y =
                a.y +
                (b.y - a.y) * signal.progress;

            const color =
                signal.cyan
                    ? "34,211,238"
                    : "139,92,246";

            const glow =
                ctx.createRadialGradient(
                    x,
                    y,
                    0,
                    x,
                    y,
                    15
                );

            glow.addColorStop(
                0,
                `rgba(${color},.95)`
            );

            glow.addColorStop(
                .25,
                `rgba(${color},.44)`
            );

            glow.addColorStop(
                1,
                `rgba(${color},0)`
            );

            ctx.fillStyle = glow;

            ctx.beginPath();
            ctx.arc(
                x,
                y,
                15,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.fillStyle =
                `rgba(${color},.95)`;

            ctx.beginPath();
            ctx.arc(
                x,
                y,
                signal.size,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }


    function drawSoftGrid() {
        ctx.save();

        ctx.lineWidth = 1;
        ctx.strokeStyle =
            "rgba(255,255,255,.018)";

        const gap =
            mobile() ? 72 : 84;

        for (
            let x = 0;
            x <= width;
            x += gap
        ) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (
            let y = 0;
            y <= height;
            y += gap
        ) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    }


    function render(time = 0) {
        if (!isVisible) {
            rafId =
                requestAnimationFrame(render);

            return;
        }

        const deltaMs =
            Math.min(
                34,
                time - lastTime || 16.7
            );

        const dt =
            deltaMs / 1000;

        lastTime = time;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        drawSoftGrid();

        if (!reducedMotion.matches) {
            drawBinary(dt);
            updateNodes(dt, time);
        } else {
            updateNodes(0, time);
        }

        drawGraph(time);

        if (!reducedMotion.matches) {
            drawSignals(dt);
        }

        rafId =
            requestAnimationFrame(render);
    }


    const heroObserver =
        new IntersectionObserver(
            ([entry]) => {
                isVisible =
                    entry.isIntersecting;
            },
            {
                threshold: .01
            }
        );

    heroObserver.observe(hero);


    let resizeTimeout = null;

    window.addEventListener(
        "resize",
        () => {
            clearTimeout(
                resizeTimeout
            );

            resizeTimeout =
                setTimeout(
                    resize,
                    120
                );
        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "visibilitychange",
        () => {
            isVisible =
                !document.hidden &&
                hero
                    .getBoundingClientRect()
                    .bottom > 0;
        }
    );


    reducedMotion.addEventListener?.(
        "change",
        buildScene
    );


    resize();

    rafId =
        requestAnimationFrame(render);


    window.addEventListener(
        "beforeunload",
        () => {
            if (rafId) {
                cancelAnimationFrame(
                    rafId
                );
            }

            heroObserver.disconnect();
        },
        {
            once: true
        }
    );
})();