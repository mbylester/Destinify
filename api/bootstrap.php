<?php
declare(strict_types=1);

// Shared setup for every API endpoint: JSON output, database connection, sessions, and small helpers.
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $msg, int $code = 400): void
{
    out(['ok' => false, 'error' => $msg], $code);
}

set_exception_handler(function (Throwable $e): void {
    error_log('Destinify API: ' . $e->getMessage());
    out(['ok' => false, 'error' => 'Server error'], 500);
});

$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) {
    fail('Missing api/config.php. Copy api/config.sample.php to api/config.php and edit it.', 500);
}
$CFG = require $cfgFile;

function db(): PDO
{
    static $pdo = null;
    global $CFG;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $CFG['db_host'], (int)$CFG['db_port'], $CFG['db_name']);
        try {
            $pdo = new PDO($dsn, $CFG['db_user'], $CFG['db_pass'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            fail('Database connection failed. Check api/config.php and that MySQL is running.', 500);
        }
    }
    return $pdo;
}

// Session cookie: HttpOnly, SameSite=Lax, and Secure whenever the page is served over HTTPS.
// Behind a proxy that ends TLS, PHP cannot see HTTPS, so set 'force_https_cookie' => true in config.php.
$isHttps = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') || !empty($CFG['force_https_cookie']);
ini_set('session.use_strict_mode', '1');   // refuse session ids the server did not issue
ini_set('session.use_only_cookies', '1');
session_name($CFG['session_name'] ?? 'destinify_sid');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'secure' => $isHttps, 'samesite' => 'Lax']);
session_start();

function body(): array
{
    $raw = file_get_contents('php://input');
    $j = json_decode($raw === false ? '' : $raw, true);
    return is_array($j) ? $j : [];
}

// Every write must be a POST sent by our own page (fetch adds this header; other sites cannot add it).
function need_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        fail('POST required', 405);
    }
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
        fail('Bad request', 400);
    }
}

// Short fingerprint of a password hash. It is stored in the session so that changing the password
// ends every other session of that account (their stored fingerprint no longer matches).
function pw_stamp(string $hash): string
{
    return substr(hash('sha256', $hash), 0, 32);
}

function me(): ?array
{
    if (empty($_SESSION['uid'])) {
        return null;
    }
    $s = db()->prepare('SELECT id, username, display_name, role, password_hash FROM users WHERE id = ?');
    $s->execute([(int)$_SESSION['uid']]);
    $u = $s->fetch();
    if (!$u || !hash_equals(pw_stamp((string)$u['password_hash']), (string)($_SESSION['pv'] ?? ''))) {
        $_SESSION = [];   // deleted account, or the password changed after this session started
        return null;
    }
    unset($u['password_hash']);
    return $u;
}

function client_ip(): string
{
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');   // never trust X-Forwarded-For unless you control the proxy
}

// Simple rate limiter backed by the rate_limits table (see database/destinify.sql).
// throttle_check() stops the request with 429 once $max hits happened in the last $window seconds.
function throttle_check(string $bucket, int $max, int $window): void
{
    $q = db()->prepare('SELECT COUNT(*) FROM rate_limits WHERE bucket = ? AND created_at > (NOW() - INTERVAL ? SECOND)');
    $q->execute([$bucket, $window]);
    if ((int)$q->fetchColumn() >= $max) {
        header('Retry-After: ' . $window);
        fail('Too many attempts. Please wait a few minutes and try again.', 429);
    }
}

function throttle_hit(string $bucket): void
{
    db()->prepare('INSERT INTO rate_limits (bucket) VALUES (?)')->execute([$bucket]);
    if (random_int(1, 100) === 1) {   // keep the table small
        db()->exec('DELETE FROM rate_limits WHERE created_at < (NOW() - INTERVAL 1 DAY)');
    }
}

function throttle_clear(string $bucket): void
{
    db()->prepare('DELETE FROM rate_limits WHERE bucket = ?')->execute([$bucket]);
}

function need_login(): array
{
    $u = me();
    if (!$u) {
        fail('Please sign in first.', 401);
    }
    return $u;
}

function need_admin(): array
{
    $u = need_login();
    if ($u['role'] !== 'admin') {
        fail('Admins only.', 403);
    }
    return $u;
}

// The signed-in user's saved trip (ordered) and favorites, as destination ids.
function state_for(int $uid): array
{
    $p = db();
    $t = $p->prepare('SELECT destination_id FROM trip_stops WHERE user_id = ? ORDER BY position');
    $t->execute([$uid]);
    $f = $p->prepare('SELECT destination_id FROM favorites WHERE user_id = ? ORDER BY destination_id');
    $f->execute([$uid]);
    return [
        'trip' => array_map('intval', $t->fetchAll(PDO::FETCH_COLUMN)),
        'fav'  => array_map('intval', $f->fetchAll(PDO::FETCH_COLUMN)),
    ];
}

