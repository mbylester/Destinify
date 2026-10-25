<?php
function f11_out($d,$code=200){http_response_code($code);header('Content-Type: application/json');echo json_encode($d);exit;}
function f11_cfg(){static $c;if(!$c){$f=__DIR__.'/f11_config.php';if(!is_file($f))f11_out(['ok'=>false,'error'=>'Wala pang api/f11_config.php'],500);$c=require $f;}return $c;}
function f11_db(){
  static $p;if($p)return $p;$d=f11_cfg()['db'];
  $p=new PDO("mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4",$d['user'],$d['pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  $p->exec("CREATE TABLE IF NOT EXISTS f11_resets(id INT AUTO_INCREMENT PRIMARY KEY,user_id INT NOT NULL,token_hash CHAR(64) NOT NULL,expires_at DATETIME NOT NULL,used TINYINT NOT NULL DEFAULT 0,INDEX(token_hash))");
  $p->exec("CREATE TABLE IF NOT EXISTS f11_feedback(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100),email VARCHAR(150),message TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
  $p->exec("CREATE TABLE IF NOT EXISTS f11_views(dest_idx INT NOT NULL,ym CHAR(7) NOT NULL,hits INT NOT NULL DEFAULT 0,PRIMARY KEY(dest_idx,ym))");
  $p->exec("CREATE TABLE IF NOT EXISTS f11_ratelimit(id INT AUTO_INCREMENT PRIMARY KEY,k VARCHAR(80),ts INT,INDEX(k,ts))");
  return $p;
}
function f11_input(){$j=json_decode(file_get_contents('php://input'),true);return is_array($j)?$j:$_POST;}
function f11_limit($key,$max,$win=900){
  $db=f11_db();$db->prepare("DELETE FROM f11_ratelimit WHERE ts<?")->execute([time()-$win]);
  $s=$db->prepare("SELECT COUNT(*) FROM f11_ratelimit WHERE k=?");$s->execute([$key]);
  if($s->fetchColumn()>=$max)f11_out(['ok'=>false,'error'=>'Masyadong maraming subok. Subukan ulit mamaya.'],429);
  $db->prepare("INSERT INTO f11_ratelimit(k,ts)VALUES(?,?)")->execute([$key,time()]);
}
// Maliit na SMTP client (walang kailangang i-install). Kailangan ng openssl extension (naka-on sa XAMPP).
function f11_mail($to,$subject,$body,$replyTo=null){
  $c=f11_cfg()['smtp'];$pass=str_replace(' ','',$c['pass']);
  $fp=@stream_socket_client(($c['secure']==='ssl'?'ssl://':'').$c['host'].':'.$c['port'],$en,$es,15);
  if(!$fp)return false;stream_set_timeout($fp,15);
  $rd=function()use($fp){$r='';while(($l=fgets($fp,515))!==false){$r.=$l;if(strlen($l)<4||$l[3]===' ')break;}return $r;};
  $cmd=function($s,$ok)use($fp,$rd){if($s!==null)fwrite($fp,$s."\r\n");return strpos($rd(),(string)$ok)===0;};
  if(!$cmd(null,220)||!$cmd('EHLO localhost',250))return false;
  if($c['secure']==='tls'){
    if(!$cmd('STARTTLS',220)||!stream_socket_enable_crypto($fp,true,STREAM_CRYPTO_METHOD_TLS_CLIENT)||!$cmd('EHLO localhost',250))return false;
  }
  if(!$cmd('AUTH LOGIN',334)||!$cmd(base64_encode($c['user']),334)||!$cmd(base64_encode($pass),235))return false;
  if(!$cmd("MAIL FROM:<{$c['user']}>",250)||!$cmd("RCPT TO:<$to>",250)||!$cmd('DATA',354))return false;
  $h="From: =?UTF-8?B?".base64_encode($c['from_name'])."?= <{$c['user']}>\r\nTo: <$to>\r\n"
    .($replyTo?"Reply-To: <$replyTo>\r\n":'')
    ."Subject: =?UTF-8?B?".base64_encode($subject)."?=\r\nDate: ".date('r')."\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    .chunk_split(base64_encode($body));
  $ok=$cmd($h."\r\n.",250);fwrite($fp,"QUIT\r\n");fclose($fp);return $ok;
}
