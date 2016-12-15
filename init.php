<?php
$config_filedir = '../';
$config_cache=false;
$config_cache_time=3600;
$config_sleep=0;//int only

function scan($dir){
    $files = array();

    // Is there actually such a folder/file?

    if(file_exists($dir)){
        $folderContent=scandir($dir);

        foreach($folderContent as $f) {

            if(!$f || $f[0] == '.') {
                continue; // Ignore hidden files
            }

            if(is_dir($dir . '/' . $f)) {
                $sz=get_dir_size($dir .'/'. $f);
                if($sz==false)
                    $sz=0;//var_dump($f);
                // The path is a folder
                $files[] = array(
                    "name" => $f,
                    "type" => "folder",
                    "path" => str_replace('//','/',$dir. '/' . $f),
                    "size" => "$sz", // Gets the size of this file
                    "items" => scan($dir . '/' . $f) // Recursively get the contents of the folder
                );
            }
            else {

                // It is a file
                $sz=@filesize($dir . '/' . $f);
                if($sz==false)
                    $sz=0;//var_dump($f);
                $files[] = array(
                    "name" => utf8_encode($f),
                    "type" => "file",
                    "path" => utf8_encode($dir . '/' . $f),
                    "size" => "$sz" // Gets the size of this file
                );
            }
        }

    }

    return $files;
}


function get_dir_size($dir_name){
    $dir_size =0;
    if (is_dir($dir_name)) {
        if ($dh = scandir($dir_name)) {
            foreach ($dh as $file){
                if($file !='.' && $file != '..'){
                    if(is_file($dir_name.'/'.$file)){
                        $dir_size += filesize($dir_name.DIRECTORY_SEPARATOR.$file);
                    }
                    else if(is_dir($dir_name.DIRECTORY_SEPARATOR.$file)){
                        $dir_size +=  get_dir_size($dir_name.DIRECTORY_SEPARATOR.$file);
                    }

                }
            }
        }
    }
    return $dir_size;
}

?>
