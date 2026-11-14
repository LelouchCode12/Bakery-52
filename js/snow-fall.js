/**
 * Autumn-enhanced <snow-fall> Web Component (compatible with @zachleat/snow-fall API).
 * Supports `text`, `count`, and `mode` ("page" | "element") attributes.
 */
(function () {
    const LEAF_PALETTES = [
        { top: "#ebb155", bottom: "#c47123", vein: "rgba(110, 52, 12, 0.38)" }, // Warm Caramel Amber
        { top: "#dc6e3d", bottom: "#a13e1f", vein: "rgba(92, 26, 10, 0.36)" },  // Maple Terracotta
        { top: "#c96534", bottom: "#8a3818", vein: "rgba(74, 24, 8, 0.38)" },   // Roasted Cinnamon
        { top: "#e6a73e", bottom: "#b26918", vein: "rgba(104, 54, 8, 0.35)" },  // Harvest Ochre
        { top: "#cb4d30", bottom: "#882817", vein: "rgba(72, 16, 8, 0.38)" }    // Deep Russet
    ];

    const LEAF_SHAPES = [
        // Maple leaf
        {
            viewBox: "0 0 32 32",
            path: "M16 2.5 L18.3 8.8 L24 6.6 L21.7 12.6 L28.5 13.8 L23.5 18.2 L25.6 21.8 L19.6 21.4 L17.3 24.4 L16.7 29.8 L15.3 29.8 L14.7 24.4 L12.4 21.4 L6.4 21.8 L8.5 18.2 L3.5 13.8 L10.3 12.6 L8 6.6 L13.7 8.8 Z",
            veins: "M16 4.5 V24.5 M16 14 L23 8.5 M16 14 L9 8.5 M16 18 L24.5 15 M16 18 L7.5 15"
        },
        // Oak leaf
        {
            viewBox: "0 0 32 32",
            path: "M16 2.5 C19 4.5 21 6.5 20.5 9.2 C23.5 9 25.5 11.2 24 14 C26.5 15.2 26.2 18.4 23.2 19.4 C24.2 21.8 22 24.4 18.8 23.8 C17.8 25.6 16.9 26.2 16.7 29.8 L15.3 29.8 C15.1 26.2 14.2 25.6 13.2 23.8 C10 24.4 7.8 21.8 8.8 19.4 C5.8 18.4 5.5 15.2 8 14 C6.5 11.2 8.5 9 11.5 9.2 C11 6.5 13 4.5 16 2.5 Z",
            veins: "M16 4.5 V24.5 M16 11 L21.5 11.5 M16 11 L10.5 11.5 M16 16 L22 17 M16 16 L10 17 M16 20.5 L20 21.5 M16 20.5 L12 21.5"
        },
        // Birch / Elm leaf
        {
            viewBox: "0 0 32 32",
            path: "M16 2.5 C22 7.5 25.5 13.5 24 20 C22.8 24.2 19.5 26.2 16.8 26.4 L16.7 30 L15.3 30 L15.2 26.4 C12.5 26.2 9.2 24.2 8 20 C6.5 13.5 10 7.5 16 2.5 Z",
            veins: "M16 4.5 V26.2 M16 10.5 L21.2 13.5 M16 10.5 L10.8 13.5 M16 16 L22.2 19.2 M16 16 L9.8 19.2 M16 21 L20.2 23.2 M16 21 L11.8 23.2"
        },
        // Ginkgo-inspired fan leaf
        {
            viewBox: "0 0 32 32",
            path: "M16 29.5 L15.2 21.8 C9.5 19.5 4.8 14.2 4.5 8.5 C7.8 5.2 12.2 4.5 14.8 6.8 L16 11.5 L17.2 6.8 C19.8 4.5 24.2 5.2 27.5 8.5 C27.2 14.2 22.5 19.5 16.8 21.8 L16 29.5 Z",
            veins: "M16 21.5 L10.5 10 M16 21.5 L13.2 8.5 M16 21.5 L18.8 8.5 M16 21.5 L21.5 10"
        }
    ];

    const SHEET_CSS = `
        :host {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 950;
            overflow: hidden;
            pointer-events: none;
            user-select: none;
            opacity: 1;
            transition: opacity 0.45s ease;
        }
        :host([mode="element"]) {
            position: absolute;
        }
        :host(.is-leaving) {
            opacity: 0;
        }
        .snow-layer {
            position: absolute;
            inset: 0;
            perspective: 600px;
            animation: host-enter 0.8s ease-out forwards;
        }
        @keyframes host-enter {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .snowflake {
            position: absolute;
            top: -64px;
            left: var(--x, 50%);
            will-change: transform, opacity;
            animation: leaf-fall var(--fall-duration, 13s) linear var(--fall-delay, 0s) infinite;
        }
        .leaf-sway {
            display: block;
            width: var(--size, 28.8px);
            height: var(--size, 28.8px);
            transform-origin: center center;
            will-change: transform;
            animation: leaf-sway var(--sway-duration, 4.5s) ease-in-out var(--sway-delay, 0s) infinite alternate;
        }
        .leaf-sway svg {
            display: block;
            width: 100%;
            height: 100%;
            overflow: visible;
        }
        .snowflake--back .leaf-sway {
            filter: blur(0.6px);
        }
        .snowflake--mid .leaf-sway {
            filter: drop-shadow(0 3px 5px rgba(78, 53, 36, 0.14));
        }
        .snowflake--front .leaf-sway {
            filter: drop-shadow(0 5px 10px rgba(78, 53, 36, 0.2));
        }
        .leaf-text {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: var(--size, 26.4px);
            line-height: 1;
        }
        @keyframes leaf-fall {
            0% {
                transform: translate3d(0, -64px, 0);
                opacity: 0;
            }
            10% {
                opacity: var(--leaf-opacity, 0.85);
            }
            86% {
                opacity: var(--leaf-opacity, 0.85);
            }
            100% {
                transform: translate3d(var(--wind-drift, 60px), calc(100vh + 110px), 0);
                opacity: 0;
            }
        }
        @keyframes leaf-sway {
            0% {
                transform: translate3d(calc(var(--sway-amp, 28px) * -1), 0, 0)
                    rotateZ(var(--rot-start, -22deg))
                    rotateX(var(--tilt-start, 10deg))
                    rotateY(0deg);
            }
            50% {
                transform: translate3d(0, 7px, 0)
                    rotateZ(var(--rot-mid, 8deg))
                    rotateX(var(--tilt-mid, -16deg))
                    rotateY(var(--flip-mid, 38deg));
            }
            100% {
                transform: translate3d(var(--sway-amp, 28px), 0, 0)
                    rotateZ(var(--rot-end, 28deg))
                    rotateX(var(--tilt-end, 18deg))
                    rotateY(var(--flip-end, -24deg));
            }
        }
        @media (prefers-reduced-motion: reduce) {
            :host {
                display: none !important;
            }
        }
    `;

    let gradCounter = 0;

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function randInt(min, max) {
        return Math.floor(rand(min, max + 1));
    }

    function isAutumnText(text) {
        if (!text) return true;
        const normalized = text.trim();
        return normalized === "🍂" || normalized === "🍁" || normalized === "🍃" || normalized === "leaves";
    }

    function buildLeafSvg(shape, palette) {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", shape.viewBox);
        svg.setAttribute("aria-hidden", "true");

        const gradId = `leafGrad_${++gradCounter}`;
        const defs = document.createElementNS(ns, "defs");
        const grad = document.createElementNS(ns, "linearGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("x1", "15%");
        grad.setAttribute("y1", "0%");
        grad.setAttribute("x2", "85%");
        grad.setAttribute("y2", "100%");

        const stop1 = document.createElementNS(ns, "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", palette.top);

        const stop2 = document.createElementNS(ns, "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", palette.bottom);

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.appendChild(defs);

        const body = document.createElementNS(ns, "path");
        body.setAttribute("d", shape.path);
        body.setAttribute("fill", `url(#${gradId})`);
        svg.appendChild(body);

        const veins = document.createElementNS(ns, "path");
        veins.setAttribute("d", shape.veins);
        veins.setAttribute("fill", "none");
        veins.setAttribute("stroke", palette.vein);
        veins.setAttribute("stroke-width", "1.1");
        veins.setAttribute("stroke-linecap", "round");
        svg.appendChild(veins);

        return svg;
    }

    class SnowFall extends HTMLElement {
        static get observedAttributes() {
            return ["count", "mode", "text"];
        }

        constructor() {
            super();
            this._renderQueued = false;
            const root = this.shadowRoot || this.attachShadow({ mode: "open" });

            if ("adoptedStyleSheets" in root && typeof CSSStyleSheet !== "undefined") {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(SHEET_CSS);
                root.adoptedStyleSheets = [sheet];
            } else {
                const style = document.createElement("style");
                style.textContent = SHEET_CSS;
                root.appendChild(style);
            }
        }

        connectedCallback() {
            this.queueRender();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue && this.isConnected) {
                this.queueRender();
            }
        }

        queueRender() {
            if (this._renderQueued) return;
            this._renderQueued = true;
            Promise.resolve().then(() => {
                this._renderQueued = false;
                if (this.isConnected) {
                    this.renderLeaves();
                }
            });
        }

        renderLeaves() {
            const root = this.shadowRoot;
            const existingLayer = root.querySelector(".snow-layer");
            if (existingLayer) existingLayer.remove();

            const rawCount = parseInt(this.getAttribute("count") || "28", 10);
            const isCompact = window.innerWidth <= 640;
            const count = Number.isFinite(rawCount) && rawCount > 0
                ? (isCompact ? Math.min(rawCount, 16) : rawCount)
                : (isCompact ? 16 : 28);

            const customText = this.getAttribute("text");
            const useSvgLeaves = isAutumnText(customText);

            const layer = document.createElement("div");
            layer.className = "snow-layer";

            const frag = document.createDocumentFragment();
            const bucketWidth = 100 / count;

            for (let i = 0; i < count; i++) {
                const roll = Math.random();
                let tier = "mid";
                let size, opacity, fallDuration;

                if (roll < 0.35) {
                    tier = "back";
                    size = rand(18, 24);
                    opacity = rand(0.45, 0.65);
                    fallDuration = rand(15.5, 21.5);
                } else if (roll < 0.8) {
                    tier = "mid";
                    size = rand(25.2, 33.6);
                    opacity = rand(0.72, 0.88);
                    fallDuration = rand(11, 15.8);
                } else {
                    tier = "front";
                    size = rand(34.8, 43.2);
                    opacity = rand(0.86, 0.96);
                    fallDuration = rand(8.8, 12.8);
                }

                const flake = document.createElement("div");
                flake.className = `snowflake snowflake--${tier}`;

                // Stratified horizontal placement prevents awkward clustering
                const xPos = Math.min(97, Math.max(1, i * bucketWidth + rand(0, bucketWidth)));
                const fallDelay = -rand(0, fallDuration);
                const swayDuration = rand(3.2, 6.4);
                const swayDelay = -rand(0, swayDuration);
                const swayAmp = rand(18, 42);
                const windDrift = rand(-45, 85);

                flake.style.setProperty("--x", `${xPos.toFixed(2)}%`);
                flake.style.setProperty("--size", `${size.toFixed(1)}px`);
                flake.style.setProperty("--leaf-opacity", opacity.toFixed(2));
                flake.style.setProperty("--fall-duration", `${fallDuration.toFixed(2)}s`);
                flake.style.setProperty("--fall-delay", `${fallDelay.toFixed(2)}s`);
                flake.style.setProperty("--sway-duration", `${swayDuration.toFixed(2)}s`);
                flake.style.setProperty("--sway-delay", `${swayDelay.toFixed(2)}s`);
                flake.style.setProperty("--sway-amp", `${swayAmp.toFixed(1)}px`);
                flake.style.setProperty("--wind-drift", `${windDrift.toFixed(1)}px`);
                flake.style.setProperty("--rot-start", `${randInt(-42, -10)}deg`);
                flake.style.setProperty("--rot-mid", `${randInt(-12, 18)}deg`);
                flake.style.setProperty("--rot-end", `${randInt(14, 48)}deg`);
                flake.style.setProperty("--tilt-start", `${randInt(-18, 18)}deg`);
                flake.style.setProperty("--tilt-mid", `${randInt(-26, 26)}deg`);
                flake.style.setProperty("--tilt-end", `${randInt(-20, 20)}deg`);
                flake.style.setProperty("--flip-mid", `${randInt(20, 55)}deg`);
                flake.style.setProperty("--flip-end", `${randInt(-45, -15)}deg`);

                const sway = document.createElement("span");
                sway.className = "leaf-sway";

                if (useSvgLeaves) {
                    const shape = LEAF_SHAPES[randInt(0, LEAF_SHAPES.length - 1)];
                    const palette = LEAF_PALETTES[randInt(0, LEAF_PALETTES.length - 1)];
                    sway.appendChild(buildLeafSvg(shape, palette));
                } else {
                    const span = document.createElement("span");
                    span.className = "leaf-text";
                    span.textContent = customText;
                    sway.appendChild(span);
                }

                flake.appendChild(sway);
                frag.appendChild(flake);
            }

            layer.appendChild(frag);
            root.appendChild(layer);
        }
    }

    if (!customElements.get("snow-fall")) {
        customElements.define("snow-fall", SnowFall);
    }
})();
