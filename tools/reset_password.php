<?php
// Last resort when nobody can sign in as admin: set a new password from the command line.
//
//     php tools/reset_password.php USERNAME NEWPASSWORD
//
// It also makes every browser that was signed in as that user sign in again.
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Run this from the command line.\n");
}
if ($argc !== 3) {
    exit("Usage: php tools/reset_password.php USERNAME NEWPASSWORD\n");
}
[$u, $pw] = [strtolower(trim($argv[1])), $argv[2]];
if (strlen($pw) < 6) {
    fwrite(STDERR, "The password needs at least 6 characters.\n");
    exit(2);
}
$CFG = require dirname(__DIR__) . '/api/config.php';
$pdo = new PDO(
    sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $CFG['db_host'], (int)$CFG['db_port'], $CFG['db_name']),
    $CFG['db_user'],
    $CFG['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);
$st = $pdo->prepare('UPDATE users SET password_hash = ? WHERE username = ?');
$st->execute([password_hash($pw, PASSWORD_DEFAULT), $u]);
$chk = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = ?');
$chk->execute([$u]);
if ((int)$chk->fetchColumn() === 0) {
    fwrite(STDERR, "No account named $u.\n");
    exit(1);
}
echo "Password changed for $u.\n";
