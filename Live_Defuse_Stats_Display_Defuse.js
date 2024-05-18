/*
Version 1.2
*/

let lastTotalRounds = 0; // Global variable to store the last known total rounds
const DAYS_TO_FILTER = 30; // Days to filter for the last period stats
const GAME_MODE_DEFUSE = 2; // Defuse mode identifier
var stats_endpoint = `https://s.defly.io/mystats?s=${window.localStorage["sessionId"]}`;

// CSS for the stats overlay
const css = `
#stats-overlay {
    position: fixed;
    bottom: 32px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    border-radius: 8px;
    z-index: 1000; // High z-index to ensure it is on top
    font-family: Arial, sans-serif;
}

#stats-overlay table {
    width: 100%; // Ensures the table uses the full width of the overlay
    font-size: 10px; // Standard font size for the text
    text-align: left; // Align text to the left for the first column
}

#stats-overlay td:nth-child(2), #stats-overlay td:nth-child(3) {
    text-align: center; // Center align text for the second and third columns
}

#stats-overlay td {
    padding: 1px; // Adds padding to table cells for better readability
}

#stats-overlay .footer-text {
    font-size: 9px; // Slightly smaller font size for the footer text
    opacity: 0.8; // Make the footer text slightly less prominent
    margin-top: 5px; // Adds space above the footer text
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
        <tr>
            <td></td>
            <td>Session</td>
            <td>L${DAYS_TO_FILTER} D</td>
        </tr>
        <tr><td>Total Kills:</td><td><span id="display-kills">0</span></td><td><span id="display-kills-${DAYS_TO_FILTER}">0</span></td></tr>
        <tr><td>Kills Per Round (Session):</td><td><span id="display-kpr-session">0</span></td><td><span id="display-kpr-${DAYS_TO_FILTER}">0</span></td></tr>
        <tr><td>Kills Per Round (Current):</td><td><span id="display-kpr-current">0</span></td><td><span id="display-kpr-current-${DAYS_TO_FILTER}">0</span></td></tr>
        <tr><td>Kills Per Death:</td><td><span id="display-kpd">0</span></td><td><span id="display-kpd-${DAYS_TO_FILTER}">0</span></td></tr>
        <tr><td>Rounds Per Death:</td><td><span id="display-dpr">0</span></td><td><span id="display-dpr-${DAYS_TO_FILTER}">0</span></td></tr>
        <tr><td>Rounds Won / Rounds Played:</td><td><span id="display-rounds-played">0</span></td><td><span id="display-rounds-played-${DAYS_TO_FILTER}">0</span></td></tr>
        <tr><td>Win Rate (%):</td><td><span id="display-win-rate">0</span></td><td><span id="display-win-rate-${DAYS_TO_FILTER}">0</span></td></tr>
    </table>
    <div class="footer-text">(Stats update at the end of each round)</div>
`;
document.body.appendChild(overlay);

let previousKills = 0;
let previousRoundsPlayed = 0;

function updateOverlay(currentSessionStats, lastDayStats) {
    document.getElementById('display-kills').textContent = currentSessionStats.totalKills;
    document.getElementById(`display-kills-${DAYS_TO_FILTER}`).textContent = lastDayStats.totalKills;

    // Calculate total rounds played during the current session, including the current ongoing data
    const totalRoundsPlayedIncludingCurrent = currentSessionStats.totalRoundsPlayed;
    
    // Session stats including current
    const kprSessionIncludingCurrent = totalRoundsPlayedIncludingCurrent ? 
        (currentSessionStats.totalKills / totalRoundsPlayedIncludingCurrent).toFixed(2) : 0;
    document.getElementById('display-kpr-session').textContent = kprSessionIncludingCurrent;

    // Current period stats calculation based on differences from the last recorded
    const currentRoundsPlayed = totalRoundsPlayedIncludingCurrent - previousRoundsPlayed;
    const kprCurrent = currentRoundsPlayed ? 
        ((currentSessionStats.totalKills - previousKills) / currentRoundsPlayed).toFixed(2) : 0;
    document.getElementById('display-kpr-current').textContent = kprCurrent;

    const kprDays = lastDayStats.totalRoundsPlayed ? 
        (lastDayStats.totalKills / lastDayStats.totalRoundsPlayed).toFixed(2) : 0;
    document.getElementById(`display-kpr-${DAYS_TO_FILTER}`).textContent = kprDays;
    document.getElementById(`display-kpr-current-${DAYS_TO_FILTER}`).textContent = kprDays;

    // Other metrics update
    const kpdSession = currentSessionStats.totalDeaths ? 
        (currentSessionStats.totalKills / currentSessionStats.totalDeaths).toFixed(2) : 0;
    document.getElementById('display-kpd').textContent = kpdSession;
    const kpdDays = lastDayStats.totalDeaths ? 
        (lastDayStats.totalKills / lastDayStats.totalDeaths).toFixed(2) : 0;
    document.getElementById(`display-kpd-${DAYS_TO_FILTER}`).textContent = kpdDays;

    // Deaths Per Round calculation for the session
    const dprSession = (currentSessionStats.totalDeaths > 0) ? 
    (totalRoundsPlayedIncludingCurrent / currentSessionStats.totalDeaths).toFixed(2) : 0;
    document.getElementById('display-dpr').textContent = dprSession;

    // Deaths Per Round calculation for the last X days
    const dprDays = (lastDayStats.totalDeaths > 0) ? 
    (lastDayStats.totalRoundsPlayed / lastDayStats.totalDeaths).toFixed(2) : 0;
    document.getElementById(`display-dpr-${DAYS_TO_FILTER}`).textContent = dprDays;

    // Calculate and update rounds played/won
    const roundsPlayedTextSession = `${currentSessionStats.totalRoundsWon} / ${totalRoundsPlayedIncludingCurrent}`;
    document.getElementById('display-rounds-played').textContent = roundsPlayedTextSession;

    const roundsPlayedTextDays = `${lastDayStats.totalRoundsWon} / ${lastDayStats.totalRoundsPlayed}`;
    document.getElementById(`display-rounds-played-${DAYS_TO_FILTER}`).textContent = roundsPlayedTextDays;

    // Calculate and update win rates
    const winRateSession = totalRoundsPlayedIncludingCurrent ? 
        ((currentSessionStats.totalRoundsWon / totalRoundsPlayedIncludingCurrent) * 100).toFixed(2) : 0;
    document.getElementById('display-win-rate').textContent = winRateSession;

    const winRateDays = lastDayStats.totalRoundsPlayed ? 
        ((lastDayStats.totalRoundsWon / lastDayStats.totalRoundsPlayed) * 100).toFixed(2) : 0;
    document.getElementById(`display-win-rate-${DAYS_TO_FILTER}`).textContent = winRateDays;

    // Update previous session data for the next update
    previousKills = currentSessionStats.totalKills;
    previousRoundsPlayed = totalRoundsPlayedIncludingCurrent;
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
            updateOverlay(currentSessionTotals, last30DaysStats);
            lastTotalRounds = currentTotalRounds;
        });
    }
}

// Initial setup to start checking for changes
setInterval(checkAndUpdateStats, 2000);  // Check every 2 seconds if there's a change
