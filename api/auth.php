<?php
// Accounts: ?action=me (GET), and register, login, logout, profile (POST).
require __DIR__ . '/bootstrap.php';

function pub(array $u): array
{
    return ['id' => (int)$u['id'], 'username' => $u['username'], 'name' => $u['display_name'], 'role' => $u['role']];
}

$action = (string)($_GET['action'] ?? 'me');

if ($action === 'me') {
    $u = me();
    out(['ok' => true, 'user' => $u ? pub($u) : null, 'state' => $u ? state_for((int)$u['id']) : ['trip' => [], 'fav' => []]]);
}

need_post();
$b = body();

if ($action === 'register') {
    $username = strtolower(trim((string)($b['username'] ?? '')));
    $name = trim((string)($b['name'] ?? ''));
    $pw = (string)($b['password'] ?? '');
    if (!preg_match('/^[a-z0-9_.]{3,30}$/', $username)) {
        fail('Username must be 3 to 30 letters, numbers, dots or underscores.');
    }
    if (strlen($pw) < 6) {
        fail('Password must be at least 6 characters.');
    }
    if ($name === '') {
        $name = $username;
    }
    if (mb_strlen($name) > 60) {
        $name = mb_substr($name, 0, 60);
    }
    $c = db()->prepare('SELECT id FROM users WHERE username = ?');
    $c->execute([$username]);
    if ($c->fetch()) {
        fail('That username is taken.', 409);
    }
    $ins = db()->prepare('INSERT INTO users (username, display_name, role, password_hash) VALUES (?, ?, ?, ?)');
    $ins->execute([$username, $name, 'traveler', password_hash($pw, PASSWORD_DEFAULT)]);
    $uid = (int)db()->lastInsertId();
    session_regenerate_id(true);
    $_SESSION['uid'] = $uid;
    out(['ok' => true, 'user' => ['id' => $uid, 'username' => $username, 'name' => $name, 'role' => 'traveler']]);
}

if ($action === 'login') {
    $s = db()->prepare('SELECT * FROM users WHERE username = ?');
    $s->execute([strtolower(trim((string)($b['username'] ?? '')))]);
    $u = $s->fetch();
    if (!$u || !password_verify((string)($b['password'] ?? ''), $u['password_hash'])) {
        usleep(400000); // slows down password guessing
        fail('Wrong username or password.', 401);
    }
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    out(['ok' => true, 'user' => pub($u)]);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    out(['ok' => true]);
}

if ($action === 'profile') {
    $u = need_login();
    $name = trim((string)($b['name'] ?? ''));
    $pw = (string)($b['password'] ?? '');
    if ($name === '') {
        fail('Display name cannot be empty.');
    }
    if (mb_strlen($name) > 60) {
        $name = mb_substr($name, 0, 60);
    }
    if ($pw !== '' && strlen($pw) < 6) {
        fail('Password must be at least 6 characters.');
    }
    if ($pw !== '') {
        db()->prepare('UPDATE users SET display_name = ?, password_hash = ? WHERE id = ?')
            ->execute([$name, password_hash($pw, PASSWORD_DEFAULT), (int)$u['id']]);
    } else {
        db()->prepare('UPDATE users SET display_name = ? WHERE id = ?')->execute([$name, (int)$u['id']]);
    }
    out(['ok' => true]);
}

fail('Unknown action', 400);
