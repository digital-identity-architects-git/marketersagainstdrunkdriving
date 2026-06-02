import { generateAndStoreDailyPosts } from '../services/dailySocialService.js';
export function startDailySocialScheduler() {
    const runSafely = async () => {
        try {
            await generateAndStoreDailyPosts();
        }
        catch (error) {
            console.warn('⚠️  Daily social generation skipped:', error.message);
        }
    };
    setTimeout(runSafely, 5000);
    setInterval(runSafely, 24 * 60 * 60 * 1000);
    console.log('✓ Daily spintax social scheduler started');
}
//# sourceMappingURL=dailySocialScheduler.js.map