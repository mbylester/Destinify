<?php
require __DIR__.'/f11_lib.php';
try{
  $db=f11_db();$ym=date('Y-m');
  if($_SERVER['REQUEST_METHOD']==='POST'){
    $i=(int)(f11_input()['idx']??-1);if($i<0||$i>5000)f11_out(['ok'=>false],400);
    f11_limit('tr:'.($_SERVER['REMOTE_ADDR']??'x'),120);
    $db->prepare("INSERT INTO f11_views(dest_idx,ym,hits)VALUES(?,?,1) ON DUPLICATE KEY UPDATE hits=hits+1")->execute([$i,$ym]);
    f11_out(['ok'=>true]);
  }
  $s=$db->prepare("SELECT dest_idx FROM f11_views WHERE ym=? ORDER BY hits DESC LIMIT 12");$s->execute([$ym]);
  f11_out(['ok'=>true,'top'=>array_map('intval',$s->fetchAll(PDO::FETCH_COLUMN))]);
}catch(Throwable $e){f11_out(['ok'=>false,'top'=>[]],500);}
