
/* NexaFlow AI — interactive front-end demo */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  // ==========================================
  // 1. MOBILE NAVIGATION
  // ==========================================

  const menuButton = $(".menu-toggle");
  const navigation = $(".primary-nav");

  const closeMenu = () => {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  };

  menuButton?.addEventListener("click", () => {
    if (!navigation) return;

    const open =
      menuButton.getAttribute("aria-expanded") !== "true";

    menuButton.setAttribute("aria-expanded", String(open));

    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    navigation.classList.toggle("is-open", open);
  });

  $$(".primary-nav a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // ==========================================
  // 2. SCROLL REVEAL ANIMATIONS
  // ==========================================

  const revealItems = $$(".reveal");

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item =>
      item.classList.add("is-visible")
    );
  }

  // ==========================================
  // 3. ACTIVE NAVIGATION SECTION
  // ==========================================

  const sectionLinks = $$(".primary-nav a[href^='#']");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          sectionLinks.forEach(link => {
            const active =
              link.getAttribute("href") ===
              `#${entry.target.id}`;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    $$("main section[id]").forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // ==========================================
  // 4. DASHBOARD COUNTER ANIMATION
  // ==========================================

  const counters = $$("[data-count]");
  const dashboard = $(".dashboard-window");

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = Number(counter.dataset.count);

      if (!Number.isFinite(target)) return;

      const duration = 1100;
      const start = performance.now();

      const update = now => {
        const progress = Math.min(
          (now - start) / duration,
          1
        );

        const eased = 1 - Math.pow(1 - progress, 3);

        counter.textContent = Math.round(
          target * eased
        ).toLocaleString("en-IN");

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    });
  };

  if (dashboard && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          animateCounters();
          counterObserver.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    counterObserver.observe(dashboard);
  } else if (dashboard) {
    animateCounters();
  }

  // ==========================================
  // 5. TESTIMONIAL SLIDER
  // Sample content — not real endorsements.
  // ==========================================

  const stories = [
    {
      quote:
        "The best tools don't add more noise. They quietly give you back the time and attention to do your best work.",
      name: "Alex Morgan",
      role: "Product Lead · Sample story",
      initials: "AM"
    },
    {
      quote:
        "A clear workflow changes the whole day. You spend less energy tracking tasks and more energy moving ideas forward.",
      name: "Jamie Patel",
      role: "Creative Founder · Sample story",
      initials: "JP"
    },
    {
      quote:
        "Good technology should feel like a helpful teammate: present when you need it, and out of the way when you don't.",
      name: "Morgan Lee",
      role: "Operations Manager · Sample story",
      initials: "ML"
    }
  ];

  let storyIndex = 0;

  const renderStory = () => {
    const story = stories[storyIndex];

    const quote = $("#quote-text");
    const name = $("#quote-name");
    const role = $("#quote-role");
    const avatar = $("#quote-avatar");
    const slideCount = $("#slide-count");

    if (!quote) return;

    quote.textContent = story.quote;

    if (name) name.textContent = story.name;
    if (role) role.textContent = story.role;
    if (avatar) avatar.textContent = story.initials;

    if (slideCount) {
      slideCount.textContent =
        `${String(storyIndex + 1).padStart(2, "0")} / 03`;
    }
  };

  $("#prev-story")?.addEventListener("click", () => {
    storyIndex =
      (storyIndex + stories.length - 1) % stories.length;

    renderStory();
  });

  $("#next-story")?.addEventListener("click", () => {
    storyIndex = (storyIndex + 1) % stories.length;
    renderStory();
  });

  // ==========================================
  // 6. MONTHLY / YEARLY PRICING TOGGLE
  // ==========================================

  const billingSwitch = $("#billing-switch");

  billingSwitch?.addEventListener("click", () => {
    const yearly =
      billingSwitch.getAttribute("aria-checked") !== "true";

    billingSwitch.setAttribute(
      "aria-checked",
      String(yearly)
    );

    $("#monthly-label")?.classList.toggle(
      "billing-active",
      !yearly
    );

    $("#yearly-label")?.classList.toggle(
      "billing-active",
      yearly
    );

    $$("[data-month][data-year]").forEach(price => {
      const amount = Number(
        yearly ? price.dataset.year : price.dataset.month
      );

      price.textContent =
        amount === 0
          ? "₹0"
          : `₹${amount.toLocaleString("en-IN")}`;
    });
  });

  // ==========================================
  // 7. FAQ ACCORDION
  // ==========================================

  $$(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const willOpen =
        button.getAttribute("aria-expanded") !== "true";

      $$(".faq-question").forEach(other => {
        other.setAttribute("aria-expanded", "false");

        const answer = other.nextElementSibling;

        if (answer) answer.hidden = true;
      });

      button.setAttribute(
        "aria-expanded",
        String(willOpen)
      );

      const answer = button.nextElementSibling;

      if (answer) answer.hidden = !willOpen;
    });
  });

  // ==========================================
  // 8. PRICING CTA → CONTACT FORM
  // ==========================================

  $$("[data-plan]").forEach(link => {
    link.addEventListener("click", () => {
      const interest = $("#interest");

      if (interest) interest.value = "Pricing";

      const message = $("#message");

      if (message && !message.value) {
        message.value =
          `I'm interested in the ${link.dataset.plan} plan. Please share more details.`;
      }
    });
  });

  // ==========================================
  // 9. EMAILJS CONTACT FORM
  // Public identifiers are placeholders.
  // Never put private keys or passwords here.
  // ==========================================

  const EMAILJS_CONFIG = {
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    templateId: "YOUR_EMAILJS_TEMPLATE_ID"
  };

  const contactForm = $("#contact-form");

  const submitButton = contactForm?.querySelector(
    'button[type="submit"]'
  );

  const formStatus = $("#form-status");

  const emailJsConfigured = Object.values(
    EMAILJS_CONFIG
  ).every(value =>
    typeof value === "string" &&
    value.trim() !== "" &&
    !value.startsWith("YOUR_")
  );

  let emailJsReady = false;

  if (
    contactForm &&
    formStatus &&
    window.emailjs &&
    emailJsConfigured
  ) {
    try {
      window.emailjs.init({
        publicKey: EMAILJS_CONFIG.publicKey,
        limitRate: {
          id: "nexaflow-contact-form",
          throttle: 10000
        }
      });

      emailJsReady = true;
    } catch (error) {
      console.error("EmailJS initialization failed:", error);
    }
  }

  contactForm?.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      if (!formStatus) return;

      const nameField = $("#name");
      const emailField = $("#email");
      const messageField = $("#message");
      const interestField = $("#interest");

      const fields = [
        nameField,
        emailField,
        messageField
      ].filter(Boolean);

      fields.forEach(field => {
        field.setAttribute(
          "aria-invalid",
          String(!field.checkValidity())
        );
      });

      const invalid = fields.find(
        field => !field.checkValidity()
      );

      if (invalid) {
        formStatus.textContent =
          "Please check the highlighted fields and try again.";

        formStatus.classList.remove("success");

        invalid.focus();
        invalid.reportValidity();

        return;
      }

      if (
        !window.emailjs ||
        !emailJsConfigured ||
        !emailJsReady
      ) {
        formStatus.textContent =
          "Email delivery is not configured yet. Please contact the site owner directly.";

        formStatus.classList.remove("success");

        console.warn(
          "EmailJS setup required. Check the public key, service ID and template ID."
        );

        return;
      }

      const originalButtonText =
        submitButton?.innerHTML || "Send message";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
      }

      formStatus.textContent =
        "Sending your message securely…";

      formStatus.setAttribute("aria-busy", "true");
      formStatus.classList.remove("success");

      const templateParams = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        interest: interestField?.value.trim() || "Not specified",
        time: new Date().toLocaleString(),
        title: "NexaFlow AI Contact Enquiry",
        message: messageField.value.trim()
      };

      try {
        await window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams
        );

        formStatus.textContent =
          `Thanks, ${templateParams.name}! Your message was sent successfully. We'll reply to ${templateParams.email}.`;

        formStatus.classList.add("success");

        contactForm.reset();

        fields.forEach(field => {
          field.removeAttribute("aria-invalid");
        });

      } catch (error) {
        console.error(
          "EmailJS send failed:",
          error?.text || error?.message || "Unknown error"
        );

        formStatus.textContent =
          "We couldn't send your message right now. Please try again in a moment.";

        formStatus.classList.remove("success");

      } finally {
        formStatus.setAttribute("aria-busy", "false");

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      }
    }
  );

  $$("#contact-form input, #contact-form textarea").forEach(
    field => {
      field.addEventListener("input", () => {
        field.removeAttribute("aria-invalid");
      });
    }
  );

  // ==========================================
  // 10. DEMO CHAT ASSISTANT
  // Prewritten responses — not connected to AI.
  // ==========================================

  const launcher = $("#chat-launcher");
  const chatPanel = $("#chat-panel");
  const chatMessages = $("#chat-messages");
  const chatInput = $("#chat-input");

  const closeChat = () => {
    if (!chatPanel) return;

    chatPanel.hidden = true;

    launcher?.setAttribute("aria-expanded", "false");
    launcher?.focus();
  };

  launcher?.addEventListener("click", () => {
    if (!chatPanel) return;

    chatPanel.hidden = !chatPanel.hidden;

    launcher.setAttribute(
      "aria-expanded",
      String(!chatPanel.hidden)
    );

    if (!chatPanel.hidden) chatInput?.focus();
  });

  $("#chat-close")?.addEventListener("click", closeChat);

  const addChatMessage = (message, type) => {
    if (!chatMessages) return;

    const bubble = document.createElement("div");

    bubble.className =
      `chat-bubble ${
        type === "user" ? "user-bubble" : "bot-bubble"
      }`;

    bubble.textContent = message;

    chatMessages.append(bubble);

    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth"
    });
  };

  const getReply = message => {
    const text = message.toLowerCase();

    if (
      text.includes("price") ||
      text.includes("plan") ||
      text.includes("cost")
    ) {
      return "The demo includes Starter, Growth and Scale example plans. Use the monthly/yearly switch in the Pricing section to compare sample prices.";
    }

    if (
      text.includes("automation") ||
      text.includes("workflow") ||
      text.includes("do")
    ) {
      return "NexaFlow's concept focuses on three things: automating repeatable tasks, turning activity into useful insights and connecting the tools you already use.";
    }

    if (
      text.includes("contact") ||
      text.includes("email") ||
      text.includes("message")
    ) {
      return "Use the contact form near the bottom of the page to send an enquiry. Email delivery is available after the site owner configures the email service.";
    }

    if (
      text.includes("hello") ||
      text.includes("hi ") ||
      text === "hi"
    ) {
      return "Hello! Try asking about workflows, features or example pricing.";
    }

    return "I'm a small prewritten demo assistant, so I can help with NexaFlow features, workflows, pricing and the contact form. Try one of those topics!";
  };

  const sendChat = message => {
    const clean = message.trim();

    if (!clean) return;

    addChatMessage(clean, "user");
    addChatMessage(getReply(clean), "bot");
  };

  $("#chat-form")?.addEventListener("submit", event => {
    event.preventDefault();

    if (!chatInput) return;

    sendChat(chatInput.value);

    chatInput.value = "";
    chatInput.focus();
  });

  $$(".chat-suggestions button").forEach(button => {
    button.addEventListener("click", () => {
      sendChat(
        button.dataset.question || button.textContent
      );
    });
  });

  // ==========================================
  // 11. WORKFLOW STUDIO SIMULATOR
  // Front-end simulation only.
  // ==========================================

  const workflowTrigger = $("#workflow-trigger");
  const workflowAction = $("#workflow-action");
  const workflowOutput = $("#workflow-output");

  const runWorkflowButton = $("#run-workflow");
  const resetWorkflowButton = $("#reset-workflow");

  const workflowStatus = $("#workflow-status");
  const workflowLog = $("#workflow-log");

  const workflowNodes = [
    $("#node-trigger"),
    $("#node-ai"),
    $("#node-output")
  ];

  const workflowSelects = [
    workflowTrigger,
    workflowAction,
    workflowOutput
  ];

  const previewElements = [
    $("#preview-trigger"),
    $("#preview-action"),
    $("#preview-output")
  ];

  let workflowRunning = false;

  const workflowReady =
    workflowSelects.every(Boolean) &&
    runWorkflowButton &&
    resetWorkflowButton &&
    workflowStatus &&
    workflowLog &&
    workflowNodes.every(node =>
      node && node.querySelector(".execution-indicator")
    ) &&
    previewElements.every(Boolean);

  if (workflowReady) {
    const waitForWorkflow = ms =>
      new Promise(resolve => setTimeout(resolve, ms));

    const addWorkflowLog = (
      message,
      success = false
    ) => {
      const entry = document.createElement("p");

      entry.textContent = message;

      if (success) {
        entry.classList.add("log-success");
      }

      workflowLog.appendChild(entry);

      workflowLog.scrollTop = workflowLog.scrollHeight;
    };

    const updateWorkflowPreview = () => {
      previewElements[0].textContent =
        workflowTrigger.value;

      previewElements[1].textContent =
        workflowAction.value;

      previewElements[2].textContent =
        workflowOutput.value;
    };

    const resetWorkflow = () => {
      if (workflowRunning) return;

      workflowNodes.forEach(node => {
        node.classList.remove("running", "completed");

        const indicator =
          node.querySelector(".execution-indicator");

        if (indicator) indicator.textContent = "WAITING";
      });

      workflowStatus.textContent = "READY TO RUN";

      workflowLog.replaceChildren();

      const initialMessage = document.createElement("p");

      initialMessage.textContent =
        "System ready. Configure your workflow to begin.";

      workflowLog.appendChild(initialMessage);

      updateWorkflowPreview();
    };

    const runWorkflow = async () => {
      if (workflowRunning) return;

      resetWorkflow();

      workflowRunning = true;

      const originalButtonHTML =
        runWorkflowButton.innerHTML;

      runWorkflowButton.disabled = true;
      resetWorkflowButton.disabled = true;

      workflowSelects.forEach(select => {
        select.disabled = true;
      });

      runWorkflowButton.textContent =
        "Running workflow...";

      workflowStatus.textContent = "EXECUTING";

      const steps = [
        {
          name: "Trigger",
          message:
            "Trigger received: " + workflowTrigger.value
        },
        {
          name: "AI Processing",
          message:
            "AI action selected: " + workflowAction.value
        },
        {
          name: "Final Output",
          message:
            "Output selected: " + workflowOutput.value
        }
      ];

      addWorkflowLog("Starting workflow execution...");

      try {
        for (let i = 0; i < workflowNodes.length; i++) {
          const node = workflowNodes[i];

          const indicator =
            node.querySelector(".execution-indicator");

          node.classList.add("running");

          indicator.textContent = "RUNNING";

          addWorkflowLog(steps[i].message);

          await waitForWorkflow(1100);

          node.classList.remove("running");
          node.classList.add("completed");

          indicator.textContent = "COMPLETED";

          addWorkflowLog(
            steps[i].name + " completed successfully.",
            true
          );
        }

        workflowStatus.textContent = "SUCCESS";

        addWorkflowLog(
          "Workflow simulation completed successfully!",
          true
        );

      } catch (error) {
        console.error("Workflow execution error:", error);

        workflowStatus.textContent = "ERROR";

        addWorkflowLog(
          "Something went wrong during execution."
        );

      } finally {
        workflowRunning = false;

        runWorkflowButton.disabled = false;
        resetWorkflowButton.disabled = false;

        workflowSelects.forEach(select => {
          select.disabled = false;
        });

        runWorkflowButton.innerHTML = originalButtonHTML;
      }
    };

    workflowSelects.forEach(select => {
      select.addEventListener(
        "change",
        updateWorkflowPreview
      );
    });

    runWorkflowButton.addEventListener(
      "click",
      runWorkflow
    );

    resetWorkflowButton.addEventListener(
      "click",
      resetWorkflow
    );

    resetWorkflow();

  } else if ($("#playground")) {
    console.warn(
      "Workflow Studio could not initialize. Check its HTML element IDs."
    );
  }

  // ==========================================
  // 12. CURRENT YEAR IN FOOTER
  // ==========================================

  const year = $("#current-year");

  if (year) {
    year.textContent = String(
      new Date().getFullYear()
    );
  }

  console.info("NexaFlow AI demo initialized.");
});
