import { scanAllStates, getTopIncidentsToday } from '../services/newsService.js';
import { generateDailyBlog } from '../services/blogService.js';
import { pool } from '../db/connection.js';
export async function runDailyListeners() {
    try {
        console.log('\n📡 DAILY LISTENER CYCLE STARTING...');
        console.log(`⏰ ${new Date().toLocaleString()}\n`);
        const stateIncidents = await scanAllStates();
        let totalIncidents = 0;
        let totalDeaths = 0;
        stateIncidents.forEach((incidents) => {
            totalIncidents += incidents.length;
            totalDeaths += incidents.reduce((sum, inc) => sum + inc.deathCount, 0);
        });
        console.log(`\n📊 SCAN RESULTS:`);
        console.log(`   Total incidents found: ${totalIncidents}`);
        console.log(`   Total deaths: ${totalDeaths}`);
        const topIncidents = await getTopIncidentsToday(10);
        if (topIncidents.length > 0) {
            console.log(`\n✍️  Generating daily blog...`);
            const blog = await generateDailyBlog(topIncidents);
            const client = await pool.connect();
            try {
                await client.query(`INSERT INTO blogs (title, content, word_count, date_published, related_incidents, 
                    cultural_references, hashtags, social_media_posts)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                    blog.title,
                    blog.content,
                    blog.wordCount,
                    blog.datePublished,
                    blog.relatedIncidents,
                    blog.culturalReferences,
                    blog.hashtags,
                    blog.socialMediaPosts,
                ]);
                console.log(`✓ Blog published: ${blog.wordCount} words`);
                console.log(`✓ Social media posts: ${blog.socialMediaPosts.length}`);
            }
            finally {
                client.release();
            }
        }
        console.log(`\n✓ Daily cycle complete!\n`);
    }
    catch (error) {
        console.error('✗ Daily listener cycle failed:', error);
    }
}
runDailyListeners();
const scheduleDaily = () => {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(6, 0, 0, 0);
    if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
    }
    const timeUntilTarget = targetTime.getTime() - now.getTime();
    setTimeout(() => {
        runDailyListeners();
        setInterval(runDailyListeners, 24 * 60 * 60 * 1000);
    }, timeUntilTarget);
};
scheduleDaily();
//# sourceMappingURL=orchestrator.js.map