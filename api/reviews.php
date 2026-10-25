<?php
// Reviews: GET ?all=1 returns every review grouped by destination id. POST adds one (sign-in required),
// optionally with one photo, or deletes one (action "delete": an admin can delete any review, a traveler only their own).
require __DIR__ . '/bootstrap.php';

$hasPhoto = reviews_have_photo();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $viewer = me();
    $vid = $viewer ? (int)$viewer['id'] : 0;
    $rows = db()->query(
        'SELECT r.id, r.destination_id, r.user_id, r.rating, r.comment, r.created_at, u.display_name'
        . ($hasPhoto ? ", (r.photo IS NOT NULL AND r.photo <> '') AS has_photo" : ', 0 AS has_photo')
        . ' FROM reviews r JOIN users u ON u.id = r.user_id ORDER BY r.id'
    )->fetchAll();
    $by = [];
    foreach ($rows as $r) {
        $one = [
            'id' => (int)$r['id'], 'u' => $r['display_name'], 'r' => (int)$r['rating'], 'c' => $r['comment'],
            't' => (int)strtotime((string)$r['created_at']) * 1000,
            'mine' => $vid > 0 && (int)$r['user_id'] === $vid,
        ];
        if ((int)$r['has_photo'] === 1) {
            $one['p'] = 'api/review_photo.php?id=' . (int)$r['id'];
        }
        $by[(string)$r['destination_id']][] = $one;
    }
    out(['ok' => true, 'byDest' => $by ? $by : new stdClass()]);
}

need_post();
$u = need_login();
$b = body();

if (($b['action'] ?? '') === 'delete') {
    $rid = (int)($b['id'] ?? 0);
    $q = db()->prepare('SELECT user_id FROM reviews WHERE id = ?');
    $q->execute([$rid]);
    $owner = $q->fetchColumn();
    if ($owner === false) {
        fail('Review not found.', 404);
    }
    $mine = (int)$owner === (int)$u['id'];
    if (!$mine && $u['role'] !== 'admin') {
        fail('You can only delete your own reviews.', 403);
    }
    db()->prepare('DELETE FROM reviews WHERE id = ?')->execute([$rid]);
    if (!$mine) {
        admin_log((int)$u['id'], 'Deleted review #' . $rid);
    }
    out(['ok' => true]);
}

$did = (int)($b['destination_id'] ?? 0);
$rating = (int)($b['rating'] ?? 0);
$comment = clean_text($b['comment'] ?? '', 300);

if ($rating < 1 || $rating > 5) {
    fail('Rating must be 1 to 5.');
}
if ($comment === '') {
    fail('Write a short comment.');
}
$photo = valid_photo($b['photo'] ?? '');
if ($photo !== null && !$hasPhoto) {
    fail('Photo uploads are not available on this server yet. Ask the admin to run database/upgrade.sql.', 503);
}
$e = db()->prepare('SELECT id FROM destinations WHERE id = ?');
$e->execute([$did]);
if (!$e->fetch()) {
    fail('Unknown destination.', 404);
}

// A small limit keeps one account from flooding a place with reviews and photos. It never blocks if the table is missing.
$bucket = 'review:' . (int)$u['id'];
try {
    throttle_check($bucket, 20, 3600);
} catch (PDOException $ex) {
}

if ($hasPhoto) {
    db()->prepare('INSERT INTO reviews (destination_id, user_id, rating, comment, photo) VALUES (?, ?, ?, ?, ?)')
        ->execute([$did, (int)$u['id'], $rating, $comment, $photo]);
} else {
    db()->prepare('INSERT INTO reviews (destination_id, user_id, rating, comment) VALUES (?, ?, ?, ?)')
        ->execute([$did, (int)$u['id'], $rating, $comment]);
}
$id = (int)db()->lastInsertId();
try {
    throttle_hit($bucket);
} catch (PDOException $ex) {
}
$res = ['ok' => true, 'id' => $id];
if ($photo !== null) {
    $res['p'] = 'api/review_photo.php?id=' . $id;
}
out($res);
