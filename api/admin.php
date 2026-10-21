<?php
// Admin only. GET returns counts. POST action=add creates a destination, action=hide hides or restores one.
require __DIR__ . '/bootstrap.php';

$u = need_admin();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $p = db();
    out([
        'ok'           => true,
        'destinations' => (int)$p->query('SELECT COUNT(*) FROM destinations')->fetchColumn(),
        'hidden'       => (int)$p->query('SELECT COUNT(*) FROM destinations WHERE hidden = 1')->fetchColumn(),
        'users'        => (int)$p->query('SELECT COUNT(*) FROM users')->fetchColumn(),
        'reviews'      => (int)$p->query('SELECT COUNT(*) FROM reviews')->fetchColumn(),
    ]);
}

need_post();
$b = body();
$action = (string)($b['action'] ?? '');

if ($action === 'add') {
    $types = ['Beach', 'Island', 'Mountain', 'Waterfall', 'Heritage', 'City', 'Diving', 'Surf', 'Cave', 'Lake', 'Nature', 'Adventure'];
    $codes = ['sw', 'sn', 'dv', 'hk', 'sf', 'ih', 'ss', 'cm', 'fd', 'cv', 'kc', 'cw', 'wl', 'cy', 'ad', 'ph', 'rl', 'bk'];
    $map = require __DIR__ . '/regions_map.php';

    $name = trim((string)($b['name'] ?? ''));
    $prov = trim((string)($b['province'] ?? ''));
    $g = (string)($b['g'] ?? '');
    $lat = (float)($b['lat'] ?? 0);
    $lng = (float)($b['lng'] ?? 0);
    $type = (string)($b['type'] ?? '');
    $bud = (int)($b['budget'] ?? 0);
    $days = (int)($b['days'] ?? 0);
    $acts = array_values(array_intersect($codes, array_map('strval', (array)($b['activities'] ?? []))));
    $pop = !empty($b['popular']) ? 1 : 0;
    $desc = mb_substr(trim((string)($b['description'] ?? '')), 0, 500);

    if ($name === '' || mb_strlen($name) > 120) {
        fail('Enter a destination name (up to 120 characters).');
    }
    if (!isset($map[$prov])) {
        fail('Unknown province. Use the exact Philippine province name.');
    }
    if (!in_array($g, ['L', 'V', 'M'], true)) {
        fail('Choose an island group.');
    }
    if ($lat < 4 || $lat > 21.5 || $lng < 116 || $lng > 128) {
        fail('Coordinates must be inside the Philippines.');
    }
    if (!in_array($type, $types, true)) {
        fail('Choose a valid type.');
    }
    if ($bud < 1000 || $bud > 200000 || $days < 1 || $days > 30) {
        fail('Budget must be 1,000 to 200,000 and days 1 to 30.');
    }
    if (!$acts) {
        fail('Pick at least one activity.');
    }

    $pdo = db();
    $dup = $pdo->prepare('SELECT id FROM destinations WHERE LOWER(name) = LOWER(?)');
    $dup->execute([$name]);
    if ($dup->fetch()) {
        fail('A destination with that name already exists.', 409);
    }
    $rc = $map[$prov];
    $rn = $pdo->prepare('SELECT name FROM regions WHERE code = ?');
    $rn->execute([$rc]);
    $rname = (string)$rn->fetchColumn();

    $pdo->beginTransaction();
    try {
        $id = (int)$pdo->query('SELECT COALESCE(MAX(id), 0) + 1 FROM destinations')->fetchColumn();
        $ins = $pdo->prepare(
            'INSERT INTO destinations (id, name, province, region_group, region_code, region_name, lat, lng, type, budget_php, days, activities, popular, tiktok, best_start, best_end, description, getting_there, tip, hidden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 11, 5, ?, ?, ?, 0)'
        );
        $ins->execute([$id, $name, $prov, $g, $rc, $rname, $lat, $lng, $type, $bud, $days, implode(',', $acts), $pop, $desc, '', '']);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    out(['ok' => true, 'id' => $id]);
}

if ($action === 'hide') {
    $did = (int)($b['destination_id'] ?? 0);
    $hide = !empty($b['hidden']) ? 1 : 0;
    $q = db()->prepare('UPDATE destinations SET hidden = ? WHERE id = ?');
    $q->execute([$hide, $did]);
    out(['ok' => true]);
}

fail('Unknown action', 400);
