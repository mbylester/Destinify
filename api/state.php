<?php
// The signed-in user's trip (ordered) and favorites. GET reads them, POST replaces them.
require __DIR__ . '/bootstrap.php';

$u = need_login();
$uid = (int)$u['id'];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    out(['ok' => true, 'state' => state_for($uid)]);
}

need_post();
$b = body();

// keep order, drop duplicates, cap the size
$clean = function ($list): array {
    $out = [];
    foreach ((array)$list as $v) {
        $v = (int)$v;
        if ($v > 0 && !in_array($v, $out, true)) {
            $out[] = $v;
        }
        if (count($out) >= 200) {
            break;
        }
    }
    return $out;
};
$trip = $clean($b['trip'] ?? []);
$fav = $clean($b['fav'] ?? []);

// keep only ids that really exist
$all = array_values(array_unique(array_merge($trip, $fav)));
$valid = [];
if ($all) {
    $q = db()->prepare('SELECT id FROM destinations WHERE id IN (' . implode(',', array_fill(0, count($all), '?')) . ')');
    $q->execute($all);
    $valid = array_map('intval', $q->fetchAll(PDO::FETCH_COLUMN));
}
$trip = array_values(array_filter($trip, function ($i) use ($valid) { return in_array($i, $valid, true); }));
$fav = array_values(array_filter($fav, function ($i) use ($valid) { return in_array($i, $valid, true); }));

$pdo = db();
$pdo->beginTransaction();
try {
    $pdo->prepare('DELETE FROM trip_stops WHERE user_id = ?')->execute([$uid]);
    $pdo->prepare('DELETE FROM favorites WHERE user_id = ?')->execute([$uid]);
    $it = $pdo->prepare('INSERT INTO trip_stops (user_id, position, destination_id) VALUES (?, ?, ?)');
    foreach ($trip as $pos => $did) {
        $it->execute([$uid, $pos, $did]);
    }
    $if = $pdo->prepare('INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)');
    foreach ($fav as $did) {
        $if->execute([$uid, $did]);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}
out(['ok' => true, 'state' => ['trip' => $trip, 'fav' => $fav]]);
