
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const temperatureInput = $("#temperatureInput");
  const inputUnit = $("#inputUnit");
  const convertButton = $("#convertButton");
  const resetButton = $("#resetButton");
  const errorMessage = $("#errorMessage");
  const resultStatus = $("#resultStatus");

  const resultElements = {
    C: $("#celsiusResult"),
    F: $("#fahrenheitResult"),
    K: $("#kelvinResult")
  };

  const unitNames = {
    C: "Celsius",
    F: "Fahrenheit",
    K: "Kelvin"
  };

  const HISTORY_KEY = "temporaConversionHistory";
  const MAX_HISTORY = 5;
  const ABSOLUTE_ZERO = -273.15;
  const ABSOLUTE_ZERO_EPSILON = 1e-9;

  let history = loadHistory();

  // ----------------------------------------
  // 1. TEMPERATURE CONVERSION
  // ----------------------------------------

  function toCelsius(value, unit) {
    if (unit === "F") {
      return (value - 32) * 5 / 9;
    }

    if (unit === "K") {
      return value - 273.15;
    }

    return value;
  }

  function fromCelsius(celsius) {
    return {
      C: celsius,
      F: (celsius * 9 / 5) + 32,
      K: celsius + 273.15
    };
  }

  function formatTemperature(value) {
    const rounded = Number(value.toFixed(2));

    return rounded.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // ----------------------------------------
  // 2. VALIDATION
  // ----------------------------------------

  function validateInput() {
    const rawValue = temperatureInput.value.trim();

    if (rawValue === "") {
      return "Please enter a temperature value.";
    }

    const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

    if (!numericPattern.test(rawValue)) {
      return "Please enter a valid numeric temperature.";
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      return "The entered value is too large or invalid.";
    }

    const celsius = toCelsius(value, inputUnit.value);

    if (celsius < ABSOLUTE_ZERO - ABSOLUTE_ZERO_EPSILON) {
      return "Temperature cannot be below absolute zero (−273.15°C).";
    }

    return "";
  }

  function showError(message) {
    errorMessage.textContent = message;
    temperatureInput.setAttribute("aria-invalid", "true");
  }

  function clearError() {
    errorMessage.textContent = "";
    temperatureInput.removeAttribute("aria-invalid");
  }

  // ----------------------------------------
  // 3. TEMPERATURE INSIGHTS
  // ----------------------------------------

  function getTemperatureInfo(celsius) {
    if (celsius <= -100) {
      return {
        title: "Extreme cold",
        description: "This is an extremely low temperature, far below the freezing point of water.",
        icon: "❄",
        condition: "EXTREME COLD",
        mode: "cold-mode"
      };
    }

    if (celsius < 0) {
      return {
        title: "Below freezing",
        description: "Water freezes at 0°C. This temperature is below its usual freezing point.",
        icon: "❄",
        condition: "FREEZING",
        mode: "cold-mode"
      };
    }

    if (celsius < 15) {
      return {
        title: "Chilly conditions",
        description: "A cool temperature. You may want an extra layer of clothing.",
        icon: "☁",
        condition: "CHILLY",
        mode: "cold-mode"
      };
    }

    if (celsius <= 27) {
      return {
        title: "Comfort zone",
        description: "A generally comfortable temperature for many indoor environments.",
        icon: "◉",
        condition: "COMFORT ZONE",
        mode: "comfort-mode"
      };
    }

    if (celsius <= 35) {
      return {
        title: "Getting warmer",
        description: "A warm temperature. Staying hydrated can help you stay comfortable.",
        icon: "☀",
        condition: "WARM",
        mode: "hot-mode"
      };
    }

    if (celsius <= 50) {
      return {
        title: "High temperature",
        description: "This is hot. Take care around heated surfaces and hot environments.",
        icon: "♨",
        condition: "HOT",
        mode: "hot-mode"
      };
    }

    return {
      title: "Extreme heat",
      description: "This is an extremely high temperature. Avoid direct contact with hot materials.",
      icon: "♨",
      condition: "EXTREME HEAT",
      mode: "hot-mode"
    };
  }

  function updateTemperatureVisuals(celsius, sourceValue, sourceUnit) {
    const info = getTemperatureInfo(celsius);

    $("#insightIcon").textContent = info.icon;
    $("#insightTitle").textContent = info.title;
    $("#insightDescription").textContent = info.description;

    $("#insightValue").textContent =
      `${formatTemperature(sourceValue)}°${sourceUnit}`;

    $("#heroTemperature").textContent = `${Math.round(celsius)}°`;
    $("#heroCondition").textContent = info.condition;

    document.body.classList.remove(
      "cold-mode",
      "comfort-mode",
      "hot-mode"
    );

    document.body.classList.add(info.mode);

    // Map -50°C to 60°C onto the thermal scale.
    const percentage = Math.max(
      0,
      Math.min(100, ((celsius + 50) / 110) * 100)
    );

    $("#spectrumMarker").style.left = `${percentage}%`;
  }

  // ----------------------------------------
  // 4. CONVERT AND DISPLAY RESULTS
  // ----------------------------------------

  function convertTemperature() {
    clearError();

    const validationError = validateInput();

    if (validationError) {
      showError(validationError);
      resultStatus.textContent = "CHECK YOUR INPUT";
      temperatureInput.focus();
      return;
    }

    const value = Number(temperatureInput.value);
    const unit = inputUnit.value;

    // Normalize tiny floating-point differences at absolute zero.
    const celsius = Math.max(
      ABSOLUTE_ZERO,
      toCelsius(value, unit)
    );

    const results = fromCelsius(celsius);

    Object.entries(results).forEach(([resultUnit, resultValue]) => {
      resultElements[resultUnit].textContent =
        `${formatTemperature(resultValue)}°${resultUnit}`;
    });

    $$(".result-card").forEach((card) => {
      card.classList.toggle(
        "selected",
        card.dataset.unit === unit
      );
    });

    resultStatus.textContent = "CONVERSION COMPLETE";

    updateTemperatureVisuals(celsius, value, unit);

    addToHistory(value, unit, results);
  }

  // ----------------------------------------
  // 5. CONVERSION HISTORY
  // ----------------------------------------

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved
        .filter((entry) =>
          entry &&
          typeof entry.input === "string" &&
          typeof entry.output === "string"
        )
        .slice(0, MAX_HISTORY);

    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // The converter still works if browser storage is unavailable.
    }
  }

  function addToHistory(value, unit, results) {
    const entry = {
      input: `${formatTemperature(value)}°${unit}`,
      output: `${formatTemperature(results.C)}°C`,
      timestamp: Date.now()
    };

    history.unshift(entry);
    history = history.slice(0, MAX_HISTORY);

    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    const historyList = $("#historyList");

    if (history.length === 0) {
      historyList.innerHTML =
        '<p class="empty-history">Your recent conversions will appear here.</p>';

      return;
    }

    historyList.innerHTML = history.map((entry, index) => `
      <div class="history-item">
        <div>
          <strong>${escapeHTML(entry.input)} → ${escapeHTML(entry.output)}</strong>
          <small>${index === 0 ? "Most recent" : "Previous conversion"}</small>
        </div>

        <button type="button" data-history-index="${index}">
          Use value ↗
        </button>
      </div>
    `).join("");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  $("#historyList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-history-index]");

    if (!button) {
      return;
    }

    const entry = history[Number(button.dataset.historyIndex)];

    if (!entry) {
      return;
    }

    const match = entry.input.match(/^(.+)([CFK])$/);

    if (!match) {
      return;
    }

    temperatureInput.value = match[1].replace("°", "");
    inputUnit.value = match[2];

    convertTemperature();

    $("#converter").scrollIntoView({
      behavior: "smooth"
    });
  });

  $("#clearHistoryButton").addEventListener("click", () => {
    history = [];

    saveHistory();
    renderHistory();
  });

  // ----------------------------------------
  // 6. COPY RESULTS
  // ----------------------------------------

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied!";
    } catch {
      button.textContent = "Unavailable";
    }

    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1300);
  }

  $$(".copy-button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.copy);

      if (!target || target.textContent === "—") {
        return;
      }

      copyText(target.textContent, button);
    });
  });

  // ----------------------------------------
  // 7. QUICK TEMPERATURE PRESETS
  // ----------------------------------------

  $$(".preset").forEach((button) => {
    button.addEventListener("click", () => {
      temperatureInput.value = button.dataset.value;
      inputUnit.value = button.dataset.unit;

      clearError();
      convertTemperature();
    });
  });

  // ----------------------------------------
  // 8. RESET
  // ----------------------------------------

  function resetConverter() {
    temperatureInput.value = "";
    inputUnit.value = "C";

    clearError();

    Object.values(resultElements).forEach((element) => {
      element.textContent = "—";
    });

    $$(".result-card").forEach((card) => {
      card.classList.remove("selected");
    });

    resultStatus.textContent = "AWAITING INPUT";

    $("#insightIcon").textContent = "◉";
    $("#insightTitle").textContent = "Ready when you are.";

    $("#insightDescription").textContent =
      "Enter a temperature to discover where it sits on the thermal scale.";

    $("#insightValue").textContent = "—";

    $("#heroTemperature").textContent = "25°";
    $("#heroCondition").textContent = "ROOM TEMPERATURE";

    $("#spectrumMarker").style.left = "68.18%";

    document.body.classList.remove(
      "cold-mode",
      "comfort-mode",
      "hot-mode"
    );
  }

  // ----------------------------------------
  // 9. MOBILE NAVIGATION
  // ----------------------------------------

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  $$("#navLinks a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });

  // ----------------------------------------
  // 10. EVENT LISTENERS
  // ----------------------------------------

  convertButton.addEventListener("click", convertTemperature);
  resetButton.addEventListener("click", resetConverter);

  temperatureInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      convertTemperature();
    }
  });

  temperatureInput.addEventListener("input", clearError);
  inputUnit.addEventListener("change", clearError);

  // ----------------------------------------
  // 11. INITIALIZE
  // ----------------------------------------

  renderHistory();
});
