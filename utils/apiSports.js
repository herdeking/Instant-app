// Shared api-sports.io helpers for resolving a Firestore match to a live
// api-sports.io fixture, so we can pull real-time scores/elapsed minute.

const API_KEY = '14fc22d6286abe7f65bd37725b8fb926';
const BASE_URL = 'https://v3.football.api-sports.io';

const teamIdCache = {};
const fixtureCache = {}; // key: `${homeId}-${awayId}-${date}` -> fixture data

async function getTeamId(teamName) {
  if (!teamName) return null;
  if (teamIdCache[teamName]) return teamIdCache[teamName];

  try {
    const res = await fetch(`${BASE_URL}/teams?search=${encodeURIComponent(teamName)}`, {
      headers: { 'x-apisports-key': API_KEY },
    });
    const data = await res.json();
    const id = data?.response?.[0]?.team?.id || null;
    if (id) teamIdCache[teamName] = id;
    return id;
  } catch {
    return null;
  }
}

// Finds today's fixture between two teams and returns live score/status.
// Returns null if no fixture found or the lookup fails (caller should fall
// back to manually-set Firestore scores in that case).
export async function getLiveFixture(homeTeamName, awayTeamName, dateStr) {
  const cacheKey = `${homeTeamName}-${awayTeamName}-${dateStr}`;
  if (fixtureCache[cacheKey]?.expiresAt > Date.now()) {
    return fixtureCache[cacheKey].data;
  }

  const homeId = await getTeamId(homeTeamName);
  if (!homeId) return null;

  try {
    // date filter narrows results to fixtures on the match day
    const dateParam = dateStr ? `&date=${dateStr}` : '';
    const res = await fetch(`${BASE_URL}/fixtures?team=${homeId}${dateParam}`, {
      headers: { 'x-apisports-key': API_KEY },
    });
    const data = await res.json();
    const fixtures = data?.response || [];

    const awayId = await getTeamId(awayTeamName);
    const match = fixtures.find((f) =>
      f.teams?.home?.id === homeId && (awayId ? f.teams?.away?.id === awayId : true)
    ) || fixtures[0];

    if (!match) {
      fixtureCache[cacheKey] = { data: null, expiresAt: Date.now() + 60000 };
      return null;
    }

    const result = {
      status: match.fixture?.status?.short, // e.g. '1H', 'HT', '2H', 'FT'
      elapsed: match.fixture?.status?.elapsed,
      homeScore: match.goals?.home,
      awayScore: match.goals?.away,
    };

    // Cache for 60s to respect free-tier rate limits
    fixtureCache[cacheKey] = { data: result, expiresAt: Date.now() + 60000 };
    return result;
  } catch {
    return null;
  }
}
