<?php
// Reviews: GET ?all=1 returns every review grouped by destination id. POST adds one (sign-in required).
require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $rows = db()->query(
        'SELECT r.id, r.destination_id, r.rating, r.comment, r.created_at, u.display_name
         FROM reviews r JOIN users u ON u.id = r.user_id ORDER BY r.id'
    )->fetchAll();
    $by = [];
    foreach ($rows as $r) {
        $by[(string)$r['destination_id']][] = [
            'id' => (int)$r['id'], 'u' => $r['display_name'], 'r' => (int)$r['rating'], 'c' => $r['comment'],
            't' => (int)strtotime((string)$r['created_at']) * 1000,
        ];
    }
    out(['ok' => true, 'byDest' => $by ? $by : new stdClass()]);
}

need_post();
$u = need_login();
$b = body();
if (($b['action'] ?? '') === 'delete') {          // an admin can delete any review, a traveler only their own
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
$comment = trim((string)($b['comment'] ?? ''));

if ($rating < 1 || $rating > 5) {
    fail('Rating must be 1 to 5.');
}
if ($comment === '') {
    fail('Write a short comment.');
}
if (mb_strlen($comment) > 300) {
    $comment = mb_substr($comment, 0, 300);
}
$e = db()->prepare('SELECT id FROM destinations WHERE id = ?');
$e->execute([$did]);
if (!$e->fetch()) {
    fail('Unknown destination.', 404);
}
db()->prepare('INSERT INTO reviews (destination_id, user_id, rating, comment) VALUES (?, ?, ?, ?)')
    ->execute([$did, (int)$u['id'], $rating, $comment]);
out(['ok' => true]);
