/**
 * StatsOverlay class handles UI creation, CSS injection, and updating the stats overlay.
 */
class StatsOverlay {
    /**
     * Creates a new StatsOverlay instance and initializes the UI.
     */
    constructor() {
      this.DAYS_TO_FILTER = 30;
      this.LONG_TERM_DAYS = 365;
      this.injectCSS();
      this.render();
    }
  
    /**
     * Injects the necessary CSS styles for the overlay.
     */
    injectCSS() {
      const css = `
  #stats-overlay {
      position: fixed;
      bottom: 32px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 8px;
      z-index: 1000;
      font-family: Arial, sans-serif;
      pointer-events: none;
  }
  #stats-overlay table {
      width: 100%;
      font-size: 12px;
      border-collapse: collapse;
  }
  #stats-overlay th, #stats-overlay td {
      border-right: 1px solid #fff;
      padding: 4px 8px;
      text-align: center;
  }
  #stats-overlay th:first-child, #stats-overlay td:first-child {
      text-align: right;
  }
  #stats-overlay th:last-child, #stats-overlay td:last-child {
      border-right: none;
  }
  #stats-overlay .footer-text {
      font-size: 9px;
      opacity: 0.8;
      margin-top: 5px;
      text-align: right;
  }
      `;
      const style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = css;
      document.head.appendChild(style);
    }
  
