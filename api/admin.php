<?php
// Admin only. GET returns counts (?list=users or ?list=reviews returns those lists).
// POST actions: add (new destination), hide (hide or restore one), role, deluser, delreview.
require __DIR__ . '/bootstrap.php';

$u = need_admin();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $p = db();
    $list = (string)($_GET['list'] ?? '');
    if ($list === 'users') {
        $sql = 'SELECT u.id, u.username, u.display_name, u.role, UNIX_TIMESTAMP(u.created_at) AS created,
                    (SELECT COUNT(*) FROM trip_stops t WHERE t.user_id = u.id) AS trips,
                    (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) AS favs,
                    (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS reviews';
        try {
            $rows = $p->query($sql . ', (SELECT email FROM user_profiles pr WHERE pr.user_id = u.id) AS email FROM users u ORDER BY u.id')->fetchAll();
        } catch (Throwable $e) {
            $rows = $p->query($sql . ', \'\' AS email FROM users u ORDER BY u.id')->fetchAll();
        }
        $users = [];
        foreach ($rows as $r) {
            $users[] = [
                'id' => (int)$r['id'], 'u' => $r['username'], 'n' => $r['display_name'], 'role' => $r['role'],
                'trips' => (int)$r['trips'], 'favs' => (int)$r['favs'], 'reviews' => (int)$r['reviews'],
                'email' => (string)($r['email'] ?? ''), 'created' => (int)$r['created'],
            ];
        }
        out(['ok' => true, 'users' => $users, 'me' => (int)$u['id']]);
    }
    if ($list === 'reviews') {
        $rows = $p->query(
            'SELECT r.id, r.destination_id, r.rating, r.comment, UNIX_TIMESTAMP(r.created_at) AS t, u.display_name, d.name AS dest
             FROM reviews r JOIN users u ON u.id = r.user_id LEFT JOIN destinations d ON d.id = r.destination_id
             ORDER BY r.id DESC LIMIT 200'
        )->fetchAll();
        $rev = [];
        foreach ($rows as $r) {
            $rev[] = ['id' => (int)$r['id'], 'dest' => (string)$r['dest'], 'u' => $r['display_name'], 'r' => (int)$r['rating'], 'c' => $r['comment'], 't' => (int)$r['t'] * 1000];
        }
        out(['ok' => true, 'reviews' => $rev]);
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
    $bs = (int)($b['start'] ?? 11);
    $be = (int)($b['end'] ?? 5);
    if ($bs < 1 || $bs > 12) { $bs = 11; }
    if ($be < 1 || $be > 12) { $be = 5; }

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
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0)'
        );
        $ins->execute([$id, $name, $prov, $g, $rc, $rname, $lat, $lng, $type, $bud, $days, implode(',', $acts), $pop, $bs, $be, $desc, '', '']);
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

if ($action === 'delreview') {
    $rid = (int)($b['review_id'] ?? 0);
    $q = db()->prepare('DELETE FROM reviews WHERE id = ?');
    $q->execute([$rid]);
    if ($q->rowCount() < 1) {
        fail('That review no longer exists.', 404);
    }
    out(['ok' => true]);
}

if ($action === 'role' || $action === 'deluser') {
    $uid = (int)($b['user_id'] ?? 0);
    if ($uid === (int)$u['id']) {
        fail($action === 'role' ? 'You cannot change your own role.' : 'You cannot delete your own account here.');
    }
    $t = db()->prepare('SELECT id, role FROM users WHERE id = ?');
    $t->execute([$uid]);
    $target = $t->fetch();
    if (!$target) {
        fail('That user no longer exists.', 404);
    }
    $admins = (int)db()->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
    if ($target['role'] === 'admin' && $admins < 2) {
        fail('Keep at least one admin.');
    }
    if ($action === 'role') {
        $role = ($b['role'] ?? '') === 'admin' ? 'admin' : 'traveler';
        db()->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $uid]);
        out(['ok' => true, 'role' => $role]);
    }
    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$uid]);
    out(['ok' => true]);
}

fail('Unknown action', 400);
