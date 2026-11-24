/** Strip legacy seed prefix from property titles for display. */
export function displayPropertyName(name) {
  return String(name || "")
    .replace(/^\[DEMO\]\s*/i, "")
    .trim();
}
