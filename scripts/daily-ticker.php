<?php
/**
 * Daily drunk-driving ticker generator — PHP version.
 *
 * Functionally identical to scripts/daily-ticker.mjs, provided so it can run as
 * a plain SiteGround cron job on plans without Node.js (e.g. StartUp). It pulls
 * a city-scoped news RSS feed for each of 50 states, keeps the serious
 * drunk-driving crashes (fatal / near-fatal), ranks the worst 10, and writes
 * respectful state-level copy/paste share boxes to daily.json.
 *
 * Configure the output path below, then run from cron, e.g.:
 *   php /home/USER/www/YOURDOMAIN.com/private/daily-ticker.php
 *
 * No API keys, no database.
 */

// --- CONFIG -----------------------------------------------------------------
// Absolute path to where the site is served. Set this to your public_html/data
// folder. You can find the absolute path in SiteGround Site Tools → File
// Manager (it looks like /home/customer/www/yourdomain.com/public_html).
$OUT_FILE = getenv('TICKER_OUT_FILE')
    ?: (dirname(__DIR__) . '/data/daily.json'); // default: ../data next to the script
                                                // (so public_html/private/ -> public_html/data/daily.json)

$CAMPAIGN_HASHTAG = '#marketersagainstdrunkdriving';

// One major city per state.
$STATES = [
    ['AL', 'Alabama', 'Birmingham'], ['AK', 'Alaska', 'Anchorage'],
    ['AZ', 'Arizona', 'Phoenix'], ['AR', 'Arkansas', 'Little Rock'],
    ['CA', 'California', 'Los Angeles'], ['CO', 'Colorado', 'Denver'],
    ['CT', 'Connecticut', 'Bridgeport'], ['DE', 'Delaware', 'Wilmington'],
    ['FL', 'Florida', 'Miami'], ['GA', 'Georgia', 'Atlanta'],
    ['HI', 'Hawaii', 'Honolulu'], ['ID', 'Idaho', 'Boise'],
    ['IL', 'Illinois', 'Chicago'], ['IN', 'Indiana', 'Indianapolis'],
    ['IA', 'Iowa', 'Des Moines'], ['KS', 'Kansas', 'Wichita'],
    ['KY', 'Kentucky', 'Louisville'], ['LA', 'Louisiana', 'New Orleans'],
    ['ME', 'Maine', 'Portland'], ['MD', 'Maryland', 'Baltimore'],
    ['MA', 'Massachusetts', 'Boston'], ['MI', 'Michigan', 'Detroit'],
    ['MN', 'Minnesota', 'Minneapolis'], ['MS', 'Mississippi', 'Jackson'],
    ['MO', 'Missouri', 'Kansas City'], ['MT', 'Montana', 'Billings'],
    ['NE', 'Nebraska', 'Omaha'], ['NV', 'Nevada', 'Las Vegas'],
    ['NH', 'New Hampshire', 'Manchester'], ['NJ', 'New Jersey', 'Newark'],
    ['NM', 'New Mexico', 'Albuquerque'], ['NY', 'New York', 'New York City'],
    ['NC', 'North Carolina', 'Charlotte'], ['ND', 'North Dakota', 'Fargo'],
    ['OH', 'Ohio', 'Columbus'], ['OK', 'Oklahoma', 'Oklahoma City'],
    ['OR', 'Oregon', 'Portland'], ['PA', 'Pennsylvania', 'Philadelphia'],
    ['RI', 'Rhode Island', 'Providence'], ['SC', 'South Carolina', 'Charleston'],
    ['SD', 'South Dakota', 'Sioux Falls'], ['TN', 'Tennessee', 'Nashville'],
    ['TX', 'Texas', 'Houston'], ['UT', 'Utah', 'Salt Lake City'],
    ['VT', 'Vermont', 'Burlington'], ['VA', 'Virginia', 'Virginia Beach'],
    ['WA', 'Washington', 'Seattle'], ['WV', 'West Virginia', 'Charleston'],
    ['WI', 'Wisconsin', 'Milwaukee'], ['WY', 'Wyoming', 'Cheyenne'],
];

