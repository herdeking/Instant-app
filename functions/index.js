const { setGlobalOptions } = require("firebase-functions");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

// Fires whenever a match document is created or updated. Sends a push
// notification to all subscribed users the moment a match's status
// transitions to "live" (not on every edit, only on that specific change).
exports.notifyOnMatchLive = onDocumentWritten("matches/{matchId}", async (event) => {
  const before = event.data.before.exists ? event.data.before.data() : null;
  const after = event.data.after.exists ? event.data.after.data() : null;

  if (!after) return; // document was deleted, nothing to notify

  const wasLive = before?.status === "live";
  const isLive = after?.status === "live";

  // Only notify on the transition INTO live, not every subsequent edit
  // (e.g. score updates) while the match stays live.
  if (isLive && !wasLive) {
    const home = after.home || "Home";
    const away = after.away || "Away";
    const comp = after.comp || "Football";

    const message = {
      notification: {
        title: `🔴 LIVE: ${home} vs ${away}`,
        body: `${comp} is live now on FullTime — tap to watch!`,
      },
      data: {
        matchId: event.params.matchId,
        type: "match_live",
      },
      topic: "live_matches",
    };

    try {
      await admin.messaging().send(message);
      logger.info(`Notification sent for match ${event.params.matchId}: ${home} vs ${away}`);
    } catch (err) {
      logger.error("Failed to send notification", err);
    }
  }
});