    /**
     * Renders the overlay HTML into the document.
     */
    render() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'stats-overlay';
      this.overlay.innerHTML = `
      <table>
          <thead>
              <tr>
                  <th>Metric</th>
                  <th>Session</th>
                  <th>Last ${this.DAYS_TO_FILTER} Days</th>
                  <th>Last ${this.LONG_TERM_DAYS} Days</th>
              </tr>
          </thead>
          <tbody>
              <tr><td>Total Kills:</td><td><span id="display-kills">0</span></td><td><span id="display-kills-${this.DAYS_TO_FILTER}">0</span></td><td><span id="display-kills-${this.LONG_TERM_DAYS}">0</span></td></tr>
              <tr><td>Kills Per Round:</td><td><span id="display-kpr">0</span></td><td><span id="display-kpr-${this.DAYS_TO_FILTER}">0</span></td><td><span id="display-kpr-${this.LONG_TERM_DAYS}">0</span></td></tr>
              <tr><td>Kills Per Death:</td><td><span id="display-kpd">0</span></td><td><span id="display-kpd-${this.DAYS_TO_FILTER}">0</span></td><td><span id="display-kpd-${this.LONG_TERM_DAYS}">0</span></td></tr>
              <tr><td>Rounds Per Death:</td><td><span id="display-dpr">0</span></td><td><span id="display-dpr-${this.DAYS_TO_FILTER}">0</span></td><td><span id="display-dpr-${this.LONG_TERM_DAYS}">0</span></td></tr>
              <tr><td>Rounds Won / Rounds Played:</td><td><span id="display-rounds-played">0</span></td><td><span id="display-rounds-played-${this.DAYS_TO_FILTER}">0</span></td><td><span id="display-rounds-played-${this.LONG_TERM_DAYS}">0</span></td></tr>
              <tr><td>Win Rate (%):</td><td><span id="display-win-rate">0</span></td><td><span id="display-win-rate-${this.DAYS_TO_FILTER}">0</span></td><td><span id="display-win-rate-${this.LONG_TERM_DAYS}">0</span></td></tr>
          </tbody>
      </table>
      <div class="footer-text">
          (Stats update at the end of each round) | Previous Round Kills: <span id="previous-round-kills">0</span>
      </div>
      `;
      document.body.appendChild(this.overlay);
    }
  
    /**
     * Updates the overlay with the provided statistics.
     * @param {Object} sessionStats - Stats for the current session.
     * @param {Object} lastDayStats - Stats for the last period (e.g., 30 days).
     * @param {Object} longTermStats - Stats for the long term (e.g., 365 days).
     */
    update(sessionStats, lastDayStats, longTermStats) {
      document.getElementById('display-kills').textContent = sessionStats.totalKills;
      document.getElementById('display-kpr').textContent = sessionStats.killsPerRound;
      document.getElementById('display-kpd').textContent = sessionStats.killsPerDeath;
      document.getElementById('display-dpr').textContent = sessionStats.roundsPerDeath;
      document.getElementById('display-rounds-played').textContent = `${sessionStats.totalRoundsWon} / ${sessionStats.totalRoundsPlayed}`;
      document.getElementById('display-win-rate').textContent = sessionStats.winRate;
  
      document.getElementById(`display-kills-${this.DAYS_TO_FILTER}`).textContent = lastDayStats.totalKills;
      document.getElementById(`display-kpr-${this.DAYS_TO_FILTER}`).textContent = lastDayStats.killsPerRound;
      document.getElementById(`display-kpd-${this.DAYS_TO_FILTER}`).textContent = lastDayStats.killsPerDeath;
      document.getElementById(`display-dpr-${this.DAYS_TO_FILTER}`).textContent = lastDayStats.roundsPerDeath;
      document.getElementById(`display-rounds-played-${this.DAYS_TO_FILTER}`).textContent = `${lastDayStats.totalRoundsWon} / ${lastDayStats.totalRoundsPlayed}`;
      document.getElementById(`display-win-rate-${this.DAYS_TO_FILTER}`).textContent = lastDayStats.winRate;
  
      document.getElementById(`display-kills-${this.LONG_TERM_DAYS}`).textContent = longTermStats.totalKills;
      document.getElementById(`display-kpr-${this.LONG_TERM_DAYS}`).textContent = longTermStats.killsPerRound;
      document.getElementById(`display-kpd-${this.LONG_TERM_DAYS}`).textContent = longTermStats.killsPerDeath;
      document.getElementById(`display-dpr-${this.LONG_TERM_DAYS}`).textContent = longTermStats.roundsPerDeath;
      document.getElementById(`display-rounds-played-${this.LONG_TERM_DAYS}`).textContent = `${longTermStats.totalRoundsWon} / ${longTermStats.totalRoundsPlayed}`;
      document.getElementById(`display-win-rate-${this.LONG_TERM_DAYS}`).textContent = longTermStats.winRate;
    }
  }
  
  /**
   * StatsAPI class handles fetching user data from the stats endpoint.
   */
  class StatsAPI {
    /**
     * Creates a new StatsAPI instance.
     * @param {string} sessionId - The session ID stored locally.
     */
    constructor(sessionId) {
      this.endpoint = `https://s.defly.io/mystats?s=${sessionId}`;
    }
  
    /**
     * Fetches user stats data from the endpoint.
     * @returns {Promise<Object[]>} A promise that resolves to the user data array.
     */
    fetchData() {
      return fetch(this.endpoint)
        .then(response => {
          if (!response.ok) {
            console.error("Failed to fetch data, status:", response.status);
            throw new Error("Network error");
          }
          return response.text();
        })
        .then(text => JSON.parse(text.split("\n")[0]))
        .catch(error => {
          console.error("Fetch error:", error);
          throw error;
        });
    }
  }
  
  /**
   * StatsProcessor class handles processing and aggregating the raw stats data.
   */
  class StatsProcessor {
    /**
     * Processes raw user data to add fields like week, month, year, and rounds won.
     * @param {Object[]} data - Raw user data array.
     * @returns {Object[]} Processed data array.
     */
    processData(data) {
      return data.map(game => {
        const gameDate = new Date(game.start);
        game.weekNumber = this.getWeekNumber(gameDate);
        game.monthNumber = gameDate.getMonth() + 1;
        game.yearNumber = gameDate.getFullYear();
        game.rounds_won = Math.round(game.max_area * game.level);
        return game;
      });
    }
  
    /**
     * Calculates the ISO week number for a given date.
     * @param {Date} d - The date for which to calculate the week number.
     * @returns {number} The ISO week number.
     */
    getWeekNumber(d) {
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }
  
    /**
     * Filters current session stats based on total deaths from the DOM.
     * @param {Object[]} data - Processed user data array.
     * @returns {Object[]} Filtered session data array.
     */
    filterCurrentSessionStats(data) {
      const totalDeaths = parseInt(document.getElementById("bs-deaths").textContent, 10);
      if (totalDeaths === 0) return [];
      return data.slice(0, totalDeaths).reverse();
    }
  
    /**
     * Aggregates stats for the current session from filtered session data.
     * @param {Object[]} data - Filtered session data array.
     * @returns {Object} Aggregated stats for the current session.
     */
    aggregateSessionStats(data) {
      const totals = { previousKills: 0, previousRoundsPlayed: 0, totalRoundsWon: 0 };
      data.forEach(game => {
        totals.previousKills += game.player_kills;
        totals.previousRoundsPlayed += game.level;
        totals.totalRoundsWon += game.rounds_won;
      });
      totals.totalKills = totals.previousKills + parseInt(document.getElementById("bs-kills").textContent, 10);
      totals.totalDeaths = parseInt(document.getElementById("bs-deaths").textContent, 10);
      const roundsText = document.getElementById("bs-rounds-won").textContent;
      totals.totalRoundsPlayed = parseInt(roundsText.split('/')[1], 10);
      totals.totalRoundsWon = parseInt(roundsText.split('/')[0], 10);
      totals.killsPerRound = totals.totalRoundsPlayed ? (totals.totalKills / totals.totalRoundsPlayed).toFixed(2) : 0;
      totals.killsPerDeath = totals.totalDeaths ? (totals.totalKills / totals.totalDeaths).toFixed(2) : 0;
      totals.roundsPerDeath = totals.totalDeaths ? (totals.totalRoundsPlayed / totals.totalDeaths).toFixed(2) : 0;
      totals.winRate = totals.totalRoundsPlayed ? ((totals.totalRoundsWon / totals.totalRoundsPlayed) * 100).toFixed(2) : 0;
      return totals;
    }
  
    /**
     * Aggregates stats for a specified period (in days) for a given game mode.
     * @param {Object[]} data - Processed user data array.
     * @param {number} days - Number of days for the period.
     * @param {number} gameMode - The game mode to filter by.
     * @returns {Object} Aggregated stats for the specified period.
     */
    getLastPeriodStats(data, days, gameMode) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filtered = data.filter(game => {
        const gameDate = new Date(game.start);
        return !isNaN(gameDate.getTime()) && gameDate >= cutoff && game.game_mode === gameMode;
      });
      const agg = filtered.reduce(
        (acc, game) => {
          acc.totalKills += game.player_kills;
          acc.totalRoundsPlayed += game.level;
          acc.totalDeaths += game.kill_reason !== 0 ? 1 : 0;
          acc.totalRoundsWon += game.rounds_won;
          return acc;
        },
        { totalKills: 0, totalRoundsPlayed: 0, totalDeaths: 0, totalRoundsWon: 0 }
      );
      agg.killsPerRound = agg.totalRoundsPlayed ? (agg.totalKills / agg.totalRoundsPlayed).toFixed(2) : 0;
      agg.killsPerDeath = agg.totalDeaths ? (agg.totalKills / agg.totalDeaths).toFixed(2) : 0;
      agg.roundsPerDeath = agg.totalDeaths ? (agg.totalRoundsPlayed / agg.totalDeaths).toFixed(2) : 0;
      agg.winRate = agg.totalRoundsPlayed ? ((agg.totalRoundsWon / agg.totalRoundsPlayed) * 100).toFixed(2) : 0;
      return agg;
    }
  }
  
  /**
   * Main execution block that ties the overlay, API, and processor together.
   */
  (function() {
    const sessionId = window.localStorage["sessionId"];
    const overlay = new StatsOverlay();
    const api = new StatsAPI(sessionId);
    const processor = new StatsProcessor();
  
    let lastTotalRounds = 0;
    let previousSessionKills = 0;
  
    /**
     * Checks for changes in the game state and updates stats if a new round is detected.
     */
    function checkAndUpdateStats() {
        const roundsText = document.getElementById("bs-rounds-won").textContent;
        const currentTotalRounds = parseInt(roundsText.split('/')[1], 10);
    
        if (currentTotalRounds !== lastTotalRounds) {
            // Fetch the latest stats data, process it, and update the overlay
          api.fetchData().then(rawData => {
            // Process the raw data
            const processedData = processor.processData(rawData);
            // Filter the current session stats based on total deaths
            const sessionData = processor.filterCurrentSessionStats(processedData);
            // Aggregate session stats
            const sessionStats = processor.aggregateSessionStats(sessionData);
            // Calculate stats for the last 30 days
            const stats30 = processor.getLastPeriodStats(processedData, overlay.DAYS_TO_FILTER, 2);
            // Calculate stats for the last 365 days
            const stats365 = processor.getLastPeriodStats(processedData, overlay.LONG_TERM_DAYS, 2);

            // Calculate kills gained using the session's total kills computed internally.
            let killsGained = sessionStats.totalKills - previousSessionKills;
            // Update the previous round kills
            document.getElementById("previous-round-kills").textContent = killsGained;
            // Update the previous total kills
            previousSessionKills = sessionStats.totalKills;

            // Update the overlay with the new stats
            overlay.update(sessionStats, stats30, stats365);

            // Update the last total rounds for comparison
            lastTotalRounds = currentTotalRounds;
          }).catch(error => console.error(error));
        }
      }
    
      // Check for stat updates every 2 seconds.
      setInterval(checkAndUpdateStats, 2000);
    })();