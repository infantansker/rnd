// src/services/statsScheduler.js
// Service to schedule periodic updates of user statistics

import eventStatsUpdater from './eventStatsUpdater';

class StatsScheduler {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
<<<<<<< HEAD
    this.isUpdating = false; // Track if an update is currently running
=======
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
  }

  /**
   * Start the scheduler to update stats periodically
   * @param {number} intervalMinutes - How often to run the update (in minutes)
   */
  start(intervalMinutes = 60) {
    if (this.isActive) {
      console.log('Stats scheduler is already running');
      return;
    }

    console.log(`Starting stats scheduler with ${intervalMinutes} minute interval`);
    
<<<<<<< HEAD
    // Run immediately on start but with a delay to avoid blocking initial render
    setTimeout(() => {
      this.runUpdate();
    }, 5000); // 5 second delay before first run
    
    // Set up interval for periodic updates with a more reasonable frequency
    this.intervalId = setInterval(() => {
      this.runUpdate();
    }, Math.max(intervalMinutes, 30) * 60 * 1000); // Minimum 30 minutes, convert to milliseconds
=======
    // Run immediately on start
    this.runUpdate();
    
    // Set up interval for periodic updates
    this.intervalId = setInterval(() => {
      this.runUpdate();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
    
    this.isActive = true;
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isActive = false;
      console.log('Stats scheduler stopped');
    }
  }

  /**
   * Run the stats update process
   */
  async runUpdate() {
<<<<<<< HEAD
    // Prevent multiple simultaneous updates
    if (this.isUpdating) {
      console.log('Stats update already in progress, skipping this run');
      return;
    }

    try {
      this.isUpdating = true;
      console.log('Running scheduled stats update...');
      // Add timeout to the update process
      await Promise.race([
        eventStatsUpdater.updateCompletedEventStats(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stats update timed out after 60 seconds')), 60000)
        )
      ]);
      console.log('Scheduled stats update completed');
    } catch (error) {
      console.error('Error in scheduled stats update:', error);
    } finally {
      this.isUpdating = false;
=======
    try {
      console.log('Running scheduled stats update...');
      await eventStatsUpdater.updateCompletedEventStats();
      console.log('Scheduled stats update completed');
    } catch (error) {
      console.error('Error in scheduled stats update:', error);
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
    }
  }

  /**
   * Check if the scheduler is active
   * @returns {boolean} Whether the scheduler is active
   */
  isRunning() {
    return this.isActive;
  }
}

// Export singleton instance
const statsScheduler = new StatsScheduler();
export default statsScheduler;