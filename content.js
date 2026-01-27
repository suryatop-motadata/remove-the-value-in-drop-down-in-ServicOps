(function () {
  if (window.__optionBotLoaded) return;
  window.__optionBotLoaded = true;

  let running = false;

  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.top = "120px";
  panel.style.right = "20px";
  panel.style.zIndex = "2147483647";
  panel.style.background = "#ffffff";
  panel.style.color = "#000000";
  panel.style.padding = "0";
  panel.style.borderRadius = "10px";
  panel.style.width = "240px";
  panel.style.border = "2px solid #3b82f6";
  panel.style.boxShadow = "0 10px 25px rgba(0,0,0,.6)";
  panel.innerHTML = `
    <div id="opt-header" style="cursor:move;font-weight:700;padding:8px 12px;background:#3b82f6;color:#fff;border-radius:8px 8px 0 0;">
      Option Bot
    </div>
    <div style="padding:12px;">
      <textarea id="opt-values" rows="6"
        style="width:100%;box-sizing:border-box;border:1px solid #ccc;border-radius:6px;padding:6px;"
        placeholder="One value per line"></textarea>
      <button id="start-btn"
        style="width:100%;margin-top:8px;padding:6px;border-radius:6px;background:#22c55e;color:#fff;border:none;">
        Start
      </button>
      <button id="remove-btn"
        style="width:100%;margin-top:6px;padding:6px;border-radius:6px;background:#ef4444;color:#fff;border:none;">
        Remove
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  /* ---------- Drag Logic ---------- */
  (function enableDrag() {
    const header = panel.querySelector("#opt-header");
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = panel.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
      panel.style.right = "auto";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  })();

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function getAddButton() {
    return [...document.querySelectorAll("a")]
      .find(a => a.textContent.trim() === "Add" && a.querySelector("svg"));
  }

  function getOptionRows() {
    return [...document.querySelectorAll(".option")];
  }

  async function addOption(value) {
    const addBtn = getAddButton();
    if (!addBtn) return;

    addBtn.click();

    let input = null;
    for (let i = 0; i < 20; i++) {
      input = document.querySelector(".option.editing.active input.ant-input");
      if (input) break;
      await sleep(150);
    }
    if (!input) return;

    input.focus();
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await sleep(200);

    const optionRow = input.closest(".option");
    const tickBtn = optionRow.querySelector("a[title='Update'], .fa-check");
    if (tickBtn) {
      (tickBtn.closest("a") || tickBtn).click();
    }
  }

  async function confirmDelete() {
    for (let i = 0; i < 20; i++) {
      const yesBtn = [...document.querySelectorAll(".ant-popover-buttons button")]
        .find(b => b.innerText.trim() === "Yes");
      if (yesBtn) {
        yesBtn.click();
        return;
      }
      await sleep(150);
    }
  }

  async function removeOption(value) {
    const rows = getOptionRows();
    for (const row of rows) {
      const text = row.innerText.trim();
      if (text === value) {
        const del = row.querySelector(".delete-button, [title='Delete']");
        if (del) {
          del.click();
          await sleep(200);
          await confirmDelete();
          await sleep(300);
        }
      }
    }
  }

  async function process(values, mode) {
    for (const v of values) {
      if (!running && mode === "add") break;
      if (!v) continue;
      if (mode === "add") await addOption(v);
      if (mode === "remove") await removeOption(v);
      await sleep(500);
    }
  }

  panel.querySelector("#start-btn").onclick = async () => {
    running = !running;
    panel.querySelector("#start-btn").textContent = running ? "Stop" : "Start";
    if (!running) return;

    const values = panel.querySelector("#opt-values").value
      .split("\n")
      .map(v => v.trim());

    process(values, "add");
  };

  panel.querySelector("#remove-btn").onclick = async () => {
    const values = panel.querySelector("#opt-values").value
      .split("\n")
      .map(v => v.trim());

    process(values, "remove");
  };
})();
