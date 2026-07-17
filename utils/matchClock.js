// Shared live match clock logic.
// Formula: 0-45min = 1st half, 45-60min = HT, 60-105min = 2nd half (shown as 46'-90'),
// 105-120min = stoppage time (shown as 90+1' to 90+15'), 120min+ = Full Time.

export function getMatchClock(kickoffDate) {
  if (!kickoffDate) return { display: '', minutesElapsed: 0, isHalftime: false, isFullTime: false };

  const now = new Date();
  const elapsedMs = now - kickoffDate;
  const minutesElapsed = Math.floor(elapsedMs / 60000);

  if (minutesElapsed < 0) {
    return { display: '', minutesElapsed, isHalftime: false, isFullTime: false };
  }

  if (minutesElapsed <= 45) {
    return { display: `${Math.max(minutesElapsed, 1)}'`, minutesElapsed, isHalftime: false, isFullTime: false };
  }

  if (minutesElapsed <= 60) {
    return { display: 'HT', minutesElapsed, isHalftime: true, isFullTime: false };
  }

  if (minutesElapsed <= 105) {
    const secondHalfMinute = 45 + (minutesElapsed - 60);
    return { display: `${secondHalfMinute}'`, minutesElapsed, isHalftime: false, isFullTime: false };
  }

  if (minutesElapsed <= 120) {
    const stoppage = minutesElapsed - 105;
    return { display: `90+${stoppage}'`, minutesElapsed, isHalftime: false, isFullTime: false };
  }

  return { display: 'FT', minutesElapsed, isHalftime: false, isFullTime: true };
}

// Combines a match's date ("2026-07-18") and time ("22:00") fields into a local Date object.
// Mirrors the parseMatchDate logic already used across the app.
export function getKickoffDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const cleaned = dateStr.toString().replace(/[A-Z]{2,4}$/, '').replace(/\//g, '-').trim();
  const timePart = (timeStr || '00:00').toString().trim();
  const d = new Date(`${cleaned}T${timePart}:00`);
  return isNaN(d) ? null : d;
}
