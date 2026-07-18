(() => {
    "use strict";

    const startTime = performance.now();

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const preloader = $("#preloader");
    window.addEventListener("load", () => {
        const loadTime = performance.now() - startTime;
        const minDisplayTime = 5000; // 5 seconds
        const remainingTime = Math.max(0, minDisplayTime - loadTime);
        const hidePreloader = () => preloader?.classList.add("hidden");

        if (window.requestIdleCallback) {
            window.requestIdleCallback(hidePreloader, { timeout: remainingTime });
        } else {
            window.setTimeout(hidePreloader, remainingTime);
        }
    });

    const themeToggle = $("#theme-toggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    const setTheme = (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        themeToggle?.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    };

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? "dark" : "light");
    }

    themeToggle?.addEventListener("click", () => {
        setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    const navbar = $("#navbar");
    const menuButton = $("#menu-icon");
    const navList = $("#nav-list");
    const navLinks = $$("#nav-list a");
    const sections = $$("main section[id]");
    const navLinkMap = new Map(navLinks.map(link => [link.getAttribute("href"), link]));

    const setMenuState = (open) => {
        navList?.classList.toggle("active", open);
        menuButton?.classList.toggle("active", open);
        menuButton?.setAttribute("aria-expanded", String(open));
        menuButton?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        document.body.classList.toggle("menu-open", open);
    };

    menuButton?.addEventListener("click", () => setMenuState(!navList?.classList.contains("active")));
    navLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenuState(false);
    });

    document.addEventListener("click", (event) => {
        if (!navList?.classList.contains("active")) return;
        if (!navbar?.contains(event.target)) setMenuState(false);
    });

    if ("ResizeObserver" in window) {
        new ResizeObserver(() => {
            if (window.innerWidth > 1020) setMenuState(false);
        }).observe(document.body);
    }

    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    };

    const updateNavigation = () => {
        navbar?.classList.toggle("scrolled", window.scrollY > 45);

        let activeId = "home";
        const offset = window.innerHeight * 0.34;
        sections.forEach((section) => {
            if (window.scrollY >= section.offsetTop - offset) activeId = section.id;
        });

        navLinkMap.forEach((link, href) => {
            link.classList.toggle("active", href === `#${activeId}`);
        });
    };

    const throttledUpdateNavigation = throttle(updateNavigation, 100);
    updateNavigation();
    window.addEventListener("scroll", throttledUpdateNavigation, { passive: true });

    const revealElements = $$(".reveal");
    // Group elements for staggered reveals
    const revealGroups = new Map();
    revealElements.forEach(el => {
        const parent = el.parentElement;
        if (!revealGroups.has(parent)) revealGroups.set(parent, []);
        revealGroups.get(parent).push(el);
    });

    revealGroups.forEach(group => {
        group.forEach((element, i) => {
            const baseDelay = Number(element.dataset.delay || 0);
            element.style.setProperty("--reveal-delay", `${baseDelay + i * 85}ms`);
        });
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    const counters = $$('[data-count]');
    const animateCounter = (element) => {
        const target = Number(element.dataset.count || 0);
        const duration = 1250;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = String(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: .8 });
        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
    }

    const portraitStage = $("#portrait-stage");
    if (portraitStage && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
        portraitStage.addEventListener("mousemove", (event) => {
            const rect = portraitStage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - .5;
            const y = (event.clientY - rect.top) / rect.height - .5;
            portraitStage.style.transform = `perspective(1000px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
        });
        portraitStage.addEventListener("mouseleave", () => {
            portraitStage.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
        });
    }

    if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
        $$(".tilt-card").forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - .5;
                const y = (event.clientY - rect.top) / rect.height - .5;
                card.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
            });
            card.addEventListener("mouseleave", () => { card.style.transform = ""; });
        });
    }

    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");

    if (dot && ring && window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
        let mouseX = innerWidth / 2;
        let mouseY = innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener("mousemove", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        }, { passive: true });

        const animateCursor = () => {
            ringX += (mouseX - ringX) * .16;
            ringY += (mouseY - ringY) * .16;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        $$('a, button, input, textarea, .tilt-card').forEach((element) => {
            element.addEventListener("mouseenter", () => ring.classList.add("hovering"));
            element.addEventListener("mouseleave", () => ring.classList.remove("hovering"));
        });
    }

    if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
        $$(".magnetic").forEach((element) => {
            element.addEventListener("mousemove", (event) => {
                const rect = element.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                element.style.transform = `translate(${x * .08}px, ${y * .08}px)`;
            });
            element.addEventListener("mouseleave", () => { element.style.transform = ""; });
        });
    }

    const form = $("#contact-form");

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formStatus = $(".form-status", form);
        const data = new FormData(form);
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                if (formStatus) formStatus.textContent = "Thank you! Your message has been sent.";
                form.reset();
            } else {
                if (formStatus) formStatus.textContent = "Oops! There was a problem submitting your form.";
            }
        } catch (error) {
            if (formStatus) formStatus.textContent = "Oops! There was a network error.";
        } finally {
            if (formStatus) setTimeout(() => { formStatus.textContent = ""; }, 5000);
        }
    });

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    const canvas = $("#scene-canvas");
    if (canvas && !prefersReducedMotion) {
        const context = canvas.getContext("2d", { alpha: true });
        let width = 0;
        let height = 0;
        let particles = [];
        let pointerX = 0;
        let pointerY = 0;
        let resizeTimeout;
        let scrollY = window.scrollY;
        let currentTheme = document.documentElement.getAttribute("data-theme");

        const resizeCanvas = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            const amount = Math.min(72, Math.floor((width * height) / 24000));
            particles = Array.from({ length: amount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + .25,
                speed: Math.random() * .16 + .035,
                alpha: Math.random() * .45 + .1
            }));
        };

        window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

        window.addEventListener("pointermove", (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
        }, { passive: true });

        const draw = () => {
            context.clearRect(0, 0, width, height);

            const isMobile = width < 768;

            const pointerInfluenceX = isMobile ? 0 : (pointerX / width - .5) * 25;
            const pointerInfluenceY = isMobile ? 0 : (pointerY / height - .5) * 25;
            
            const isLightMode = currentTheme === "light";
            const particleColor = isLightMode ? "102, 112, 133" : "180, 217, 255"; // Muted gray for light, blue for dark

            particles.forEach((p) => {
                if (isLightMode) {
                    // Fall down in light mode
                    p.y += p.speed;
                    if (p.y > height + 4) {
                        p.y = -4;
                        p.x = Math.random() * width;
                    }
                } else {
                    // Float up in dark mode
                    p.y -= p.speed;
                    if (p.y < -4) {
                        p.y = height + 4;
                        p.x = Math.random() * width;
                    }
                }

                const parallaxOffsetX = pointerInfluenceX * (p.radius * 0.5);
                const parallaxOffsetY = (pointerInfluenceY + (isMobile ? 0 : scrollY * 0.05)) * (p.radius * 0.5);

                context.beginPath();
                context.arc(p.x + parallaxOffsetX, p.y + parallaxOffsetY, p.radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
                context.fill();
            });

            requestAnimationFrame(draw);
        };
        
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 150);
        };

        // Observe theme changes to update animation
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") currentTheme = document.documentElement.getAttribute("data-theme");
                const isLight = document.documentElement.getAttribute("data-theme") === "light";
                document.documentElement.style.setProperty("--vignette-opacity", isLight ? "0.3" : "1");
            });
        }).observe(document.documentElement, { attributes: true });

        resizeCanvas();
        draw();
        window.addEventListener("resize", debouncedResize);
    }
})();
