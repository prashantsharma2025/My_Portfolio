
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const yearElement = document.getElementById("year");

// Automatically update the copyright year.
yearElement.textContent = new Date().getFullYear();

// Mobile navigation.
menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label",
        isOpen ? "Close navigation" : "Open navigation");
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the mobile navigation after selecting a section.
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.textContent = "☰";
    });
});

/* =====================================
   PORTFOLIO ANIMATION JAVASCRIPT
   ===================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Typing effect
    const typingElement = document.querySelector(".typing-text");

    if (typingElement) {
        const roles = [
            "Computer Engineering Student",
            "Web Developer",
            "AI/ML Enthusiast",
            "Software Developer"
        ];

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reduceMotion) {
            typingElement.textContent = roles[0];
        } else {
            let roleIndex = 0;
            let characterIndex = roles[0].length;
            let deleting = true;

            function typeRole() {
                const currentRole = roles[roleIndex];

                if (deleting) {
                    characterIndex--;
                } else {
                    characterIndex++;
                }

                typingElement.textContent =
                    currentRole.substring(0, characterIndex);

                let delay = deleting ? 45 : 85;

                if (!deleting && characterIndex === currentRole.length) {
                    deleting = true;
                    delay = 1400;
                } else if (deleting && characterIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    delay = 350;
                }

                window.setTimeout(typeRole, delay);
            }

            window.setTimeout(typeRole, 1400);
        }
    }

    // 2. Scroll reveal
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, observerInstance) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observerInstance.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element) => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }
});

/* =====================================
   CONTACT FORM — DJANGO INTEGRATION
   ===================================== */

if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const statusElement = document.getElementById("form-status");
        const submitButton = contactForm.querySelector(
            'button[type="submit"]'
        );

        const formData = new FormData(contactForm);

        const contactData = {
            name: formData.get("name").trim(),
            email: formData.get("email").trim(),
            subject: formData.get("subject").trim(),
            message: formData.get("message").trim()
        };

        // Read Django's CSRF token from the browser cookie.
        function getCookie(name) {
            const cookie = document.cookie
                .split("; ")
                .find(row => row.startsWith(name + "="));

            return cookie
                ? decodeURIComponent(cookie.split("=").slice(1).join("="))
                : null;
        }

        const csrfToken = getCookie("csrftoken");

        if (!csrfToken) {
            statusElement.textContent =
                "Security token missing. Refresh the page and try again.";
            return;
        }

        statusElement.textContent = "Sending your message...";
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            const response = await fetch("/api/contact/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                credentials: "same-origin",
                body: JSON.stringify(contactData)
            });

            
const responseText = await response.text();

console.log("HTTP status:", response.status);
console.log("Response:", responseText);

let result;

try {
    result = JSON.parse(responseText);
} catch {
    throw new Error(
        `Django returned HTML instead of JSON (HTTP ${response.status}). Check the browser console and Django terminal.`
    );
}

if (!response.ok) {
    throw new Error(
        result.message || "Unable to send your message."
    );
}


            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to send your message."
                );
            }

            statusElement.textContent = result.message;
            contactForm.reset();
        } catch (error) {
            statusElement.textContent =
                error.message === "Failed to fetch"
                    ? "Connection error. Please check your connection and try again."
                    : error.message || "Something went wrong. Please try again.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        }
    });
}
