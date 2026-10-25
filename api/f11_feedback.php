<?php
require __DIR__.'/f11_lib.php';
try{
  $in=f11_input();$cfg=f11_cfg();$db=f11_db();
  $msg=trim((string)($in['message']??''));$name=mb_substr(trim((string)($in['name']??'')),0,100);
  $email=trim((string)($in['email']??''));if(!filter_var($email,FILTER_VALIDATE_EMAIL))$email='';
  if(mb_strlen($msg)<3||mb_strlen($msg)>2000)f11_out(['ok'=>false,'error'=>'Masyadong maikli o mahaba ang mensahe.'],400);
  f11_limit('fb:'.($_SERVER['REMOTE_ADDR']??'x'),5);
  $db->prepare("INSERT INTO f11_feedback(name,email,message)VALUES(?,?,?)")->execute([$name,$email,$msg]);
  $sent=f11_mail($cfg['admin_email'],'Destinify feedback'.($name?" mula kay $name":''),"Mula: ".($name?:'(walang pangalan)')." <".($email?:'walang email').">\n\n$msg",$email?:null);
  f11_out(['ok'=>true,'emailed'=>$sent]);
}catch(Throwable $e){f11_out(['ok'=>false,'error'=>'Server error'],500);}
