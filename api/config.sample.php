<?php
// Copy this file to config.php and edit it. config.php is listed in .gitignore, so your password is never uploaded.
// The defaults match a fresh XAMPP install (user root, no password).
return [
    'db_host'      => '127.0.0.1',
    'db_port'      => 3306,
    'db_name'      => 'destinify_app',
    'db_user'      => 'root',
    'db_pass'      => '',
    'session_name' => 'destinify_sid',
    // Set to true on a live HTTPS site (needed when a proxy or host ends TLS before PHP). Keep false for http://localhost.
    'force_https_cookie' => false,
    // Optional. Where the Send feedback form sends mail. You can also set this later in Admin console > Reports & backup.
    'contact_email' => '',
];
