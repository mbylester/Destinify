<?php
// Admin only. POST returns the whole database as one .sql file (the "Download database backup" button).
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/dump.php';

$u = need_admin();
need_post();
throttle_check('backup:user:' . (int)$u['id'], 6, 3600);   // a big dump is heavy, so only a few an hour
throttle_hit('backup:user:' . (int)$u['id']);

@set_time_limit(0);
$name = 'destinify-backup-' . date('Ymd-His') . '.sql';
header_remove('Content-Type');
header('Content-Type: application/sql; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $name . '"');
header('X-Content-Type-Options: nosniff');
while (ob_get_level() > 0) {
    ob_end_clean();
}
admin_log((int)$u['id'], 'Downloaded a database backup');
db_dump(db(), static function (string $s): void {
    echo $s;
    flush();
}, (string)($CFG['db_name'] ?? ''));
exit;
