import { generateAndStoreDailyPosts } from '../services/dailySocialService.js';

/**
 * Schedules the once-daily spintax social post generation.
 *
 * This is intentionally self-contained: it uses NO external APIs (pure
 * spintax) and only touches the app's own database. It runs once on startup
 * and then once every 24 hours. Failures are logged, never fatal.
 */
export function startDailySocialScheduler(): void {
  const runSafely = async () => {
    try {
      await generateAndStoreDailyPosts();
    } catch (error) {
      console.warn('⚠️  Daily social generation skipped:', (error as Error).message);
    }
  };

  // Generate an initial batch shortly after startup.
  setTimeout(runSafely, 5000);

  // Then regenerate every 24 hours so descriptions/hashtags stay fresh.
  setInterval(runSafely, 24 * 60 * 60 * 1000);

  console.log('✓ Daily spintax social scheduler started');
}
