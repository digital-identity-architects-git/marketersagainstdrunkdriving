import axios from 'axios';
import { pool } from '../db/connection.js';
const SERP_API_KEY = process.env.SERP_API_KEY;
const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
    'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
    'WI', 'WY',
];
export async function scanStateForIncidents(state) {
    try {
        const query = `drunk driving accident ${state} today`;
        const response = await axios.get('https://api.serper.dev/search', {
            params: {
                q: query,
                tbs: 'qdr:d',
            },
            headers: {
                'X-API-KEY': SERP_API_KEY,
                'Content-Type': 'application/json',
            },
        });
        const results = response.data.organic || [];
        const incidents = [];
        for (const result of results) {
            const incident = await parseIncident(result, state);
            if (incident) {
                incidents.push(incident);
            }
        }
        return incidents;
    }
    catch (error) {
        console.error(`Error scanning ${state}:`, error);
        return [];
    }
}
function parseIncident(result, state) {
    const snippet = result.snippet.toLowerCase();
    const deathMatch = snippet.match(/(\d+)\s*(?:killed|died|death)/);
    const injuryMatch = snippet.match(/(\d+)\s*(?:injured|hurt|injury)/);
    const deathCount = deathMatch ? parseInt(deathMatch[1], 10) : 0;
    const injuryCount = injuryMatch ? parseInt(injuryMatch[1], 10) : 0;
    let severity = 'incident';
    if (deathCount > 0)
        severity = 'fatality';
    else if (injuryCount >= 2)
        severity = 'serious-injury';
    else if (injuryCount > 0)
        severity = 'injury';
    return {
        state,
        title: result.title,
        description: result.snippet,
        sourceUrl: result.link,
        sourceOutlet: new URL(result.link).hostname,
        severity,
        deathCount,
        injuryCount,
        dateOccurred: new Date(),
        dateReported: new Date(),
        tags: ['news', 'drunk-driving', state.toLowerCase()],
    };
}
export async function saveIncidents(incidents) {
    try {
        for (const incident of incidents) {
            const client = await pool.connect();
            try {
                const existing = await client.query('SELECT id FROM incidents WHERE title = $1 AND state = $2 AND DATE(date_occurred) = DATE($3)', [incident.title, incident.state, incident.dateOccurred]);
                if (existing.rows.length === 0) {
                    await client.query(`INSERT INTO incidents 
            (state, location, title, description, severity, injury_count, death_count, 
             source_url, source_outlet, date_occurred, tags) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
                        incident.state,
                        incident.location || '',
                        incident.title,
                        incident.description,
                        incident.severity,
                        incident.injuryCount,
                        incident.deathCount,
                        incident.sourceUrl,
                        incident.sourceOutlet,
                        incident.dateOccurred,
                        incident.tags,
                    ]);
                    console.log(`✓ Saved: ${incident.title}`);
                }
            }
            finally {
                client.release();
            }
        }
    }
    catch (error) {
        console.error('Error saving incidents:', error);
    }
}
export async function getTopIncidentsToday(limit = 10) {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`SELECT * FROM incidents 
        WHERE DATE(date_reported) = CURRENT_DATE 
        ORDER BY 
          CASE severity 
            WHEN 'fatality' THEN 1 
            WHEN 'serious-injury' THEN 2 
            WHEN 'injury' THEN 3 
            ELSE 4 
          END,
          death_count DESC,
          injury_count DESC
        LIMIT $1`, [limit]);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching top incidents:', error);
        return [];
    }
}
export async function scanAllStates() {
    const results = new Map();
    console.log(`Scanning ${US_STATES.length} states for drunk driving incidents...`);
    const chunks = [];
    for (let i = 0; i < US_STATES.length; i += 5) {
        chunks.push(US_STATES.slice(i, i + 5));
    }
    for (const chunk of chunks) {
        const promises = chunk.map(async (state) => {
            const incidents = await scanStateForIncidents(state);
            return { state, incidents };
        });
        const chunkResults = await Promise.all(promises);
        for (const { state, incidents } of chunkResults) {
            results.set(state, incidents);
            await saveIncidents(incidents);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return results;
}
//# sourceMappingURL=newsService.js.map