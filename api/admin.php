<?php
// Admin only.
//   GET                      counts
//   GET ?action=users        every account with activity counts
//   GET ?action=destination&id=N   one destination with all its fields (for the edit form)
//   GET ?action=log          recent admin activity
//   POST action=add | update | hide | set_role | delete_user
require __DIR__ . '/bootstrap.php';

$u = need_admin();
const DEST_TYPES = ['Beach', 'Island', 'Mountain', 'Waterfall', 'Heritage', 'City', 'Diving', 'Surf', 'Cave', 'Lake', 'Nature', 'Adventure'];
const ACT_CODES = ['sw', 'sn', 'dv', 'hk', 'sf', 'ih', 'ss', 'cm', 'fd', 'cv', 'kc', 'cw', 'wl', 'cy', 'ad', 'ph', 'rl', 'bk'];

// Validates the destination fields sent by the admin form. Returns clean values or stops with an error message.
function dest_input(array $b, ?int $selfId): array
{
    $map = require __DIR__ . '/regions_map.php';
    $name = trim((string)($b['name'] ?? ''));
    $prov = trim((string)($b['province'] ?? ''));
    $g = (string)($b['g'] ?? '');
    $lat = (float)($b['lat'] ?? 0);
    $lng = (float)($b['lng'] ?? 0);
    $type = (string)($b['type'] ?? '');
    $bud = (int)($b['budget'] ?? 0);
    $days = (int)($b['days'] ?? 0);
    $acts = array_values(array_intersect(ACT_CODES, array_map('strval', (array)($b['activities'] ?? []))));
    $bs = (int)($b['best_start'] ?? 11);
    $be = (int)($b['best_end'] ?? 5);

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
    if (!in_array($type, DEST_TYPES, true)) {
        fail('Choose a valid type.');
    }
    if ($bud < 500 || $bud > 200000 || $days < 1 || $days > 30) {
        fail('Budget must be 500 to 200,000 and days 1 to 30.');
    }
    if (!$acts) {
        fail('Pick at least one activity.');
    }
    if ($bs < 1 || $bs > 12 || $be < 1 || $be > 12) {
        fail('Best months must be 1 to 12.');
    }
    $dup = db()->prepare('SELECT id FROM destinations WHERE LOWER(name) = LOWER(?) AND id <> ?');
    $dup->execute([$name, (int)$selfId]);
    if ($dup->fetch()) {
        fail('A destination with that name already exists.', 409);
    }
    $rc = $map[$prov];
    $rn = db()->prepare('SELECT name FROM regions WHERE code = ?');
    $rn->execute([$rc]);
    return [
        'name' => $name, 'province' => $prov, 'g' => $g, 'lat' => $lat, 'lng' => $lng, 'type' => $type,
        'bud' => $bud, 'days' => $days, 'acts' => implode(',', $acts), 'pop' => !empty($b['popular']) ? 1 : 0,
        'bs' => $bs, 'be' => $be, 'rc' => $rc, 'rname' => (string)$rn->fetchColumn(),
        'desc' => mb_substr(trim((string)($b['description'] ?? '')), 0, 500),
        'how' => mb_substr(trim((string)($b['getting_there'] ?? '')), 0, 500),
        'tip' => mb_substr(trim((string)($b['tip'] ?? '')), 0, 500),
    ];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $p = db();
    $act = (string)($_GET['action'] ?? '');
    if ($act === 'users') {
        $rows = $p->query(
            'SELECT u.id, u.username, u.display_name AS name, u.role, u.created_at,
                (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS reviews,
                (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) AS favorites,
                (SELECT COUNT(*) FROM trip_stops t WHERE t.user_id = u.id) AS trip
             FROM users u ORDER BY u.id'
        )->fetchAll();
        out(['ok' => true, 'users' => $rows]);
    }
    if ($act === 'destination') {
        $q = $p->prepare('SELECT * FROM destinations WHERE id = ?');
        $q->execute([(int)($_GET['id'] ?? 0)]);
        $r = $q->fetch();
        if (!$r) {
            fail('Destination not found.', 404);
        }
        out(['ok' => true, 'destination' => $r]);
    }
    if ($act === 'log') {
        try {
            $rows = $p->query('SELECT l.message, l.created_at, u.username FROM admin_log l LEFT JOIN users u ON u.id = l.user_id ORDER BY l.id DESC LIMIT 20')->fetchAll();
        } catch (Throwable $e) {
            $rows = [];
        }
        out(['ok' => true, 'log' => $rows]);
    }
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
$pdo = db();

if ($action === 'add') {
    $v = dest_input($b, null);
    $pdo->beginTransaction();
    try {
        $id = (int)$pdo->query('SELECT COALESCE(MAX(id), 0) + 1 FROM destinations')->fetchColumn();
        $pdo->prepare(
            'INSERT INTO destinations (id, name, province, region_group, region_code, region_name, lat, lng, type, budget_php, days, activities, popular, tiktok, best_start, best_end, description, getting_there, tip, hidden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0)'
        )->execute([$id, $v['name'], $v['province'], $v['g'], $v['rc'], $v['rname'], $v['lat'], $v['lng'], $v['type'], $v['bud'], $v['days'], $v['acts'], $v['pop'], $v['bs'], $v['be'], $v['desc'], $v['how'], $v['tip']]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    admin_log((int)$u['id'], 'Added destination ' . $v['name']);
    out(['ok' => true, 'id' => $id]);
}

if ($action === 'update') {
    $did = (int)($b['destination_id'] ?? 0);
    $chk = $pdo->prepare('SELECT name FROM destinations WHERE id = ?');
    $chk->execute([$did]);
    $old = $chk->fetchColumn();
    if ($old === false) {
        fail('Destination not found.', 404);
    }
    $v = dest_input($b, $did);
    $pdo->prepare(
        'UPDATE destinations SET name = ?, province = ?, region_group = ?, region_code = ?, region_name = ?, lat = ?, lng = ?, type = ?,
         budget_php = ?, days = ?, activities = ?, popular = ?, best_start = ?, best_end = ?, description = ?, getting_there = ?, tip = ? WHERE id = ?'
    )->execute([$v['name'], $v['province'], $v['g'], $v['rc'], $v['rname'], $v['lat'], $v['lng'], $v['type'], $v['bud'], $v['days'], $v['acts'], $v['pop'], $v['bs'], $v['be'], $v['desc'], $v['how'], $v['tip'], $did]);
    admin_log((int)$u['id'], 'Edited destination ' . $old);
    out(['ok' => true]);
}

if ($action === 'hide') {
    $did = (int)($b['destination_id'] ?? 0);
    $hide = !empty($b['hidden']) ? 1 : 0;
    $pdo->prepare('UPDATE destinations SET hidden = ? WHERE id = ?')->execute([$hide, $did]);
    admin_log((int)$u['id'], ($hide ? 'Hid' : 'Restored') . ' destination #' . $did);
    out(['ok' => true]);
}

if ($action === 'set_role' || $action === 'delete_user') {
    $uid = (int)($b['user_id'] ?? 0);
    if ($uid === (int)$u['id']) {
        fail('You cannot change or delete your own account here.');
    }
    $t = $pdo->prepare('SELECT username, role FROM users WHERE id = ?');
    $t->execute([$uid]);
    $target = $t->fetch();
    if (!$target) {
        fail('User not found.', 404);
    }
    $admins = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
    if ($target['role'] === 'admin' && $admins < 2 && ($action === 'delete_user' || ($b['role'] ?? '') !== 'admin')) {
        fail('Keep at least one admin.');
    }
    if ($action === 'set_role') {
        $role = ($b['role'] ?? '') === 'admin' ? 'admin' : 'traveler';
        $pdo->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $uid]);
        admin_log((int)$u['id'], 'Made ' . $target['username'] . ' ' . $role);
    } else {
        $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$uid]);
        admin_log((int)$u['id'], 'Deleted user ' . $target['username']);
    }
    out(['ok' => true]);
}

fail('Unknown action', 400);
