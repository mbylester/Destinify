<?php
// Open http://localhost/Destinify/api/health.php to check that PHP, the config and the database are working.
require __DIR__ . '/bootstrap.php';

try {
    $p = db();
    $n = (int)$p->query('SELECT COUNT(*) FROM destinations')->fetchColumn();
    $u = (int)$p->query('SELECT COUNT(*) FROM users')->fetchColumn();
    out(['ok' => true, 'php' => PHP_VERSION, 'destinations' => $n, 'users' => $u]);
} catch (PDOException $e) {
    fail('Connected, but the tables are missing. Import destinify.sql in phpMyAdmin.', 500);
}