$UA = 'Mozilla/5.0 (compatible; MADDTickerBot/1.0; +https://marketersagainstdrunkdriving.com)';

// --- helpers ----------------------------------------------------------------
function feed_url($city, $name) {
    $q = '("drunk driving" OR DUI OR "impaired driving" OR "drunk driver") '
       . '(crash OR killed OR fatal OR dead OR collision OR injured) '
       . '("' . $city . '" OR "' . $name . '") when:2d';
    return 'https://news.google.com/rss/search?q=' . rawurlencode($q)
         . '&hl=en-US&gl=US&ceid=US:en';
}

function fetch_feed($url, $ua) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_USERAGENT      => $ua,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ($body && $code >= 200 && $code < 400) ? $body : '';
}

function clean_text($s) {
    $s = preg_replace('/<[^>]+>/', ' ', (string) $s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return trim(preg_replace('/\s+/', ' ', $s));
}

function spin($template) {
    $guard = 0;
    while (strpos($template, '{') !== false && $guard++ < 1000) {
        $template = preg_replace_callback('/\{([^{}]*)\}/', function ($m) {
            $opts = explode('|', $m[1]);
            return $opts[array_rand($opts)];
        }, $template, 1);
    }
    return trim(preg_replace('/\s+/', ' ', $template));
}

function parse_items($xml) {
    $items = [];
    if ($xml === '') return $items;
    libxml_use_internal_errors(true);
    $doc = simplexml_load_string($xml);
    if ($doc === false || !isset($doc->channel->item)) return $items;
    foreach ($doc->channel->item as $it) {
        $rawTitle = clean_text((string) $it->title);
        $outlet   = isset($it->source) ? clean_text((string) $it->source) : '';
        $title    = $rawTitle;
        $dash     = strrpos($rawTitle, ' - ');
        if ($dash !== false) {
            $title = trim(substr($rawTitle, 0, $dash));
            if ($outlet === '') $outlet = trim(substr($rawTitle, $dash + 3));
        }
        $items[] = [
            'title'  => $title,
            'link'   => clean_text((string) $it->link),
            'desc'   => clean_text((string) $it->description),
            'outlet' => $outlet,
        ];
    }
    return $items;
}

function death_count($text) {
    $t = strtolower($text);
    $words = ['one'=>1,'two'=>2,'three'=>3,'four'=>4,'five'=>5,'six'=>6,'seven'=>7,'eight'=>8,'nine'=>9];
    if (preg_match('/(\d+)\s+(?:people|persons?|victims?|teens?|men|women|adults?|kids?|children|killed|dead|dies|died)\D{0,18}(?:killed|dead|dies|died|fatal)/', $t, $m)) {
        return (int) $m[1];
    }
    if (preg_match('/\b(one|two|three|four|five|six|seven|eight|nine)\b\D{0,18}(?:killed|dead|died|dies)/', $t, $m)) {
        return $words[$m[1]] ?? 0;
    }
    if (preg_match('/\b(killed|dead|dies|died|fatal|claims? (?:a )?life|loses? (?:his|her|their) life)\b/', $t)) {
        return 1;
    }
    return 0;
}

function classify($item) {
    $text = $item['title'] . ' ' . $item['desc'];
    $alcohol = '/\b(dui|dwi|drunk[ -]?driv|impaired driv|intoxicat|drunk driver|alcohol|owi)\b/i';
    $crash   = '/\b(crash|collision|wreck|killed|dead|dies|died|death|fatal|injur|critical|hospitaliz|struck|pedestrian)\b/i';
    if (!preg_match($alcohol, $text) || !preg_match($crash, $text)) return null;
    $deaths  = death_count($text);
    $injured = (bool) preg_match('/\b(injur|critical|hospitaliz|hurt|wounded)\b/i', $text);
    if ($deaths > 0) {
        $item['severity'] = 'fatality';
        $item['severityLabel'] = $deaths > 1 ? "{$deaths} Killed" : 'Fatal';
        $item['rank'] = 1;
    } elseif ($injured) {
        $item['severity'] = 'serious-injury';
        $item['severityLabel'] = 'Serious Injury';
        $item['rank'] = 2;
    } else {
        return null; // keep only fatalities / near-death
    }
    $item['deaths'] = $deaths;
    return $item;
}

// Returns the un-spun spintax template ({a|b|c} groups intact) so the website
// can spin a fresh original variation in the browser on demand.
function share_template($name, $incident, $hashtag) {
    $intro = '{A drunk driving crash|An impaired-driving crash|A DUI crash|A drunk driver}';
    $when  = '{this week|in recent days|days ago}';
    if ($incident['deaths'] >= 2) {
        $outcome = '{claimed|took} ' . $incident['deaths'] . ' lives';
    } elseif ($incident['severity'] === 'fatality') {
        $outcome = '{claimed a life|ended a life|killed someone}';
    } else {
        $outcome = '{left someone fighting for their life|critically hurt someone|nearly killed someone}';
    }
    $truth = '{It was 100% preventable.|None of this had to happen.|This was preventable.}';
    $cta   = '{Plan a sober ride.|Hand over the keys.|Call a ride tonight.|Be the reason someone gets home.}';
    $tail  = '{Share this so the next one doesn\'t happen.|Pass it on.|Let it travel.}';
    return "$intro in $name $when $outcome. $truth $cta $tail $hashtag";
}

// --- main -------------------------------------------------------------------
echo 'Scanning ' . count($STATES) . " states for drunk-driving crashes...\n";
$found = [];

foreach ($STATES as $s) {
    list($code, $name, $city) = $s;
    $xml = fetch_feed(feed_url($city, $name), $UA);
    $items = [];
    foreach (parse_items($xml) as $it) {
        $c = classify($it);
        if ($c !== null) $items[] = $c;
    }
    usort($items, function ($a, $b) {
        return ($a['rank'] <=> $b['rank']) ?: ($b['deaths'] <=> $a['deaths']);
    });
    if (!empty($items)) {
        $found[] = ['code' => $code, 'name' => $name, 'city' => $city, 'incident' => $items[0]];
    }
    usleep(150000); // be polite to the source
}

usort($found, function ($a, $b) {
    return ($a['incident']['rank'] <=> $b['incident']['rank'])
        ?: ($b['incident']['deaths'] <=> $a['incident']['deaths']);
});
$top = array_slice($found, 0, 10);

$boxes = [];
foreach ($top as $f) {
    $inc = $f['incident'];
    $tpl = share_template($f['name'], $inc, $CAMPAIGN_HASHTAG);
    $boxes[] = [
        'state'           => $f['code'],
        'stateName'       => $f['name'],
        'city'            => $f['city'],
        'severity'        => $inc['severity'],
        'severityLabel'   => $inc['severityLabel'],
        'deaths'          => $inc['deaths'],
        'headline'        => $inc['title'],
        'sourceUrl'       => $inc['link'],
        'sourceOutlet'    => $inc['outlet'],
        'spintaxTemplate' => $tpl,
        'shareText'       => spin($tpl),
    ];
}

$payload = [
    'generatedAt'       => gmdate('c'),
    'statesScanned'     => count($STATES),
    'statesWithReports' => count($found),
    'count'             => count($boxes),
    'boxes'             => $boxes,
];

$dir = dirname($OUT_FILE);
if (!is_dir($dir)) mkdir($dir, 0755, true);
file_put_contents($OUT_FILE, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
echo 'Wrote ' . count($boxes) . ' share boxes (' . count($found) . " states had reports) -> $OUT_FILE\n";
