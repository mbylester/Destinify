<?php
// GET: every destination, in the same pipe-separated text format the site already reads from data.js and details.js.
require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    fail('GET required', 405);
}

$rows = db()->query('SELECT * FROM destinations ORDER BY id')->fetchAll();
$clean = function ($s): string {
    return str_replace(['|', "\r", "\n"], ['/', ' ', ' '], (string)$s);
};

$raw = [];
$det = [];
$ids = [];
$hidden = [];
$tiktok = [];
foreach ($rows as $r) {
    $fields = [
        $r['name'], $r['province'], $r['region_group'], $r['lat'], $r['lng'], $r['type'],
        $r['budget_php'], $r['days'], str_replace(',', ' ', (string)$r['activities']), $r['popular'],
        $r['best_start'] . '-' . $r['best_end'],
    ];
    $raw[] = implode('|', array_map($clean, $fields));
    $det[] = implode('|', array_map($clean, [$r['name'], $r['description'], $r['getting_there'], $r['tip']]));
    $ids[] = (int)$r['id'];
    if ((int)$r['hidden'] === 1) {
        $hidden[] = $r['name'];
    }
    if ((int)$r['tiktok'] === 1) {
        $tiktok[] = $r['name'];
    }
}

// Site settings the public pages need: the feedback email (the admin console setting wins over config.php) and the
// editable site content (travel tips, festivals, headings). Missing table or empty values simply mean "use the defaults".
$contact = trim((string)(setting_get('contact_email') ?? ''));
if ($contact === '' && !empty($CFG['contact_email'])) {
    $contact = trim((string)$CFG['contact_email']);
}
$content = setting_get('content');
$content = ($content !== null && $content !== '') ? json_decode($content, true, 12) : null;

out([
    'ok'     => true,
    'site'   => ['contact' => $contact, 'content' => is_array($content) ? $content : new stdClass()],
    'count'  => count($rows),
    'raw'    => implode("\n", $raw),
    'det'    => implode("\n", $det),
    'ids'    => $ids,
    'hidden' => $hidden,
    'tiktok' => $tiktok,
]);
