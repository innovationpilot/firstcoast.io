(function () {
  const accessForm = document.getElementById("magic-link-form");
  const dashboardShell = document.getElementById("dashboard-shell");

  if (!accessForm || !dashboardShell) {
    return;
  }

  const DOM = {
    feedback: document.getElementById("access-feedback"),
    companyName: document.getElementById("company-name"),
    dealOwner: document.getElementById("deal-owner"),
    hubspotDeal: document.getElementById("hubspot-deal"),
    agreementChip: document.getElementById("agreement-chip"),
    paymentChip: document.getElementById("payment-chip"),
    reportChip: document.getElementById("report-chip"),
    scheduleBody: document.getElementById("schedule-body"),
    progressCopy: document.getElementById("progress-copy"),
    progressFill: document.getElementById("progress-fill"),
    progressPercent: document.getElementById("progress-percent"),
    reportCopy: document.getElementById("report-copy"),
    reportDownload: document.getElementById("report-download"),
    paymentCopy: document.getElementById("payment-copy"),
    feeSelect: document.getElementById("engagement-fee"),
    checkoutButton: document.getElementById("stripe-checkout-btn"),
    invoiceButton: document.getElementById("stripe-invoice-btn"),
    markPaidButton: document.getElementById("mark-paid-btn"),
    paymentFeedback: document.getElementById("payment-feedback"),
    timeline: document.getElementById("crm-timeline"),
    emailInput: document.getElementById("portal-email"),
    demoDealInput: document.getElementById("demo-deal"),
  };

  const STORAGE_KEY = "fcai.portal.demo.deals";
  const DEFAULT_CONFIG = {
    stripePublicKey: "",
    endpoints: {
      requestMagicLink: "/api/client-portal/magic-link/request",
      verifyMagicLink: "/api/client-portal/magic-link/verify",
      dealById: "/api/client-portal/deals/{dealId}",
      paymentUpdate: "/api/client-portal/deals/{dealId}/payments",
    },
    stripe: {
      checkout: {
        "2500": "YOUR_STRIPE_CHECKOUT_2500_LINK",
        "1500": "YOUR_STRIPE_CHECKOUT_1500_LINK",
      },
      invoice: {
        "2500": "YOUR_STRIPE_INVOICE_2500_LINK",
        "1500": "YOUR_STRIPE_INVOICE_1500_LINK",
      },
    },
  };

  const runtimeConfig = window.FC_CLIENT_PORTAL_CONFIG || {};
  const CONFIG = {
    stripePublicKey: runtimeConfig.stripePublicKey || DEFAULT_CONFIG.stripePublicKey,
    endpoints: {
      ...DEFAULT_CONFIG.endpoints,
      ...(runtimeConfig.endpoints || {}),
    },
    stripe: {
      checkout: {
        ...DEFAULT_CONFIG.stripe.checkout,
        ...((runtimeConfig.stripe && runtimeConfig.stripe.checkout) || {}),
      },
      invoice: {
        ...DEFAULT_CONFIG.stripe.invoice,
        ...((runtimeConfig.stripe && runtimeConfig.stripe.invoice) || {}),
      },
    },
  };

  const DEFAULT_DEMO_DEALS = {
    "deal-alpha": {
      id: "deal-alpha",
      companyName: "Alpha Manufacturing",
      primaryContactName: "Maria Torres",
      primaryContactEmail: "maria@alphamfg.com",
      agreementStatus: "sent",
      paymentStatus: "awaiting_payment",
      engagementFee: 2500,
      paymentTriggeredAt: "2026-03-22T15:00:00-04:00",
      interviewSchedule: [
        {
          participant: "Maria Torres",
          role: "CEO",
          startsAt: "2026-03-25T10:30:00-04:00",
          status: "scheduled",
        },
        {
          participant: "Ethan Brooks",
          role: "COO",
          startsAt: "2026-03-26T14:00:00-04:00",
          status: "completed",
        },
        {
          participant: "Linda Chen",
          role: "Operations Director",
          startsAt: "2026-03-27T11:00:00-04:00",
          status: "invited",
        },
      ],
      report: {
        status: "in_progress",
        url: "",
        generatedAt: "",
      },
      crmTimeline: [
        {
          label: "Intake call completed",
          at: "2026-03-21T09:00:00-04:00",
        },
        {
          label: "Engagement agreement sent",
          at: "2026-03-22T15:00:00-04:00",
        },
        {
          label: "Interview invites launched",
          at: "2026-03-22T16:30:00-04:00",
        },
      ],
    },
    "deal-lighthouse": {
      id: "deal-lighthouse",
      companyName: "Lighthouse Logistics",
      primaryContactName: "Jeff Kendall",
      primaryContactEmail: "jeff@lighthouselogistics.io",
      agreementStatus: "signed",
      paymentStatus: "paid",
      engagementFee: 1500,
      paymentTriggeredAt: "2026-03-20T13:20:00-04:00",
      interviewSchedule: [
        {
          participant: "Jeff Kendall",
          role: "Founder",
          startsAt: "2026-03-21T10:00:00-04:00",
          status: "completed",
        },
        {
          participant: "Rina Patel",
          role: "Dispatch Lead",
          startsAt: "2026-03-21T11:30:00-04:00",
          status: "completed",
        },
        {
          participant: "Oscar Wright",
          role: "Fleet Ops",
          startsAt: "2026-03-22T09:00:00-04:00",
          status: "transcribed",
        },
      ],
      report: {
        status: "ready",
        url: "https://example.com/firstcoast-lighthouse-report.pdf",
        generatedAt: "2026-03-23T08:10:00-04:00",
      },
      crmTimeline: [
        {
          label: "Intake call completed",
          at: "2026-03-18T14:00:00-04:00",
        },
        {
          label: "Agreement signed",
          at: "2026-03-19T10:30:00-04:00",
        },
        {
          label: "Stripe payment received",
          at: "2026-03-20T13:22:00-04:00",
        },
        {
          label: "Report uploaded to portal",
          at: "2026-03-23T08:12:00-04:00",
        },
      ],
    },
  };

  let activeDeal = null;
  let usingDemoData = false;

  function safeJsonParse(input) {
    try {
      return JSON.parse(input);
    } catch (_) {
      return null;
    }
  }

  function loadDemoDeals() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_DEALS));
    return JSON.parse(JSON.stringify(DEFAULT_DEMO_DEALS));
  }

  function saveDemoDeals(deals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  }

  function setFeedback(node, message, isError) {
    if (!node) {
      return;
    }
    node.textContent = message;
    node.classList.toggle("is-error", Boolean(isError));
  }

  function setHtmlFeedback(node, html, isError) {
    if (!node) {
      return;
    }
    node.innerHTML = html;
    node.classList.toggle("is-error", Boolean(isError));
  }

  function formatDateTime(value) {
    if (!value) {
      return "Pending";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function encodeTokenPayload(payload) {
    return btoa(JSON.stringify(payload));
  }

  function decodeTokenPayload(value) {
    return JSON.parse(atob(value));
  }

  function createDemoToken(email, dealId) {
    const issuedAt = Date.now();
    const payload = {
      email: String(email || "").toLowerCase(),
      dealId,
      issuedAt,
      expiresAt: issuedAt + 1000 * 60 * 60 * 24 * 3,
    };
    return "fcai." + encodeTokenPayload(payload);
  }

  function parseDemoToken(token) {
    if (!token || typeof token !== "string" || !token.startsWith("fcai.")) {
      return null;
    }
    const encoded = token.slice("fcai.".length);
    try {
      const payload = decodeTokenPayload(encoded);
      if (!payload || !payload.expiresAt || payload.expiresAt < Date.now()) {
        return null;
      }
      return payload;
    } catch (_) {
      return null;
    }
  }

  function statusTone(value) {
    const normalized = String(value || "").toLowerCase();
    if (["paid", "ready", "completed", "transcribed", "signed"].includes(normalized)) {
      return "good";
    }
    if (["awaiting_payment", "in_progress", "scheduled", "invited", "sent"].includes(normalized)) {
      return "warn";
    }
    return "muted";
  }

  function prettifyStatus(value) {
    return String(value || "unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function setChip(node, label, value) {
    if (!node) {
      return;
    }
    node.classList.remove("chip-good", "chip-warn", "chip-muted");
    node.classList.add("chip-" + statusTone(value));
    node.textContent = label + ": " + prettifyStatus(value);
  }

  function isDoneStatus(status) {
    const normalized = String(status || "").toLowerCase();
    return normalized === "completed" || normalized === "transcribed";
  }

  function endpointWithDealId(template, dealId) {
    return String(template || "").replace("{dealId}", encodeURIComponent(dealId));
  }

  function isConfiguredUrl(link) {
    return Boolean(link && /^https?:\/\//.test(link) && !String(link).startsWith("YOUR_"));
  }

  async function tryApiJson(path, options) {
    const response = await fetch(path, options);
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return response.json();
  }

  async function requestMagicLink(email, dealId) {
    const payload = {
      email,
      dealId,
      source: "portal",
    };

    try {
      const apiResult = await tryApiJson(CONFIG.endpoints.requestMagicLink, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return {
        sentByApi: true,
        link: String(apiResult.previewLink || apiResult.magicLink || ""),
      };
    } catch (_) {
      const token = createDemoToken(email, dealId);
      const url = new URL(window.location.href);
      url.searchParams.set("token", token);
      url.searchParams.set("deal", dealId);
      return { sentByApi: false, link: url.toString() };
    }
  }

  async function verifyMagicToken(token) {
    try {
      const verified = await tryApiJson(CONFIG.endpoints.verifyMagicLink, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return {
        email: verified.email || "",
        dealId: verified.dealId || "",
        source: "api",
      };
    } catch (_) {
      const payload = parseDemoToken(token);
      if (!payload) {
        return null;
      }
      return {
        email: payload.email || "",
        dealId: payload.dealId || "",
        source: "demo",
      };
    }
  }

  async function fetchDeal(dealId) {
    if (!dealId) {
      return null;
    }

    const apiPath = endpointWithDealId(CONFIG.endpoints.dealById, dealId);
    try {
      const payload = await tryApiJson(apiPath, {
        method: "GET",
      });
      usingDemoData = false;
      return payload;
    } catch (_) {
      const deals = loadDemoDeals();
      usingDemoData = true;
      return deals[dealId] || null;
    }
  }

  function renderSchedule(items) {
    DOM.scheduleBody.innerHTML = "";
    if (!Array.isArray(items) || items.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="4">No interviews scheduled yet.</td>';
      DOM.scheduleBody.appendChild(row);
      return;
    }

    items.forEach((entry) => {
      const row = document.createElement("tr");
      const status = prettifyStatus(entry.status);
      row.innerHTML =
        "<td>" +
        (entry.participant || "--") +
        "</td>" +
        "<td>" +
        (entry.role || "--") +
        "</td>" +
        "<td>" +
        formatDateTime(entry.startsAt) +
        "</td>" +
        '<td><span class="status-chip chip-' +
        statusTone(entry.status) +
        '">' +
        status +
        "</span></td>";
      DOM.scheduleBody.appendChild(row);
    });
  }

  function renderProgress(items) {
    const total = Array.isArray(items) ? items.length : 0;
    const completed = Array.isArray(items) ? items.filter((item) => isDoneStatus(item.status)).length : 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    DOM.progressCopy.textContent = completed + " of " + total + " interviews completed";
    DOM.progressPercent.textContent = percent + "% complete";
    DOM.progressFill.style.width = percent + "%";
  }

  function renderReport(report) {
    const reportStatus = (report && report.status) || "in_progress";
    setChip(DOM.reportChip, "Report", reportStatus);

    if (report && report.url) {
      DOM.reportCopy.textContent = "Generated " + formatDateTime(report.generatedAt) + ".";
      DOM.reportDownload.classList.remove("btn-disabled");
      DOM.reportDownload.setAttribute("aria-disabled", "false");
      DOM.reportDownload.setAttribute("target", "_blank");
      DOM.reportDownload.setAttribute("rel", "noopener noreferrer");
      DOM.reportDownload.href = report.url;
      DOM.reportDownload.textContent = "Download Final Report";
    } else {
      DOM.reportCopy.textContent =
        "Your report will appear here after diagnostic synthesis and quality review are complete.";
      DOM.reportDownload.classList.add("btn-disabled");
      DOM.reportDownload.setAttribute("aria-disabled", "true");
      DOM.reportDownload.removeAttribute("target");
      DOM.reportDownload.removeAttribute("rel");
      DOM.reportDownload.href = "#";
      DOM.reportDownload.textContent = "Report Not Ready";
    }
  }

  function renderTimeline(events) {
    DOM.timeline.innerHTML = "";
    if (!Array.isArray(events) || events.length === 0) {
      const fallback = document.createElement("li");
      fallback.textContent = "No CRM timeline events yet.";
      DOM.timeline.appendChild(fallback);
      return;
    }

    events.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="timeline-date">' +
        formatDateTime(item.at) +
        "</span>" +
        "<span>" +
        (item.label || "Status update") +
        "</span>";
      DOM.timeline.appendChild(li);
    });
  }

  function renderDeal(deal) {
    if (!deal) {
      return;
    }
    activeDeal = deal;
    dashboardShell.classList.remove("is-hidden");

    DOM.companyName.textContent = deal.companyName || "Client Company";
    DOM.dealOwner.textContent =
      "Primary contact: " +
      (deal.primaryContactName || "--") +
      " (" +
      (deal.primaryContactEmail || "--") +
      ")";
    if (DOM.hubspotDeal) {
      const hubspotDealId = deal.hubspotDealId || "Not linked";
      DOM.hubspotDeal.textContent = "HubSpot deal: " + hubspotDealId;
    }

    setChip(DOM.agreementChip, "Agreement", deal.agreementStatus || "pending");
    setChip(DOM.paymentChip, "Payment", deal.paymentStatus || "pending");
    setChip(DOM.reportChip, "Report", (deal.report && deal.report.status) || "in_progress");

    renderSchedule(deal.interviewSchedule);
    renderProgress(deal.interviewSchedule);
    renderReport(deal.report);
    renderTimeline(deal.crmTimeline);

    DOM.feeSelect.value = String(deal.engagementFee || 2500);
    DOM.paymentCopy.textContent =
      "Agreement trigger: " +
      formatDateTime(deal.paymentTriggeredAt) +
      ". Receipts are issued by Stripe and mirrored to this CRM timeline.";
    DOM.markPaidButton.classList.toggle("hidden-control", !usingDemoData);
    if (usingDemoData) {
      DOM.paymentFeedback.textContent =
        "Demo mode active: configure API endpoints + Stripe links for production.";
    } else if (CONFIG.stripePublicKey) {
      DOM.paymentFeedback.textContent =
        "Stripe test mode configured (" +
        CONFIG.stripePublicKey.slice(0, 12) +
        "...). Payment actions sync to CRM timeline.";
    } else {
      DOM.paymentFeedback.textContent = "Stripe actions are connected to API-backed portal data.";
    }
  }

  function getStripeLink(channel, amount) {
    const links = CONFIG.stripe[channel] || {};
    const link = links[String(amount)] || "";
    return isConfiguredUrl(link) ? link : "";
  }

  async function syncPaymentStatus(dealId, amount, method, status) {
    const payload = {
      amount: Number(amount),
      method,
      status,
      updatedAt: new Date().toISOString(),
    };
    const path = endpointWithDealId(CONFIG.endpoints.paymentUpdate, dealId);
    try {
      await tryApiJson(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      if (!usingDemoData) {
        return;
      }
      const deals = loadDemoDeals();
      if (deals[dealId]) {
        deals[dealId].paymentStatus = status;
        deals[dealId].engagementFee = Number(amount);
        deals[dealId].crmTimeline = Array.isArray(deals[dealId].crmTimeline)
          ? deals[dealId].crmTimeline
          : [];
        deals[dealId].crmTimeline.unshift({
          label: "Payment status set to " + prettifyStatus(status) + " via " + method,
          at: new Date().toISOString(),
        });
        saveDemoDeals(deals);
        renderDeal(deals[dealId]);
      }
    }
  }

  async function handlePortalToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      return;
    }

    const verified = await verifyMagicToken(token);
    if (!verified) {
      setFeedback(
        DOM.feedback,
        "This magic link is invalid or expired. Request a new one below.",
        true
      );
      return;
    }

    DOM.emailInput.value = verified.email || "";
    if (verified.dealId) {
      DOM.demoDealInput.value = verified.dealId;
    }

    const fallbackDealId = params.get("deal") || DOM.demoDealInput.value;
    const deal = await fetchDeal(verified.dealId || fallbackDealId);
    if (!deal) {
      setFeedback(
        DOM.feedback,
        "Portal access succeeded but no CRM deal record was found for this link.",
        true
      );
      return;
    }

    renderDeal(deal);
  }

  DOM.checkoutButton.addEventListener("click", async function () {
    if (!activeDeal) {
      return;
    }
    const amount = DOM.feeSelect.value;
    const link = getStripeLink("checkout", amount);
    if (!link) {
      setFeedback(
        DOM.paymentFeedback,
        "Stripe Checkout link is not configured for $" + amount + ".",
        true
      );
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
    await syncPaymentStatus(activeDeal.id, amount, "checkout", "awaiting_payment");
    setFeedback(
      DOM.paymentFeedback,
      "Opened Stripe Checkout in a new tab. Payment status synced to CRM as Awaiting Payment.",
      false
    );
  });

  DOM.invoiceButton.addEventListener("click", async function () {
    if (!activeDeal) {
      return;
    }
    const amount = DOM.feeSelect.value;
    const link = getStripeLink("invoice", amount);
    if (!link) {
      setFeedback(
        DOM.paymentFeedback,
        "Stripe Invoice link is not configured for $" + amount + ".",
        true
      );
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
    await syncPaymentStatus(activeDeal.id, amount, "invoice", "invoice_sent");
    setFeedback(
      DOM.paymentFeedback,
      "Opened Stripe Invoice flow. CRM status updated to Invoice Sent.",
      false
    );
  });

  DOM.markPaidButton.addEventListener("click", async function () {
    if (!activeDeal) {
      return;
    }
    const amount = DOM.feeSelect.value;
    await syncPaymentStatus(activeDeal.id, amount, "manual", "paid");
    setFeedback(
      DOM.paymentFeedback,
      "Demo payment marked as Paid and reflected in the CRM timeline.",
      false
    );
  });

  DOM.reportDownload.addEventListener("click", function (event) {
    if (DOM.reportDownload.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });

  accessForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = DOM.emailInput.value.trim().toLowerCase();
    const dealId = DOM.demoDealInput.value;

    if (!email) {
      setFeedback(DOM.feedback, "Enter an email address to request access.", true);
      return;
    }

    const result = await requestMagicLink(email, dealId);
    if (result.sentByApi) {
      if (result.link) {
        setHtmlFeedback(
          DOM.feedback,
          'Staging magic link generated: <a href="' +
            result.link +
            '">Open Client Portal</a>',
          false
        );
        return;
      }
      setFeedback(
        DOM.feedback,
        "If the email is recognized, a secure magic link is on its way.",
        false
      );
      return;
    }

    setHtmlFeedback(
      DOM.feedback,
      'Demo mode: open your portal link now: <a href="' +
        result.link +
        '">Open Client Portal</a>',
      false
    );
  });

  handlePortalToken().catch(function () {
    setFeedback(
      DOM.feedback,
      "Unable to load portal data right now. Request a new magic link or try again.",
      true
    );
  });
})();
