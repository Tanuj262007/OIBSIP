"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const themeToggle = document.getElementById("themeToggle");
    const typingText = document.getElementById("typingText");
    const backToTop = document.getElementById("backToTop");
    const contactForm = document.getElementById("contactForm");
    const formFeedback = document.getElementById("formFeedback");

    // Rotating role text in the hero section.
    const roles = [
        "an AI/ML Enthusiast",
        "a Web Developer",
        "a Python Programmer",
        "a Tech Explorer"
    ];
    let roleIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;

    function typeRole() {
        if (!typingText) return;
        const currentRole = roles[roleIndex];
        characterIndex += isDeleting ? -1 : 1;
        typingText.textContent = currentRole.substring(0, characterIndex);

        let delay = isDeleting ? 45 : 90;
        if (!isDeleting && characterIndex === currentRole.length) {
            isDeleting = true;
            delay = 1400;
        } else if (isDeleting && characterIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 350;
        }
        window.setTimeout(typeRole, delay);
    }
    if (typingText) typeRole();

    // Mobile navigation.
    function closeMobileMenu() {
        if (!menuToggle || !navMenu) return;
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );
            menuToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        navLinks.forEach(link => link.addEventListener("click", closeMobileMenu));
        document.addEventListener("click", event => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeMobileMenu();
        });
    }

    // Dark/light theme with a safe localStorage fallback.
    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        if (theme === "dark") {
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            themeToggle.setAttribute("aria-label", "Switch to light theme");
        } else {
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            themeToggle.setAttribute("aria-label", "Switch to dark theme");
        }
    }

    function applyTheme(theme) {
        html.setAttribute("data-theme", theme);
        updateThemeIcon(theme);
    }

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("portfolio-theme");
    } catch (error) {
        // The theme toggle still works when storage is unavailable.
    }
    const initialTheme = savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : "dark";
    applyTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            try {
                localStorage.setItem("portfolio-theme", nextTheme);
            } catch (error) {
                // Ignore storage errors; the current-page theme has changed.
            }
        });
    }

    // Reveal sections as they enter the viewport.
    const revealElements = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        html.classList.add("reveal-enabled");
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
        revealElements.forEach(element => revealObserver.observe(element));
    } else {
        revealElements.forEach(element => element.classList.add("visible"));
    }

    // Header, active navigation and back-to-top behavior.
    function updateHeader() {
        if (header) header.classList.toggle("scrolled", window.scrollY > 30);
    }
    function updateBackToTop() {
        if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 450);
    }
    const sections = document.querySelectorAll("main section[id]");
    function updateActiveNavigation() {
        let currentSection = "home";
        const scrollPosition = window.scrollY + 150;
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop &&
                scrollPosition < section.offsetTop + section.offsetHeight) {
                currentSection = section.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
        });
    }
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
    let scrollScheduled = false;
    function handleScroll() {
        if (scrollScheduled) return;
        scrollScheduled = true;
        window.requestAnimationFrame(() => {
            updateHeader();
            updateBackToTop();
            updateActiveNavigation();
            scrollScheduled = false;
        });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateHeader();
    updateBackToTop();
    updateActiveNavigation();

    // EmailJS contact form.
    const EMAILJS_PUBLIC_KEY = "JCKD7KcLjckYm0XuK";
    const EMAILJS_SERVICE_ID = "service_8tvcak5";
    const EMAILJS_TEMPLATE_ID = "template_o7o18vz";

    if (window.emailjs && typeof window.emailjs.init === "function") {
        window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    function showFormMessage(message, type) {
        if (!formFeedback) return;
        formFeedback.textContent = message;
        formFeedback.className = `form-feedback ${type}`;
    }

    if (contactForm && formFeedback) {
        contactForm.addEventListener("submit", async event => {
            event.preventDefault();
            showFormMessage("", "");

            const name = document.getElementById("contactName")?.value.trim() || "";
            const email = document.getElementById("contactEmail")?.value.trim() || "";
            const subject = document.getElementById("contactSubject")?.value.trim() || "";
            const message = document.getElementById("contactMessage")?.value.trim() || "";

            if (!name || !email || !subject || !message) {
                showFormMessage("Please complete all fields.", "error");
                return;
            }
            if (name.length < 2) {
                showFormMessage("Please enter a valid name.", "error");
                return;
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showFormMessage("Please enter a valid email address.", "error");
                return;
            }
            if (message.length < 10) {
                showFormMessage("Please enter a message with at least 10 characters.", "error");
                return;
            }
            if (!window.emailjs) {
                showFormMessage("Email service did not load. Refresh the page and try again.", "error");
                console.error("EmailJS browser SDK is unavailable. Check the CDN script request.");
                return;
            }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton ? submitButton.innerHTML : "";
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            const templateParams = {
                name,
                email,
                time: new Date().toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                }),
                message: `Subject: ${subject}\n\n${message}`
            };

            try {
                await window.emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    templateParams
                );
                showFormMessage("Your message has been sent successfully!", "success");
                contactForm.reset();
            } catch (error) {
                console.error("EmailJS send failed:", error);
                showFormMessage("Unable to send your message. Please check your EmailJS service/template settings and try again.", "error");
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            }
        });
    }
});
