/*
Version 1.0
*/

const HOURS_TO_FILTER = 12; // Hours to filter for the recent period stats
const DAYS_TO_FILTER = 30;   // Days to filter for the last 30 days stats
const LONG_TERM_DAYS = 365;  // Days to filter for the last 365 days stats
const GAME_MODE_STANDARD = 1; // Standard game mode identifier
const STATS_ENDPOINT = `https://s.defly.io/mystats?s=${window.localStorage["sessionId"]}`;

// CSS for the stats overlay
const css = `
#stats-overlay {
    position: fixed;
    bottom: 32px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7); /* Slightly darker for better contrast */
    color: white;
    padding: 10px;
    border-radius: 8px;
    z-index: 1000; /* High z-index to ensure it is on top */
    font-family: Arial, sans-serif;
    pointer-events: none; /* Prevent interaction with the overlay */
}

#stats-overlay table {
    width: 100%; /* Ensures the table uses the full width of the overlay */
    font-size: 12px; /* Standard font size for the text */
    border-collapse: collapse; /* Collapse borders for cleaner lines */
}

#stats-overlay th, #stats-overlay td {
    border-right: 1px solid #ffffff; /* Add vertical lines between columns */
    padding: 4px 8px; /* Increased padding for better readability */
    text-align: center; /* Center align all text */
}

#stats-overlay th:first-child, #stats-overlay td:first-child {
    text-align: right; /* Left align the first column */
}

#stats-overlay th:last-child, #stats-overlay td:last-child {
    border-right: none; /* Remove the right border from the last column */
}

#stats-overlay .footer-text {
    font-size: 9px; /* Slightly smaller font size for the footer text */
    opacity: 0.8; /* Make the footer text slightly less prominent */
    margin-top: 5px; /* Adds space above the footer text */
    text-align: right; /* Right align the footer text */
}
`;

// Create and append style element
const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

// Create and append overlay HTML
const overlay = document.createElement('div');
overlay.id = 'stats-overlay';
overlay.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Last ${HOURS_TO_FILTER} Hours</th>
                <th>Last ${DAYS_TO_FILTER} Days</th>
                <th>Last ${LONG_TERM_DAYS} Days</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Kills:</td>
                <td><span id="display-kills-12h">0</span></td>
                <td><span id="display-kills-30d">0</span></td>
                <td><span id="display-kills-365d">0</span></td>
            </tr>
            <tr>
                <td>Minutes Per Kill:</td>
                <td><span id="display-minutes-per-kill-12h">0</span></td>
                <td><span id="display-minutes-per-kill-30d">0</span></td>
                <td><span id="display-minutes-per-kill-365d">0</span></td>
            </tr>
            <tr>
                <td>Kills Per Death:</td>
                <td><span id="display-kills-per-death-12h">0</span></td>
                <td><span id="display-kills-per-death-30d">0</span></td>
                <td><span id="display-kills-per-death-365d">0</span></td>
            </tr>
            <tr>
                <td>Minutes Per Death:</td>
                <td><span id="display-minutes-per-death-12h">0</span></td>
                <td><span id="display-minutes-per-death-30d">0</span></td>
                <td><span id="display-minutes-per-death-365d">0</span></td>
            </tr>
            <tr>
                <td>Towers Destroyed:</td>
                <td><span id="display-towers-destroyed-12h">0</span></td>
                <td><span id="display-towers-destroyed-30d">0</span></td>
                <td><span id="display-towers-destroyed-365d">0</span></td>
            </tr>
            <tr>
                <td>Score:</td>
                <td><span id="display-score-12h">0</span></td>
                <td><span id="display-score-30d">0</span></td>
                <td><span id="display-score-365d">0</span></td>
            </tr>
            <tr>
                <td>Time Played:</td>
                <td><span id="display-time-played-12h">00h 00m 00s</span></td>
                <td><span id="display-time-played-30d">00h 00m 00s</span></td>
                <td><span id="display-time-played-365d">00h 00m 00s</span></td>
            </tr>
        </tbody>
    </table>
    <div class="footer-text">(Stats update on respawn)</div>
