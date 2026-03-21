const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open");
  });
}

const currentPath = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll(".site-nav a[href]");

navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && href === currentPath) {
    link.setAttribute("aria-current", "page");
  }
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("revealed"));
}

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const web3Forms = document.querySelectorAll(".web3-form");

const setFormStatus = (node, state, message) => {
  if (!node) {
    return;
  }

  node.classList.remove("is-pending", "is-success", "is-error");

  if (state) {
    node.classList.add(state);
  }

  node.textContent = message || "";
};

web3Forms.forEach((form) => {
  const statusNode = form.querySelector(".form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton) {
      submitButton.disabled = true;
    }

    setFormStatus(statusNode, "is-pending", "Sending...");

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json",
        },
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Unable to send your message right now.");
      }

      form.reset();
      setFormStatus(statusNode, "is-success", "Message sent. We will follow up by email.");
    } catch (error) {
      const message =
        error instanceof Error &&
        (error.message.toLowerCase().includes("failed to fetch") ||
          error.message.toLowerCase().includes("networkerror"))
          ? "Unable to send right now. Please email morgan@firstcoast.io."
          : error instanceof Error
            ? error.message
            : "Unable to send your message right now.";

      setFormStatus(statusNode, "is-error", message);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
});
