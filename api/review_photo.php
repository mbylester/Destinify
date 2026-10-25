<?php
// Serves the photo attached to one review as a plain image. Public, like the review text itself.
require __DIR__ . '/bootstrap.php';

$id = (int)($_GET['id'] ?? 0);
$data = null;
if ($id > 0 && reviews_have_photo()) {
    $q = db()->prepare('SELECT photo FROM reviews WHERE id = ?');
    $q->execute([$id]);
    $data = $q->fetchColumn();
}
if (!is_string($data) || !preg_match('#^data:(image/(?:jpeg|png|webp));base64,(.+)$#s', $data, $m)) {
    header_remove('Content-Type');
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'No photo';
    exit;
}
$bin = base64_decode($m[2], true);
if ($bin === false) {
    http_response_code(404);
    exit;
}
header_remove('Content-Type');
header('Content-Type: ' . $m[1]);
header('Content-Length: ' . strlen($bin));
header_remove('Pragma');
header_remove('Expires');
header('Cache-Control: public, max-age=86400');   // a review's photo never changes; deleting the review removes it
header("Content-Security-Policy: default-src 'none'; sandbox");
echo $bin;
