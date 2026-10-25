<?php
require __DIR__.'/f11_lib.php';
try{
  $in=f11_input();$cfg=f11_cfg();$db=f11_db();$act=$in['action']??'';$ip=$_SERVER['REMOTE_ADDR']??'x';
  if($act==='request'){
    $email=strtolower(trim($in['email']??''));
    if(!filter_var($email,FILTER_VALIDATE_EMAIL))f11_out(['ok'=>false,'error'=>'Hindi tamang email.'],400);
    f11_limit("pw:$ip",5);
    $s=$db->prepare($cfg['find_user_sql']);$s->execute([$email]);$u=$s->fetch(PDO::FETCH_ASSOC);
    if($u){
      $t=bin2hex(random_bytes(32));
      $db->prepare("INSERT INTO f11_resets(user_id,token_hash,expires_at)VALUES(?,?,DATE_ADD(NOW(),INTERVAL 1 HOUR))")->execute([$u['id'],hash('sha256',$t)]);
      $link=rtrim($cfg['site_url'],'/').'/?reset='.$t;
      f11_mail($email,'I-reset ang password mo sa Destinify',"Kumusta ".($u['username']??'')."!\n\nPara mag-set ng bagong password, buksan ito (valid sa loob ng 1 oras):\n$link\n\nKung hindi ikaw ang humiling nito, balewalain mo lang ang email na ito.");
    }
    // Pareho ang sagot kahit walang account, para hindi mahulaan kung sino ang may account.
    f11_out(['ok'=>true,'message'=>'Kung may account sa email na iyon, may ipinadala kaming link.']);
  }
  if($act==='confirm'){
    $pw=(string)($in['password']??'');$t=(string)($in['token']??'');
    if(strlen($pw)<8)f11_out(['ok'=>false,'error'=>'Hindi bababa sa 8 character ang password.'],400);
    f11_limit("pwc:$ip",10);
    $s=$db->prepare("SELECT id,user_id FROM f11_resets WHERE token_hash=? AND used=0 AND expires_at>NOW()");
    $s->execute([hash('sha256',$t)]);$r=$s->fetch(PDO::FETCH_ASSOC);
    if(!$r)f11_out(['ok'=>false,'error'=>'Expired o gamit na ang link. Humiling ng bago.'],400);
    $db->prepare($cfg['set_password_sql'])->execute([password_hash($pw,PASSWORD_DEFAULT),$r['user_id']]);
    $db->prepare("UPDATE f11_resets SET used=1 WHERE user_id=?")->execute([$r['user_id']]);
    f11_out(['ok'=>true,'message'=>'Napalitan na ang password. Pwede ka nang mag-sign in.']);
  }
  f11_out(['ok'=>false,'error'=>'Hindi kilalang action'],400);
}catch(Throwable $e){f11_out(['ok'=>false,'error'=>'Server error. Tingnan ang api/f11_config.php at ang SQL query.'],500);}
