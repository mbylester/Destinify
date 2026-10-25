<?php
// Writes the whole database as plain SQL (CREATE TABLE and INSERT statements) that phpMyAdmin or the mysql command can import.
// Used by api/backup.php (the admin's Download button) and tools/backup.php (the scheduled backup). It only defines a function.

/**
 * @param PDO      $pdo   an open connection
 * @param callable $out   called with each chunk of SQL text, in order
 * @param string   $label name of the database, only written in a comment
 */
function db_dump(PDO $pdo, callable $out, string $label = ''): void
{
    // Without this, MySQL would hold every row of a big table (review photos can be large) in memory at once.
    try {
        $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
    } catch (Throwable $e) {
    }
    $q = static function (string $name): string {
        return '`' . str_replace('`', '``', $name) . '`';
    };

    $out("-- Destinify database backup\n-- Database: " . $label . "\n-- Created: " . gmdate('Y-m-d H:i:s') . " UTC\n"
        . "-- Restore: phpMyAdmin > Import, or:  mysql -u USER -p < this-file.sql  (it replaces the tables listed below)\n\n"
        . "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\nSET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n\n");

    $tables = [];
    $st = $pdo->query('SHOW FULL TABLES WHERE Table_type = \'BASE TABLE\'');
    foreach ($st->fetchAll(PDO::FETCH_NUM) as $r) {
        $tables[] = (string)$r[0];
    }
    $st->closeCursor();
    sort($tables);

    foreach ($tables as $t) {
        $cr = $pdo->query('SHOW CREATE TABLE ' . $q($t));
        $row = $cr->fetch(PDO::FETCH_NUM);
        $cr->closeCursor();
        $out('DROP TABLE IF EXISTS ' . $q($t) . ";\n" . (string)$row[1] . ";\n\n");

        if ($t === 'rate_limits') {
            continue;   // throw-away counters, not worth saving
        }
        $rows = $pdo->query('SELECT * FROM ' . $q($t));
        $cols = null;
        $batch = [];
        $size = 0;
        $flush = function () use (&$batch, &$size, &$cols, $out, $q, $t): void {
            if ($batch) {
                $out('INSERT INTO ' . $q($t) . ' (' . implode(',', array_map($q, $cols)) . ") VALUES\n" . implode(",\n", $batch) . ";\n");
                $batch = [];
                $size = 0;
            }
        };
        while (($r = $rows->fetch(PDO::FETCH_ASSOC)) !== false) {
            if ($cols === null) {
                $cols = array_keys($r);
            }
            $vals = [];
            foreach ($r as $v) {
                if ($v === null) {
                    $vals[] = 'NULL';
                } elseif (is_int($v) || is_float($v)) {
                    $vals[] = (string)$v;
                } else {
                    $vals[] = $pdo->quote((string)$v);
                }
            }
            $line = '(' . implode(',', $vals) . ')';
            $batch[] = $line;
            $size += strlen($line);
            if (count($batch) >= 100 || $size > 500000) {
                $flush();
            }
        }
        $rows->closeCursor();
        $flush();
        $out("\n");
    }
    $out("SET FOREIGN_KEY_CHECKS=1;\n-- End of backup\n");
}
