<?php
// Open http://localhost/Destinify/api/health.php to check that PHP, the config and the database are working.
require __DIR__ . '/bootstrap.php';

try {
    $p = db();
    $n = (int)$p->query('SELECT COUNT(*) FROM destinations')->fetchColumn();
    out(['ok' => true, 'destinations' => $n]);   // no PHP version or user count: this page is public
} catch (PDOException $e) {
    fail('Connected, but the tables are missing. Import destinify.sql in phpMyAdmin.', 500);
}
