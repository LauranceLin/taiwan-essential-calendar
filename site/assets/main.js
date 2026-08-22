const status = document.querySelector("#copy-status");

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = `已複製 ${button.dataset.copy}`;
      button.textContent = "已複製";
      window.setTimeout(() => {
        button.textContent = "複製網址";
      }, 1800);
    } catch {
      status.textContent = "無法自動複製，請選取卡片下方的網址。";
    }
  });
}

document.querySelector("#current-year").textContent = new Date().getFullYear();
