<?php
// Accounts: ?action=me (GET), and register, login, logout, profile (POST).
require __DIR__ . '/bootstrap.php';

function pub(array $u): array
{
    return ['id' => (int)$u['id'], 'username' => $u['username'], 'name' => $u['display_name'], 'role' => $u['role']];
}

// Extra profile details live in their own table, created automatically the first time it is needed.
function ensure_profiles(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    db()->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(150) NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  home_city VARCHAR(80) NOT NULL DEFAULT '',
  bio VARCHAR(200) NOT NULL DEFAULT '',
  budget INT UNSIGNED NOT NULL DEFAULT 8000,
  fav_types VARCHAR(300) NOT NULL DEFAULT '',
  avatar MEDIUMTEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL);
    $done = true;
}

function profile_for(int $uid): array
{
    ensure_profiles();
    $s = db()->prepare('SELECT p.full_name, p.email, p.phone, p.home_city, p.bio, p.budget, p.fav_types, p.avatar, u.created_at
        FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ?');
    $s->execute([$uid]);
    $r = $s->fetch() ?: [];
    return [
        'full'   => (string)($r['full_name'] ?? ''),
        'email'  => (string)($r['email'] ?? ''),
        'phone'  => (string)($r['phone'] ?? ''),
        'home'   => (string)($r['home_city'] ?? ''),
        'bio'    => (string)($r['bio'] ?? ''),
        'budget' => (int)($r['budget'] ?? 8000) ?: 8000,
        'types'  => array_values(array_filter(explode(',', (string)($r['fav_types'] ?? '')))),
        'avatar' => (string)($r['avatar'] ?? ''),
        'since'  => isset($r['created_at']) ? (int)strtotime((string)$r['created_at']) * 1000 : 0,
    ];
}

// Partial update: only the fields present in $in change. Returns an error message, or null when saved.
function save_profile(int $uid, array $in): ?string
{
    $cur = profile_for($uid);
    $str = function (string $k, int $max) use ($in, $cur): string {
        return array_key_exists($k, $in) ? mb_substr(trim((string)$in[$k]), 0, $max) : (string)$cur[$k];
    };
    $full = $str('full', 100);
    $email = $str('email', 150);
    $phone = $str('phone', 30);
    $home = $str('home', 80);
    $bio = $str('bio', 200);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return 'That email does not look right.';
    }
    $budget = array_key_exists('budget', $in) ? (int)$in['budget'] : (int)$cur['budget'];
    $budget = max(1000, min(100000, $budget));
    $types = $cur['types'];
    if (array_key_exists('types', $in) && is_array($in['types'])) {
        $types = [];
        foreach (array_slice($in['types'], 0, 12) as $t) {
            $t = mb_substr((string)preg_replace('/[^A-Za-z ]/', '', (string)$t), 0, 24);
            if ($t !== '') {
                $types[] = $t;
            }
        }
    }
    $avatar = (string)$cur['avatar'];
    if (array_key_exists('avatar', $in)) {
        $a = (string)$in['avatar'];
        if ($a === '') {
            $avatar = '';
        } elseif (strlen($a) <= 200000 && preg_match('#^data:image/jpeg;base64,[A-Za-z0-9+/=]+$#', $a)) {
            $avatar = $a;
        } else {
            return 'That photo could not be saved. Try a smaller image.';
        }
    }
    db()->prepare('INSERT INTO user_profiles (user_id, full_name, email, phone, home_city, bio, budget, fav_types, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email), phone = VALUES(phone),
        home_city = VALUES(home_city), bio = VALUES(bio), budget = VALUES(budget), fav_types = VALUES(fav_types), avatar = VALUES(avatar)')
        ->execute([$uid, $full, $email, $phone, $home, $bio, $budget, implode(',', $types), $avatar]);
    return null;
}

$action = (string)($_GET['action'] ?? 'me');

if ($action === 'me') {
    $u = me();
    out(['ok' => true, 'user' => $u ? pub($u) + ['profile' => profile_for((int)$u['id'])] : null, 'state' => $u ? state_for((int)$u['id']) : ['trip' => [], 'fav' => []]]);
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
    if (strlen($pw) > 200) {
        fail('Password is too long.');
    }
    $rb = 'reg:ip:' . client_ip();
    throttle_check($rb, 5, 3600);   // 5 new accounts per IP per hour
    $c = db()->prepare('SELECT id FROM users WHERE username = ?');
    $c->execute([$username]);
    if ($c->fetch()) {
        fail('That username is taken.', 409);
    }
    $hash = password_hash($pw, PASSWORD_DEFAULT);
    $ins = db()->prepare('INSERT INTO users (username, display_name, role, password_hash) VALUES (?, ?, ?, ?)');
    $ins->execute([$username, $name, 'traveler', $hash]);
    throttle_hit($rb);
    $uid = (int)db()->lastInsertId();
    session_regenerate_id(true);
    $_SESSION['uid'] = $uid;
    $_SESSION['pv'] = pw_stamp($hash);
    out(['ok' => true, 'user' => ['id' => $uid, 'username' => $username, 'name' => $name, 'role' => 'traveler']]);
}

if ($action === 'login') {
    $uname = strtolower(trim((string)($b['username'] ?? '')));
    $bu = 'login:user:' . mb_substr($uname, 0, 40);
    $bi = 'login:ip:' . client_ip();
    throttle_check($bu, 5, 900);    // 5 failures per username per 15 minutes
    throttle_check($bi, 20, 900);   // 20 failures per IP per 15 minutes
    $s = db()->prepare('SELECT * FROM users WHERE username = ?');
    $s->execute([$uname]);
    $u = $s->fetch();
    $given = substr((string)($b['password'] ?? ''), 0, 200);
    // Always run one bcrypt check so a missing username takes about as long as a wrong password.
    $dummy = '$2y$10$Bxjh1twxj6DgL/ptPbHiUOKVphWXI1pKnEqQcbDVyCceGkSUFKImO';   // valid bcrypt hash of a throwaway string
    $ok = password_verify($given, $u ? (string)$u['password_hash'] : $dummy) && $u;
    if (!$ok) {
        throttle_hit($bu);
        throttle_hit($bi);
        usleep(400000);
        fail('Wrong username or password.', 401);
    }
    throttle_clear($bu);
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    $_SESSION['pv'] = pw_stamp((string)$u['password_hash']);
    out(['ok' => true, 'user' => pub($u)]);
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']);
    }
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
    if (strlen($pw) > 200) {
        fail('Password is too long.');
    }
    if ($pw !== '') {
        // Changing the password needs the current one, so a stolen session cannot take over the account.
        $bp = 'pwchange:user:' . (int)$u['id'];
        throttle_check($bp, 5, 900);
        $h = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
        $h->execute([(int)$u['id']]);
        $curHash = (string)$h->fetchColumn();
        if (!password_verify(substr((string)($b['current_password'] ?? ''), 0, 200), $curHash)) {
            throttle_hit($bp);
            usleep(400000);
            fail('Your current password is not correct.', 403);
        }
        throttle_clear($bp);
    }
    if (isset($b['profile']) && is_array($b['profile'])) {
        $e = save_profile((int)$u['id'], $b['profile']);
        if ($e !== null) {
            fail($e);
        }
    }
    if ($pw !== '') {
        $newHash = password_hash($pw, PASSWORD_DEFAULT);
        db()->prepare('UPDATE users SET display_name = ?, password_hash = ? WHERE id = ?')
            ->execute([$name, $newHash, (int)$u['id']]);
        session_regenerate_id(true);               // this browser stays signed in...
        $_SESSION['pv'] = pw_stamp($newHash);      // ...every other session of the account is now invalid
    } else {
        db()->prepare('UPDATE users SET display_name = ? WHERE id = ?')->execute([$name, (int)$u['id']]);
    }
    out(['ok' => true]);
}

fail('Unknown action', 400);
