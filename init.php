<?php 
	error_reporting( E_ALL | E_STRICT );
	ini_set( 'display_errors', 'On' );
	ini_set("max_execution_time", 30); 
	ini_set('session.gc_maxlifetime', 43200);
	ini_set('session.cookie_lifetime', 43200);
	session_set_cookie_params(0);
	ini_set("session.use_cookies", 1 ); 
	// session.use_only_cookies = 1
	ini_set("session.use_trans_sid", "off");
	if( session_id() == '' ){ session_start(); }
	ini_set('memory_limit', '128M');
	ini_set("file_uploads", 1);
	ini_set("upload_tmp_dir", "/tmp");
	ini_set("upload_max_filesize", "10M");
	ini_set("max_file_uploads", 3);

	//date_default_timezone_set('Europe/Moscow');
	//header("Content-Type: text/html; charset=utf-8");
	header("Access-Control-Allow-Origin:*");
    //header("Access-Control-Allow-Credentials=true");

	if( !defined('BASE_DIR') ){
		define('BASE_DIR', dirname(__FILE__)."/");
	}

	include_once BASE_DIR ."config.php"; 
	//
	function cls( $class ){ 
		$filePath = CLASS_DIR . str_replace('_',"/", $class) .CLASS_EXT; 
		if( is_file( $filePath ) ){ require_once( $filePath ); }
		else { 
			$filePath = MODELS_DIR . str_replace('_',"/", $class) .CLASS_EXT; 
			if( is_file( $filePath ) ){ require_once( $filePath ); }
			else { 
				//$filePath = stream_resolve_include_path( TRAITS_DIR . $traitName . TRAITS_EXT );
				$filePath = stream_resolve_include_path( TRAITS_DIR . $class . TRAITS_EXT );
				if( is_file( $filePath ) ){ require_once $filePath; }
				else { echo '<h1>include error: '. $class .'</h1>'; }
			}
		}
	}
	spl_autoload_register( 'cls' );  

	//include_once BASE_DIR ."errorhandler.php"; 

	$input = json_decode( file_get_contents('php://input'), 1, 1024 );
	//
	// SETTINGS
	//
	define('ROBOT', isset( $_SESSION['ROBOT'] ) ? false : true );
	define('AUTH', isset( $_SESSION['AUTH'] ) && $_SESSION['AUTH'] ? $_SESSION['AUTH'] : false ); 
	define('UID', ( isset( $_SESSION['UID'] ) ? $_SESSION['UID'] : ( isset( $_SESSION['user']['uid'] ) ? $_SESSION['user']['uid'] : false ) ) );  
	//
	//
	if( isset( $_SESSION['ADMIN'] ) ){ define('ADMIN', $_SESSION['ADMIN'] ); } 
	else {
		if( isset( $_SESSION['user']['role_name'] ) && $_SESSION['user']['role_name'] == "ADMIN" ){ 
			$_SESSION['ADMIN'] = true;
			define('ADMIN', true ); 
		} 
		else { define('ADMIN', false ); }
	}  
	




	