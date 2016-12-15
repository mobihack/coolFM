<?php
require ('init.php');

header('Content-type: application/json');

$type=(isset($_GET['type']))?$_GET['type']:null;
$file=(isset($_GET['file']) and strpos($_GET['file'], $config_filedir)===0 and is_file($_GET['file']))?$_GET['file']:null;
if($file==null and $type!='scan'){
    die('["Unknown Parameters"]');
}

switch ($type):
    case 'scan':
        if($config_cache==true and is_file('cache/scan.cache') and filemtime('cache/scan.cache')<(time()-$config_cache_time)){
            include 'cache/scan.cache';
            die();
        }

        $response = scan($config_filedir);

        $content= json_encode(array(
            "name" => basename($config_filedir),
            "type" => "folder",
            "path" => $config_filedir,
            "items" => $response
        ));
        echo $content;
        if($config_cache==true){
            file_put_contents('cache/scan.cache',$content);
        }
        break;
    case 'fileDetails':
        sleep(1);
        $content= json_encode(array(
            "filemtime" => array('Modification Time',date('D jS F, Y', filemtime($file)))
        ));
        echo $content;
        break;
    default:
        die('["Unknown Parameters"]');
        break;
endswitch;

?>