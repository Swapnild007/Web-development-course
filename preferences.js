/* Local-only study preference controls. No account or network storage. */
(() => {
  "use strict";
  const goal = document.querySelector("#study-goal");
  const motion = document.querySelector("#reduce-motion");
  const status = document.querySelector("#preferences-status");
  if (!goal || !motion || !status) return;
  const key = "learning-studio.preferences.v1";
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    if (["2","4","6","8","10"].includes(String(saved.weeklyGoal))) goal.value = String(saved.weeklyGoal);
    motion.checked = saved.reduceMotion === true;
  } catch (_) {
    status.textContent = "Preferences are available for this session; browser storage is unavailable.";
  }
  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify({weeklyGoal: goal.value, reduceMotion: motion.checked}));
      document.documentElement.classList.toggle("user-reduced-motion", motion.checked);
      status.textContent = "Preferences saved on this device.";
    } catch (_) {
      status.textContent = "Could not save preferences in this browser.";
    }
  }
  goal.addEventListener("change", persist);
  motion.addEventListener("change", persist);
  document.documentElement.classList.toggle("user-reduced-motion", motion.checked);
})();
