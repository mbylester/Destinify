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

out([
    'ok'     => true,
    'count'  => count($rows),
    'raw'    => implode("\n", $raw),
    'det'    => implode("\n", $det),
    'ids'    => $ids,
    'hidden' => $hidden,
    'tiktok' => $tiktok,
]);
