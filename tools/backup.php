<?php
// Scheduled database backup. Run it from the command line (it refuses to run from a web page):
//
//     php tools/backup.php                    saves backups/destinify-YYYYMMDD-HHMMSS.sql.gz and keeps the newest 14
//     php tools/backup.php --keep=30          keep the newest 30 instead
//     php tools/backup.php --dir=D:\backups   save somewhere else (an external drive is a good idea)
//
// Schedule it daily: see README > Backups (Windows Task Scheduler with tools/backup.bat, or cron with tools/backup.sh).
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Run this from the command line.\n");
}
$root = dirname(__DIR__);
require $root . '/api/dump.php';

$keep = 14;
$dir = $root . DIRECTORY_SEPARATOR . 'backups';
foreach (array_slice($argv, 1) as $a) {
    if (preg_match('/^--keep=(\d{1,4})$/', $a, $m)) {
        $keep = max(1, (int)$m[1]);
    } elseif (str_starts_with($a, '--dir=')) {
        $dir = rtrim(substr($a, 6), "/\\");
    } else {
        fwrite(STDERR, "Unknown option: $a\n");
        exit(2);
    }
}
$cfgFile = $root . '/api/config.php';
if (!is_file($cfgFile)) {
    fwrite(STDERR, "Missing api/config.php.\n");
    exit(2);
}
$CFG = require $cfgFile;
try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $CFG['db_host'], (int)$CFG['db_port'], $CFG['db_name']),
        $CFG['db_user'],
        $CFG['db_pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (Throwable $e) {
    fwrite(STDERR, 'Could not connect to the database: ' . $e->getMessage() . "\n");
    exit(1);
}
if (!is_dir($dir) && !mkdir($dir, 0750, true)) {
    fwrite(STDERR, "Could not create $dir\n");
    exit(1);
}
// Keep the folder private when it sits inside the website folder.
$ht = $dir . DIRECTORY_SEPARATOR . '.htaccess';
if (!is_file($ht)) {
    @file_put_contents($ht, "Require all denied\n");
}

$file = $dir . DIRECTORY_SEPARATOR . 'destinify-' . date('Ymd-His') . '.sql.gz';
$tmp = $file . '.part';
$gz = gzopen($tmp, 'wb9');
if (!$gz) {
    fwrite(STDERR, "Could not write $tmp\n");
    exit(1);
}
try {
    db_dump($pdo, static function (string $s) use ($gz): void {
        if (gzwrite($gz, $s) === false) {
            throw new RuntimeException('Disk full or not writable');
        }
    }, (string)$CFG['db_name']);
    gzclose($gz);
} catch (Throwable $e) {
    @gzclose($gz);
    @unlink($tmp);
    fwrite(STDERR, 'Backup failed: ' . $e->getMessage() . "\n");
    exit(1);
}
if (!rename($tmp, $file)) {
    @unlink($tmp);
    fwrite(STDERR, "Could not finish $file\n");
    exit(1);
}

// Delete the oldest backups, keeping the newest $keep.
$all = glob($dir . DIRECTORY_SEPARATOR . 'destinify-*.sql.gz') ?: [];
sort($all);   // the date in the name makes alphabetical order the same as oldest first
foreach (array_slice($all, 0, max(0, count($all) - $keep)) as $old) {
    @unlink($old);
}
printf("Saved %s (%s KB). Keeping the newest %d.\n", $file, number_format(filesize($file) / 1024, 1), $keep);
