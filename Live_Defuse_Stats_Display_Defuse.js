/*
Version 1.5
*/

let lastTotalRounds = 0; // Global variable to store the last known total rounds
const DAYS_TO_FILTER = 30; // Days to filter for the last period stats
const LONG_TERM_DAYS = 365; // Long term stats identifier
const GAME_MODE_DEFUSE = 2; // Defuse mode identifier
var stats_endpoint = `https://s.defly.io/mystats?s=${window.localStorage["sessionId"]}`;

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
    text-align: left; /* Left align the first column */
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

// Create style element and append to head
const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

// Ensure the overlay HTML is added after the style to apply CSS correctly
const overlay = document.createElement('div');
overlay.id = 'stats-overlay';
overlay.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Session</th>
                <th>Last ${DAYS_TO_FILTER} Days</th>
                <th>Last ${LONG_TERM_DAYS} Days</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Total Kills:</td><td><span id="display-kills">0</span></td><td><span id="display-kills-${DAYS_TO_FILTER}">0</span></td><td><span id="display-kills-${LONG_TERM_DAYS}">0</span></td></tr>
            <tr><td>Kills Per Round:</td><td><span id="display-kpr">0</span></td><td><span id="display-kpr-${DAYS_TO_FILTER}">0</span></td><td><span id="display-kpr-${LONG_TERM_DAYS}">0</span></td></tr>
            <tr><td>Kills Per Death:</td><td><span id="display-kpd">0</span></td><td><span id="display-kpd-${DAYS_TO_FILTER}">0</span></td><td><span id="display-kpd-${LONG_TERM_DAYS}">0</span></td></tr>
            <tr><td>Rounds Per Death:</td><td><span id="display-dpr">0</span></td><td><span id="display-dpr-${DAYS_TO_FILTER}">0</span></td><td><span id="display-dpr-${LONG_TERM_DAYS}">0</span></td></tr>
            <tr><td>Rounds Won / Rounds Played:</td><td><span id="display-rounds-played">0</span></td><td><span id="display-rounds-played-${DAYS_TO_FILTER}">0</span></td><td><span id="display-rounds-played-${LONG_TERM_DAYS}">0</span></td></tr>
            <tr><td>Win Rate (%):</td><td><span id="display-win-rate">0</span></td><td><span id="display-win-rate-${DAYS_TO_FILTER}">0</span></td><td><span id="display-win-rate-${LONG_TERM_DAYS}">0</span></td></tr>
        </tbody>
    </table>
    <div class="footer-text">(Stats update at the end of each round)</div>
