<?php 
    $link = "";
    $request_uri = isset( $_REQUEST['route'] ) && $_REQUEST['route'] ? $_REQUEST['route'] : $_SERVER['REQUEST_URI'];
	if( $request_uri ){
		$link = explode('?', $request_uri );
		$link = explode('/', preg_replace('/^\//', '', $link[0] ) );
	} 
	$body =  $link ? $link : array(""); 

	$api_index = array_search('api', $body);
	if( $api_index !== false ){ 
		define('ISAPI', true );
		define('CONTROLLER', isset( $body[$api_index+1] ) ? $body[$api_index+1] : "" );
		define('ACTION', isset( $body[$api_index+2] ) ? $body[$api_index+2] : "" ); 
		define('ITEM_ID',  isset( $body[$api_index+3] ) ? App::uid( $body[$api_index+3] ) : ( isset( $body[$api_index+2] ) ? App::uid($body[$api_index+2]) : "" ) );
		define('ITEM_PARAM', isset( $body[$api_index+4] ) ? App::uid( $body[$api_index+4] ) : ( isset( $body[$api_index+3] ) ? App::uid( $body[$api_index+3] ) : ( isset( $body[$api_index+2] ) ? App::uid($body[$api_index+2]) : "" ) ) );
		define('ITEM_ADD', isset( $body[$api_index+4] ) ? App::uid( $body[$api_index+4] ) : ( isset( $body[$api_index+3] ) ? App::uid( $body[$api_index+3] ) : ( isset( $body[$api_index+2] ) ? App::uid($body[$api_index+2]) : "" ) ) );
	}
	elseif( in_array('api.php', $body) ){
		define('ISAPI', true );
		define('CONTROLLER', isset( $_REQUEST['controller'] ) ? $_REQUEST['controller'] : "" );
		define('ACTION', isset( $_REQUEST['action'] ) ? $_REQUEST['action'] : "" ); 
		define('ITEM_ID', isset( $_REQUEST['id'] ) ? App::uid( $_REQUEST['id'] ) : "" );
		define('ITEM_PARAM', isset( $_REQUEST['param'] ) ? App::uid( $_REQUEST['param'] ) : "" );
		define('ITEM_ADD', isset( $_REQUEST['add'] ) ? App::uid( $_REQUEST['add'] ) : "" );
	}
	else {
		define('ISAPI', false);
		define('CONTROLLER', ( $body[0] ? $body[0] : "main" ) );
		define('ACTION', isset( $body[1] ) ? $body[1] : "" ); 
		define('ITEM_ID', isset( $body[2] ) ? App::uid( $body[2] ) : ( isset( $body[1] ) ? App::uid($body[1]) : "" ) );
		define('ITEM_PARAM', isset( $body[3] ) ? App::uid( $body[3] ) : ( isset( $body[2] ) ? App::uid( $body[2] ) : ( isset( $body[1] ) ? App::uid($body[1]) : "" ) ) );
		define('ITEM_ADD', isset( $body[4] ) ? App::uid( $body[4] ) : ( isset( $body[3] ) ? App::uid( $body[3] ) : ( isset( $body[2] ) ? App::uid($body[2]) : "" ) ) );
	}

	if( ISAPI ){ header("Content-Type: text/json; charset=utf-8"); } 
	else { header("Content-Type: text/html; charset=utf-8"); } 

    if( !ISAPI ){ 
        if( defined('CONTROLLER') ){ 
            $controller = TPL_DIR . CONTROLLER . INC_EXT;
            if( is_file( $controller ) ){ 
                include_once $controller; 
            }
            if( CONTROLLER ){ 
                switch( CONTROLLER ){ 
                    // авторизация
                    case "auth": define('TPL', AUTH ? "main" : "auth" ); break; 
                    // служебка для капчи
                    case "captcha": include_once BASE_DIR ."captcha.inc.php"; exit(); break;  
                    // служебка получить изображение
                    case "image": Image::get( ACTION ); exit(); break;  
                    // выход из системы
                    case "logout": Users::logout(); exit(); break; 
                    // главная
                    case "main": define('TPL', "main"); break; 
                    // игра chicken-road
                    case "chicken-road": define('TPL', "main"); break; 
                    // служебка загрузка файлов
                    case "upload": include_once BASE_DIR ."upload.php"; exit(); break;  
                    // настройки
                    case "stat": define('TPL', "stat"); break; 

                } 
            }
            else { 
                define('TPL', "main" );
            }
        } 
        else {
            define('CONTROLLER', "main");
            define('TPL', "main" );
        } 
    }


