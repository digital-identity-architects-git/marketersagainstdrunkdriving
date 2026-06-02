export const CAMPAIGN_HASHTAG = '#marketersagainstdrunkdriving';
export function spin(template) {
    const groupPattern = /\{([^{}]*)\}/;
    let output = template;
    let guard = 0;
    while (groupPattern.test(output)) {
        output = output.replace(groupPattern, (_match, body) => {
            const options = body.split('|');
            return options[Math.floor(Math.random() * options.length)];
        });
        if (guard++ > 1000)
            break;
    }
    return output.replace(/\s+/g, ' ').trim();
}
const DESCRIPTION_TEMPLATES = [
    '{Every day|Each day|Right now}, {impaired driving|drunk driving|driving under the influence} {takes lives|shatters families|changes everything}. {We refuse to stay silent.|We are speaking up.|We won\'t look away.}',
    '{Buzzed driving is drunk driving.|One drink too many can end a life.|No text, no drink, no excuse.} {Plan ahead|Call a ride|Hand over the keys} and {get home safe|protect the people you love|keep your community safe}.',
    '{Marketers are creative people|We build campaigns for a living|We move people with words} — {so we\'re aiming that talent at|so we\'re pointing our skills toward|so we\'re using our reach for} {a cause that matters|saving lives|ending drunk driving}.',
    '{Behind every statistic is a name.|Every crash is preventable.|These numbers are real people.} {Help us turn awareness into action.|Share the message.|Be the reason someone gets home tonight.}',
    '{Sober driver = hero.|A designated driver is a lifesaver.|The safest ride is a sober one.} {Tag the friend who always drives|Be that person tonight|Make the responsible call} and {spread the word|help us reach more people|keep the momentum going}.',
    '{We track drunk driving news across all 50 states|We listen to incidents nationwide|We watch the headlines so you don\'t have to} {to keep this issue front and center|to keep the conversation alive|to remind everyone what\'s at stake}.',
];
const HASHTAG_TEMPLATES = [
    '{#DontDrinkAndDrive|#DriveSober|#SoberDriving}',
    '{#RoadSafety|#SafeRoads|#DriveSafe}',
    '{#DUIAwareness|#StopDUI|#EndDrunkDriving}',
    '{#DesignatedDriver|#PlanAheadForYourRide|#ArriveAlive}',
    '{#PreventDrunkDriving|#ThinkBeforeYouDrink|#BuzzedDrivingIsDrunkDriving}',
];
const PLATFORMS = ['twitter', 'instagram', 'facebook', 'tiktok', 'linkedin'];
function uniqueSpins(templates, count) {
    const results = new Set();
    let guard = 0;
    while (results.size < count && guard < count * 20) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        results.add(spin(template));
        guard++;
    }
    return Array.from(results);
}
export function generateDailySocialPosts() {
    const now = new Date();
    return PLATFORMS.map((platform) => {
        const description = spin(DESCRIPTION_TEMPLATES[Math.floor(Math.random() * DESCRIPTION_TEMPLATES.length)]);
        const hashtagCount = platform === 'twitter' ? 2 : 3;
        const spunHashtags = uniqueSpins(HASHTAG_TEMPLATES, hashtagCount);
        const hashtags = [...spunHashtags, CAMPAIGN_HASHTAG];
        const text = `${description} ${hashtags.join(' ')}`.trim();
        return {
            platform,
            description,
            hashtags,
            text,
            generatedAt: now,
        };
    });
}
//# sourceMappingURL=spintaxService.js.map