`;
document.body.appendChild(overlay);

let previousKills = 0;
let previousRoundsPlayed = 0;
let previousDeaths = 0;

function updateOverlay(currentSessionStats, lastDayStats, longTermStats) {
    const inGameKills = parseInt(document.getElementById("bs-kills").textContent);
    const inGameRoundsPlayed = parseInt(document.getElementById("bs-rounds-won").textContent.split('/')[1]);

    // Calculate current kills and rounds played
    const currentKills = inGameKills - previousKills;
    const currentRoundsPlayed = inGameRoundsPlayed - previousRoundsPlayed;

    // Update Session Stats
    document.getElementById('display-kills').textContent = currentSessionStats.totalKills;
    document.getElementById('display-kpr').textContent = currentSessionStats.killsPerRound;
    document.getElementById('display-kpd').textContent = currentSessionStats.killsPerDeath;
    document.getElementById('display-dpr').textContent = currentSessionStats.roundsPerDeath;
    document.getElementById('display-rounds-played').textContent = `${currentSessionStats.totalRoundsWon} / ${currentSessionStats.totalRoundsPlayed}`;
    document.getElementById('display-win-rate').textContent = currentSessionStats.winRate;

    // Update Last 30 Days Stats
    document.getElementById(`display-kills-${DAYS_TO_FILTER}`).textContent = lastDayStats.totalKills;
    document.getElementById(`display-kpr-${DAYS_TO_FILTER}`).textContent = lastDayStats.killsPerRound;
    document.getElementById(`display-kpd-${DAYS_TO_FILTER}`).textContent = lastDayStats.killsPerDeath;
    document.getElementById(`display-dpr-${DAYS_TO_FILTER}`).textContent = lastDayStats.roundsPerDeath;
    document.getElementById(`display-rounds-played-${DAYS_TO_FILTER}`).textContent = `${lastDayStats.totalRoundsWon} / ${lastDayStats.totalRoundsPlayed}`;
    document.getElementById(`display-win-rate-${DAYS_TO_FILTER}`).textContent = lastDayStats.winRate;

    // Update Last 365 Days Stats
    document.getElementById(`display-kills-${LONG_TERM_DAYS}`).textContent = longTermStats.totalKills;
    document.getElementById(`display-kpr-${LONG_TERM_DAYS}`).textContent = longTermStats.killsPerRound;
    document.getElementById(`display-kpd-${LONG_TERM_DAYS}`).textContent = longTermStats.killsPerDeath;
    document.getElementById(`display-dpr-${LONG_TERM_DAYS}`).textContent = longTermStats.roundsPerDeath;
    document.getElementById(`display-rounds-played-${LONG_TERM_DAYS}`).textContent = `${longTermStats.totalRoundsWon} / ${longTermStats.totalRoundsPlayed}`;
    document.getElementById(`display-win-rate-${LONG_TERM_DAYS}`).textContent = longTermStats.winRate;

    // Only update previous values if you have died
    if (inGameKills === 0 && inGameRoundsPlayed === 0) {
        previousKills = 0;
        previousRoundsPlayed = 0;
        previousDeaths = currentSessionStats.totalDeaths;
    }
}

// Function to get statistics from the last 'n' days for a specific game mode
function getLastPeriodStats(user_data, days, gameMode) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);  // Calculate the cutoff date based on 'days' parameter

    // Filter data to include only games within the last 'n' days and of the specified game mode
    const filteredData = user_data.filter(game => {
        const gameDate = new Date(game.start);
        // Ensure the date is valid and the game mode matches before including the game
        return !isNaN(gameDate.getTime()) && gameDate >= cutoffDate && game.game_mode === gameMode;
    });

    // Aggregate the data to sum kills, rounds played, deaths, and rounds won
    const aggregatedStats = filteredData.reduce((acc, game) => {
        acc.totalKills += game.player_kills;
        acc.totalRoundsPlayed += game.level;
        acc.totalDeaths += (game.kill_reason !== 0) ? 1 : 0;  // Count only non-disconnect deaths
        acc.totalRoundsWon += game.rounds_won;  // Use the newly calculated rounds_won field
        return acc;
    }, { totalKills: 0, totalRoundsPlayed: 0, totalDeaths: 0, totalRoundsWon: 0 });

    // Calculate derived statistics
    aggregatedStats.killsPerRound = aggregatedStats.totalRoundsPlayed ? 
        (aggregatedStats.totalKills / aggregatedStats.totalRoundsPlayed).toFixed(2) : 0;
    aggregatedStats.killsPerDeath = aggregatedStats.totalDeaths ? 
        (aggregatedStats.totalKills / aggregatedStats.totalDeaths).toFixed(2) : 0;
    aggregatedStats.roundsPerDeath = aggregatedStats.totalDeaths ? 
        (aggregatedStats.totalRoundsPlayed / aggregatedStats.totalDeaths).toFixed(2) : 0;
    aggregatedStats.winRate = aggregatedStats.totalRoundsPlayed ? 
        ((aggregatedStats.totalRoundsWon / aggregatedStats.totalRoundsPlayed) * 100).toFixed(2) : 0;

    return aggregatedStats;
}

// Fetch All Stats
function fetchAllStats(callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var user_data = JSON.parse(this.responseText.split("\n")[0]);
            callback(user_data);
        } else if (this.readyState == 4) {
            console.log("Failed to fetch data, status:", this.status); // Log failure to fetch data
        }
    };
    xmlhttp.open("GET", stats_endpoint, true);
    xmlhttp.send();
}

// Process Data (Adding Week, Month, Year)
function processData(user_data) {
    return user_data.map(game => {
        const gameDate = new Date(game.start);
        game.weekNumber = getWeekNumber(gameDate);
        game.monthNumber = gameDate.getMonth() + 1;  // +1 because getMonth() returns 0-11
        game.yearNumber = gameDate.getFullYear();

        // Calculate rounds won for each record
        game.rounds_won = Math.round(game.max_area * game.level);
        
        return game;
    });
}

// Helper function to get the ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
}

// Function to select the last 'n' stats records based on current total deaths
function filterCurrentSessionStats(user_data) {
    const totalDeaths = parseInt(document.getElementById("bs-deaths").textContent);
    if (totalDeaths === 0) {
        return [];
    }
    const selectedRecords = user_data.slice(0, totalDeaths); // Get the first 'totalDeaths' records from the reversed array
    return selectedRecords.reverse(); // Reverse again to maintain original newest-to-oldest order for processing
}

// Aggregate current session stats
function aggregateCurrentSessionStats(user_data) {
    const totals = {
        previousKills: 0,
        previousRoundsPlayed: 0,
        totalDeaths: 0,  // This will be replaced by the in-game deaths
        totalRoundsWon: 0
    };

    user_data.forEach(game => {
        totals.previousKills += game.player_kills; // Assuming player_kills are kills made by the player
        totals.previousRoundsPlayed += game.level; // Assuming 'level' is the number of rounds played
        totals.totalRoundsWon += game.rounds_won; // Use the calculated rounds won
    });

    // Adding in-game stats
    totals.totalKills = totals.previousKills + parseInt(document.getElementById("bs-kills").textContent);
    totals.totalDeaths = parseInt(document.getElementById("bs-deaths").textContent);
    const roundsWonText = document.getElementById("bs-rounds-won").textContent;
    totals.totalRoundsPlayed = parseInt(roundsWonText.split('/')[1]); // Assuming '2/2' format where second number is total rounds played
    totals.totalRoundsWon = parseInt(roundsWonText.split('/')[0]); // Assuming '2/2' format where first number is total rounds won

    // Calculate derived statistics
    totals.killsPerRound = totals.totalRoundsPlayed ? 
        (totals.totalKills / totals.totalRoundsPlayed).toFixed(2) : 0;
    totals.killsPerDeath = totals.totalDeaths ? 
        (totals.totalKills / totals.totalDeaths).toFixed(2) : 0;
    totals.roundsPerDeath = totals.totalDeaths ? 
        (totals.totalRoundsPlayed / totals.totalDeaths).toFixed(2) : 0;
    totals.winRate = totals.totalRoundsPlayed ? 
        ((totals.totalRoundsWon / totals.totalRoundsPlayed) * 100).toFixed(2) : 0;

    return totals;
}

// Function to check and update stats only if Total Rounds Played has changed
function checkAndUpdateStats() {
    const currentTotalRounds = parseInt(document.getElementById("bs-rounds-won").textContent.split('/')[1]);

    if (currentTotalRounds !== lastTotalRounds) {
        fetchAllStats(function(user_data) {
            const processedData = processData(user_data);
            const currentSessionData = filterCurrentSessionStats(processedData);
            const currentSessionTotals = aggregateCurrentSessionStats(currentSessionData);
            const last30DaysStats = getLastPeriodStats(processedData, DAYS_TO_FILTER, GAME_MODE_DEFUSE);
            const last365DaysStats = getLastPeriodStats(processedData, LONG_TERM_DAYS, GAME_MODE_DEFUSE);
            updateOverlay(currentSessionTotals, last30DaysStats, last365DaysStats);
            lastTotalRounds = currentTotalRounds;
        });
    }
}

// Initial setup to start checking for changes
setInterval(checkAndUpdateStats, 2000);  // Check every 2 seconds if there's a change
