<?php
// Anonymous usage counts for the admin Overview. POST {kind:"view", destination_id} or {kind:"search", q}.
// Nothing about the visitor is stored: no account, no IP address, just the place or the search words and the time.
require __DIR__ . '/bootstrap.php';

need_post();
$b = body();
$kind = (string)($b['kind'] ?? '');

$ref = '';
if ($kind === 'view') {
    $id = (int)($b['destination_id'] ?? 0);
    if ($id < 1) {
        fail('Unknown destination.');
    }
    $e = db()->prepare('SELECT id FROM destinations WHERE id = ?');
    $e->execute([$id]);
    if (!$e->fetch()) {
        fail('Unknown destination.', 404);
    }
    $ref = (string)$id;
} elseif ($kind === 'search') {
    $q = mb_strtolower(trim(preg_replace('/\s+/u', ' ', str_replace(['<', '>'], '', (string)($b['q'] ?? '')))));
    if (mb_strlen($q) < 3 || mb_strlen($q) > 60) {
        out(['ok' => true]);   // too short or too long to be a useful search: ignore quietly
    }
    $ref = $q;
} else {
    fail('Unknown kind.');
}

$bucket = 'track:ip:' . client_ip();
throttle_check($bucket, 200, 3600);   // a single visitor cannot flood the counts
ensure_events();
db()->prepare('INSERT INTO site_events (kind, ref) VALUES (?, ?)')->execute([$kind, $ref]);
throttle_hit($bucket);
if (random_int(1, 200) === 1) {   // keep the table small: only the last 400 days are ever shown
    db()->exec('DELETE FROM site_events WHERE created_at < (NOW() - INTERVAL 400 DAY)');
}
out(['ok' => true]);