`;
document.body.appendChild(overlay);

let lastScore = getCurrentScore();
let hasScoreReset = false;

// Helper function to get current score from the DOM
function getCurrentScore() {
    const scoreElement = document.getElementById("lb-player-points");
    return scoreElement ? parseInt(scoreElement.textContent, 10) : 0;
}

// Function to update the overlay with new stats
function updateOverlay(last12HoursStats, last30DaysStats, last365DaysStats) {
    // Last 12 Hours Stats
    document.getElementById('display-kills-12h').textContent = last12HoursStats.kills;
    document.getElementById('display-minutes-per-kill-12h').textContent = last12HoursStats.minutesPerKill;
    document.getElementById('display-kills-per-death-12h').textContent = last12HoursStats.killsPerDeath;
    document.getElementById('display-minutes-per-death-12h').textContent = last12HoursStats.minutesPerDeath;
    document.getElementById('display-towers-destroyed-12h').textContent = last12HoursStats.towersDestroyed;
    document.getElementById('display-score-12h').textContent = last12HoursStats.score;
    document.getElementById('display-time-played-12h').textContent = formatTime(last12HoursStats.timePlayedMinutes);
    
    // Last 30 Days Stats
    document.getElementById('display-kills-30d').textContent = last30DaysStats.kills;
    document.getElementById('display-minutes-per-kill-30d').textContent = last30DaysStats.minutesPerKill;
    document.getElementById('display-kills-per-death-30d').textContent = last30DaysStats.killsPerDeath;
    document.getElementById('display-minutes-per-death-30d').textContent = last30DaysStats.minutesPerDeath;
    document.getElementById('display-towers-destroyed-30d').textContent = last30DaysStats.towersDestroyed;
    document.getElementById('display-score-30d').textContent = last30DaysStats.score;
    document.getElementById('display-time-played-30d').textContent = formatTime(last30DaysStats.timePlayedMinutes);
    
    // Last 365 Days Stats
    document.getElementById('display-kills-365d').textContent = last365DaysStats.kills;
    document.getElementById('display-minutes-per-kill-365d').textContent = last365DaysStats.minutesPerKill;
    document.getElementById('display-kills-per-death-365d').textContent = last365DaysStats.killsPerDeath;
    document.getElementById('display-minutes-per-death-365d').textContent = last365DaysStats.minutesPerDeath;
    document.getElementById('display-towers-destroyed-365d').textContent = last365DaysStats.towersDestroyed;
    document.getElementById('display-score-365d').textContent = last365DaysStats.score;
    document.getElementById('display-time-played-365d').textContent = formatTime(last365DaysStats.timePlayedMinutes);
}

// Function to format minutes into HHh MMm SSs
function formatTime(totalMinutes) {
    const totalSeconds = Math.floor(totalMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad with zeros if needed
    const formattedHours = String(hours).padStart(2, '0') + 'h';
    const formattedMinutes = String(minutes).padStart(2, '0') + 'm';
    const formattedSeconds = String(seconds).padStart(2, '0') + 's';

    return `${formattedHours} ${formattedMinutes} ${formattedSeconds}`;
}

// Function to calculate derived statistics
function calculateDerivedStats(stats) {
    return {
        kills: stats.totalKills,
        towersDestroyed: stats.totalTowersDestroyed,
        score: Math.round(stats.totalScore), // Rounds to the nearest whole number
        minutesPerKill: stats.totalKills ? (stats.totalMinutes / stats.totalKills).toFixed(2) : '0',
        killsPerDeath: stats.totalDeaths ? (stats.totalKills / stats.totalDeaths).toFixed(2) : '0',
        minutesPerDeath: stats.totalDeaths ? (stats.totalMinutes / stats.totalDeaths).toFixed(2) : '0',
        timePlayedMinutes: stats.totalMinutes // Total time in minutes
    };
}

// Function to get statistics from the last 'n' milliseconds for a specific game mode
function getPeriodStats(userData, periodInMilliseconds, gameMode) {
    const cutoffTime = Date.now() - periodInMilliseconds;

    // Filter data to include only games within the specified period and of the specified game mode
    const filteredData = userData.filter(game => {
        const gameStartTime = game.start; // Assuming 'start' is in milliseconds
        return !isNaN(gameStartTime) && gameStartTime >= cutoffTime && game.game_mode === gameMode;
    });

    // Aggregate the data to sum kills, deaths, towers destroyed, score, and minutes played
    const aggregatedStats = filteredData.reduce((acc, game) => {
        acc.totalKills += game.player_kills || 0;
        if (game.kill_reason !== 0) {
            acc.totalDeaths += 1;
        }
        acc.totalTowersDestroyed += game.dot_kills || 0; // Assuming 'dot_kills' corresponds to towers destroyed
        acc.totalScore += game.max_score || 0;
        acc.totalMinutes += ((game.end - game.start) / 60000) || 0; // Convert milliseconds to minutes
        return acc;
    }, { totalKills: 0, totalDeaths: 0, totalTowersDestroyed: 0, totalScore: 0, totalMinutes: 0 });

    // Calculate derived statistics
    return calculateDerivedStats(aggregatedStats);
}

// Function to fetch all stats
async function fetchAllStats() {
    try {
        const response = await fetch(STATS_ENDPOINT);
        if (!response.ok) {
            console.error("Failed to fetch data, status:", response.status);
            return null;
        }
        const dataText = await response.text();
        const userData = JSON.parse(dataText.split("\n")[0]);

        return userData;
    } catch (error) {
        console.error("Error fetching stats:", error);
        return null;
    }
}

// Function to process and filter data (if needed)
function processData(userData) {
    // Currently, no additional processing is required
    return userData;
}

// Function to check and update stats based on score
async function checkAndUpdateStats() {
    const currentScore = getCurrentScore();

    if (currentScore === 0 && !hasScoreReset) {
        const userData = await fetchAllStats();
        if (userData) {
            const processedData = processData(userData);
            const last12HoursStats = getPeriodStats(processedData, HOURS_TO_FILTER * 60 * 60 * 1000, GAME_MODE_STANDARD);
            const last30DaysStats = getPeriodStats(processedData, DAYS_TO_FILTER * 24 * 60 * 60 * 1000, GAME_MODE_STANDARD);
            const last365DaysStats = getPeriodStats(processedData, LONG_TERM_DAYS * 24 * 60 * 60 * 1000, GAME_MODE_STANDARD);
            updateOverlay(last12HoursStats, last30DaysStats, last365DaysStats);
            hasScoreReset = true;
        }
    } else if (currentScore > 0) {
        hasScoreReset = false;
    }

    lastScore = currentScore;
}

// Initial setup to start checking for changes
setInterval(checkAndUpdateStats, 2000); // Check every 2 seconds if there's a change
