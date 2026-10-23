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

session_name($CFG['session_name'] ?? 'destinify_sid');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
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

function me(): ?array
{
    if (empty($_SESSION['uid'])) {
        return null;
    }
    $s = db()->prepare('SELECT id, username, display_name, role FROM users WHERE id = ?');
    $s->execute([(int)$_SESSION['uid']]);
    $u = $s->fetch();
    return $u ? $u : null;
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
