<?php
// Admin only. GET returns counts (?list=users or ?list=reviews returns those lists).
// POST actions: add / update / delete (a destination), hide (hide or restore one), role, deluser, delreview,
// setting (the feedback email and the editable site content), reset_link / dismiss_reset (password resets).
// GET ?list=analytics returns the usage numbers for the Overview tab.
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
        $resets = [];
        try {
            ensure_resets();
            $rr = $p->query('SELECT r.id, r.user_id, u.username, u.display_name, UNIX_TIMESTAMP(r.requested_at) AS t
                FROM password_resets r JOIN users u ON u.id = r.user_id
                WHERE r.token_hash IS NULL AND r.used_at IS NULL ORDER BY r.id DESC LIMIT 50')->fetchAll();
            foreach ($rr as $r) {
                $resets[] = ['id' => (int)$r['id'], 'uid' => (int)$r['user_id'], 'u' => $r['username'], 'n' => $r['display_name'], 't' => (int)$r['t'] * 1000];
            }
        } catch (Throwable $e) {
        }
        out(['ok' => true, 'users' => $users, 'resets' => $resets, 'me' => (int)$u['id']]);
    }
    if ($list === 'reviews') {
        $hasPhoto = reviews_have_photo();
        $rows = $p->query(
            'SELECT r.id, r.destination_id, r.rating, r.comment, UNIX_TIMESTAMP(r.created_at) AS t, u.display_name, d.name AS dest'
            . ($hasPhoto ? ", (r.photo IS NOT NULL AND r.photo <> '') AS has_photo" : ', 0 AS has_photo')
            . ' FROM reviews r JOIN users u ON u.id = r.user_id LEFT JOIN destinations d ON d.id = r.destination_id
             ORDER BY r.id DESC LIMIT 200'
        )->fetchAll();
        $rev = [];
        foreach ($rows as $r) {
            $one = ['id' => (int)$r['id'], 'dest' => (string)$r['dest'], 'u' => $r['display_name'], 'r' => (int)$r['rating'], 'c' => $r['comment'], 't' => (int)$r['t'] * 1000];
            if ((int)$r['has_photo'] === 1) {
                $one['p'] = 'api/review_photo.php?id=' . (int)$r['id'];
            }
            $rev[] = $one;
        }
        out(['ok' => true, 'reviews' => $rev]);
    }
    if ($list === 'analytics') {
        $days = (int)($_GET['days'] ?? 30);
        if (!in_array($days, [7, 30, 90], true)) {
            $days = 30;
        }
        $res = ['ok' => true, 'days' => $days, 'views' => [], 'searches' => [], 'saved' => [], 'daily' => [], 'viewsTotal' => 0, 'searchTotal' => 0];
        try {
            ensure_events();
            $q = $p->prepare("SELECT d.name, COUNT(*) AS n FROM site_events e JOIN destinations d ON d.id = CAST(e.ref AS UNSIGNED)
                WHERE e.kind = 'view' AND e.created_at > (NOW() - INTERVAL ? DAY) GROUP BY d.id, d.name ORDER BY n DESC, d.name LIMIT 10");
            $q->execute([$days]);
            foreach ($q->fetchAll() as $r) {
                $res['views'][] = [(string)$r['name'], (int)$r['n']];
            }
            $q = $p->prepare("SELECT ref, COUNT(*) AS n FROM site_events WHERE kind = 'search' AND created_at > (NOW() - INTERVAL ? DAY)
                GROUP BY ref ORDER BY n DESC, ref LIMIT 10");
            $q->execute([$days]);
            foreach ($q->fetchAll() as $r) {
                $res['searches'][] = [(string)$r['ref'], (int)$r['n']];
            }
            foreach (['view' => 'viewsTotal', 'search' => 'searchTotal'] as $k => $f) {
                $q = $p->prepare('SELECT COUNT(*) FROM site_events WHERE kind = ? AND created_at > (NOW() - INTERVAL ? DAY)');
                $q->execute([$k, $days]);
                $res[$f] = (int)$q->fetchColumn();
            }
            $q = $p->query("SELECT DATE(created_at) AS d, COUNT(*) AS n FROM site_events WHERE kind = 'view'
                AND created_at > (NOW() - INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY d");
            foreach ($q->fetchAll() as $r) {
                $res['daily'][] = [(string)$r['d'], (int)$r['n']];
            }
        } catch (Throwable $e) {
            error_log('Destinify analytics: ' . $e->getMessage());
        }
        $q = $p->query('SELECT d.name, x.trips, x.favs FROM destinations d JOIN (
                SELECT destination_id, SUM(t) AS trips, SUM(f) AS favs FROM (
                    SELECT destination_id, 1 AS t, 0 AS f FROM trip_stops UNION ALL SELECT destination_id, 0, 1 FROM favorites
                ) z GROUP BY destination_id) x ON x.destination_id = d.id ORDER BY (x.trips + x.favs) DESC, d.name LIMIT 10');
        foreach ($q->fetchAll() as $r) {
            $res['saved'][] = [(string)$r['name'], (int)$r['trips'], (int)$r['favs']];
        }
        out($res);
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

// Checks the destination form (the same rules for adding and for editing) and returns the clean values.
function dest_fields(array $b): array
{
    $types = ['Beach', 'Island', 'Mountain', 'Waterfall', 'Heritage', 'City', 'Diving', 'Surf', 'Cave', 'Lake', 'Nature', 'Adventure'];
    $codes = ['sw', 'sn', 'dv', 'hk', 'sf', 'ih', 'ss', 'cm', 'fd', 'cv', 'kc', 'cw', 'wl', 'cy', 'ad', 'ph', 'rl', 'bk'];
    $map = require __DIR__ . '/regions_map.php';

    $prov = trim((string)($b['province'] ?? ''));
    $g = (string)($b['g'] ?? '');
    $lat = (float)($b['lat'] ?? 0);
    $lng = (float)($b['lng'] ?? 0);
    $type = (string)($b['type'] ?? '');
    $bud = (int)($b['budget'] ?? 0);
    $days = (int)($b['days'] ?? 0);
    $acts = array_values(array_intersect($codes, array_map('strval', (array)($b['activities'] ?? []))));
    $bs = (int)($b['start'] ?? 11);
    $be = (int)($b['end'] ?? 5);
    if ($bs < 1 || $bs > 12) { $bs = 11; }
    if ($be < 1 || $be > 12) { $be = 5; }

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
    if ($bud < 500 || $bud > 200000 || $days < 1 || $days > 30) {
        fail('Budget must be 500 to 200,000 and days 1 to 30.');
    }
    if (!$acts) {
        fail('Pick at least one activity.');
    }
    $rc = $map[$prov];
    $rn = db()->prepare('SELECT name FROM regions WHERE code = ?');
    $rn->execute([$rc]);
    return [
        'province' => $prov, 'g' => $g, 'lat' => $lat, 'lng' => $lng, 'type' => $type, 'budget' => $bud, 'days' => $days,
        'acts' => implode(',', $acts), 'popular' => !empty($b['popular']) ? 1 : 0, 'tiktok' => !empty($b['tiktok']) ? 1 : 0,
        'start' => $bs, 'end' => $be, 'rc' => $rc, 'rname' => (string)$rn->fetchColumn(),
        'desc' => clean_text($b['description'] ?? '', 500), 'go' => clean_text($b['go'] ?? '', 500), 'tip' => clean_text($b['tip'] ?? '', 500),
    ];
}

if ($action === 'add') {
    $name = clean_text($b['name'] ?? '', 120);
    if ($name === '') {
        fail('Enter a destination name (up to 120 characters).');
    }
    $f = dest_fields($b);

    $pdo = db();
    $dup = $pdo->prepare('SELECT id FROM destinations WHERE LOWER(name) = LOWER(?)');
    $dup->execute([$name]);
    if ($dup->fetch()) {
        fail('A destination with that name already exists.', 409);
    }

    $pdo->beginTransaction();
    try {
        $id = (int)$pdo->query('SELECT COALESCE(MAX(id), 0) + 1 FROM destinations')->fetchColumn();
        $ins = $pdo->prepare(
            'INSERT INTO destinations (id, name, province, region_group, region_code, region_name, lat, lng, type, budget_php, days, activities, popular, tiktok, best_start, best_end, description, getting_there, tip, hidden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)'
        );
        $ins->execute([$id, $name, $f['province'], $f['g'], $f['rc'], $f['rname'], $f['lat'], $f['lng'], $f['type'], $f['budget'], $f['days'],
            $f['acts'], $f['popular'], $f['tiktok'], $f['start'], $f['end'], $f['desc'], $f['go'], $f['tip']]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    admin_log((int)$u['id'], 'Added destination ' . $name);
    out(['ok' => true, 'id' => $id]);
}

if ($action === 'update') {
    $did = (int)($b['destination_id'] ?? 0);
    $ex = db()->prepare('SELECT name FROM destinations WHERE id = ?');
    $ex->execute([$did]);
    $name = $ex->fetchColumn();
    if ($name === false) {
        fail('That destination no longer exists.', 404);
    }
    $f = dest_fields($b);
    db()->prepare(
        'UPDATE destinations SET province = ?, region_group = ?, region_code = ?, region_name = ?, lat = ?, lng = ?, type = ?, budget_php = ?, days = ?,
            activities = ?, popular = ?, tiktok = ?, best_start = ?, best_end = ?, description = ?, getting_there = ?, tip = ? WHERE id = ?'
    )->execute([$f['province'], $f['g'], $f['rc'], $f['rname'], $f['lat'], $f['lng'], $f['type'], $f['budget'], $f['days'],
        $f['acts'], $f['popular'], $f['tiktok'], $f['start'], $f['end'], $f['desc'], $f['go'], $f['tip'], $did]);
    admin_log((int)$u['id'], 'Edited destination ' . $name);
    out(['ok' => true, 'region' => $f['rc']]);
}

if ($action === 'delete') {
    // Removes the place for good. Its reviews, and every user's favorite and trip stop for it, go with it (foreign keys cascade).
    $did = (int)($b['destination_id'] ?? 0);
    $ex = db()->prepare('SELECT name FROM destinations WHERE id = ?');
    $ex->execute([$did]);
    $name = $ex->fetchColumn();
    if ($name === false) {
        fail('That destination no longer exists.', 404);
    }
    db()->prepare('DELETE FROM destinations WHERE id = ?')->execute([$did]);
    admin_log((int)$u['id'], 'Deleted destination ' . $name);
    out(['ok' => true]);
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
    admin_log((int)$u['id'], 'Deleted review #' . $rid);
    out(['ok' => true]);
}

if ($action === 'setting') {
    $key = (string)($b['key'] ?? '');
    $val = (string)($b['value'] ?? '');
    if ($key === 'contact_email') {
        $val = trim($val);
        if ($val !== '' && (strlen($val) > 150 || !filter_var($val, FILTER_VALIDATE_EMAIL))) {
            fail('That email address does not look right.');
        }
        setting_set('contact_email', $val);
        admin_log((int)$u['id'], $val === '' ? 'Cleared the feedback email' : 'Set the feedback email');
        out(['ok' => true]);
    }
    if ($key === 'content') {
        // The editable site content: one JSON object. The site shows every value as escaped text, never as raw HTML.
        if (strlen($val) > 300000) {
            fail('That is too much content to save (limit about 300 KB).');
        }
        $j = json_decode($val, true, 12);
        if (!is_array($j) || ltrim($val)[0] !== '{') {
            fail('The content is not valid.');
        }
        setting_set('content', $val);
        admin_log((int)$u['id'], 'Edited site content');
        out(['ok' => true]);
    }
    fail('Unknown setting.');
}

if ($action === 'reset_link') {
    // Makes a one-time link (valid for 1 hour) that lets a user choose a new password. The admin gives it to them privately.
    $uid = (int)($b['user_id'] ?? 0);
    if ($uid === (int)$u['id']) {
        fail('Use your profile to change your own password.');
    }
    $t = db()->prepare('SELECT username FROM users WHERE id = ?');
    $t->execute([$uid]);
    $uname = $t->fetchColumn();
    if ($uname === false) {
        fail('That user no longer exists.', 404);
    }
    ensure_resets();
    $token = bin2hex(random_bytes(32));
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $pdo->prepare('UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL')->execute([$uid]);   // older links and requests stop working
        $pdo->prepare("INSERT INTO password_resets (user_id, token_hash, via, expires_at) VALUES (?, ?, 'admin', NOW() + INTERVAL 1 HOUR)")
            ->execute([$uid, hash('sha256', $token)]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    admin_log((int)$u['id'], 'Created a password reset link for @' . $uname);
    out(['ok' => true, 'token' => $token, 'minutes' => 60]);
}

if ($action === 'dismiss_reset') {
    ensure_resets();
    db()->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ? AND token_hash IS NULL AND used_at IS NULL')->execute([(int)($b['id'] ?? 0)]);
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