// ---------- schema helpers (older databases get the new bits added automatically) ----------

// True when reviews.photo exists. Adds the column the first time if the database user is allowed to.
function reviews_have_photo(): bool
{
    static $ok = null;
    if ($ok !== null) {
        return $ok;
    }
    try {
        $p = db();
        if ($p->query("SHOW COLUMNS FROM reviews LIKE 'photo'")->fetch()) {
            return $ok = true;
        }
        $p->exec('ALTER TABLE reviews ADD COLUMN photo MEDIUMTEXT NULL');
        return $ok = true;
    } catch (Throwable $e) {
        error_log('Destinify: reviews.photo is not available: ' . $e->getMessage());
        return $ok = false;
    }
}

// True when reviews.edited_at exists (added automatically the first time, like reviews.photo).
function reviews_have_edited(): bool
{
    static $ok = null;
    if ($ok !== null) {
        return $ok;
    }
    try {
        $p = db();
        if ($p->query("SHOW COLUMNS FROM reviews LIKE 'edited_at'")->fetch()) {
            return $ok = true;
        }
        $p->exec('ALTER TABLE reviews ADD COLUMN edited_at TIMESTAMP NULL DEFAULT NULL');
        return $ok = true;
    } catch (Throwable $e) {
        error_log('Destinify: reviews.edited_at is not available: ' . $e->getMessage());
        return $ok = false;
    }
}

// Password reset requests and one-time reset links. A row with token_hash NULL is a request waiting for an admin.
function ensure_resets(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    db()->exec('CREATE TABLE IF NOT EXISTS password_resets (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        token_hash CHAR(64) NULL,
        via VARCHAR(10) NOT NULL DEFAULT \'user\',
        requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        used_at DATETIME NULL,
        INDEX idx_token (token_hash),
        INDEX idx_user (user_id),
        CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
}

// Anonymous usage counts for the admin Overview: destination views and search words. No user ids, no IP addresses.
function ensure_events(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    db()->exec('CREATE TABLE IF NOT EXISTS site_events (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        kind VARCHAR(10) NOT NULL,
        ref VARCHAR(120) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_kind_time (kind, created_at),
        INDEX idx_kind_ref (kind, ref)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
}

// Key/value site settings: the feedback email and the editable site content (tips, festivals, and so on).
function settings_table(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    db()->exec('CREATE TABLE IF NOT EXISTS site_settings (k VARCHAR(40) NOT NULL PRIMARY KEY, v MEDIUMTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
}

function setting_get(string $k): ?string
{
    try {
        $q = db()->prepare('SELECT v FROM site_settings WHERE k = ?');
        $q->execute([$k]);
        $v = $q->fetchColumn();
        return $v === false ? null : (string)$v;
    } catch (Throwable $e) {
        return null;   // table not created yet
    }
}

function setting_set(string $k, string $v): void
{
    settings_table();
    db()->prepare('INSERT INTO site_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)')->execute([$k, $v]);
}

// Plain text from the admin or a visitor: no angle brackets (the site shows these values as HTML), trimmed, capped.
function clean_text($s, int $max): string
{
    $s = str_replace(['<', '>', "\r"], ['', '', ''], (string)$s);
    return mb_substr(trim($s), 0, $max);
}

// A review photo arrives as a data URL made by the browser (resized JPEG). Returns the checked data URL or null.
function valid_photo($s): ?string
{
    $s = trim((string)$s);
    if ($s === '') {
        return null;
    }
    if (strlen($s) > 700000 || !preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$#', $s, $m)) {
        fail('That photo is too large or not a JPEG, PNG or WebP image.');
    }
    $bin = base64_decode($m[2], true);
    $info = $bin === false ? false : @getimagesizefromstring($bin);
    $want = ['jpeg' => IMAGETYPE_JPEG, 'png' => IMAGETYPE_PNG, 'webp' => IMAGETYPE_WEBP];
    if (!$info || $info[2] !== $want[$m[1]] || $info[0] > 4000 || $info[1] > 4000) {
        fail('That file is not a valid image.');
    }
    return $s;
}

// Audit trail for admin actions. Logging must never stop the action it records.
function admin_log(int $uid, string $msg): void
{
    try {
        db()->exec('CREATE TABLE IF NOT EXISTS admin_log (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED NULL,
            message VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        db()->prepare('INSERT INTO admin_log (user_id, message) VALUES (?, ?)')->execute([$uid, mb_substr($msg, 0, 250)]);
    } catch (Throwable $e) {
    }
}
