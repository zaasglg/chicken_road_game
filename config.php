<?php
//
//
	if( !defined('BASE_DIR') ){
		define('BASE_DIR', dirname(__FILE__)."/");
	}
	define('SAVESERVER', false);			// отъебитесь я занят
	define('ONREPAIR', false);				// система на ремонте
	define('SYSTIME', time() );
	define('SITE_URL', isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : "" );
	define('ORDER_EMAIL', "support@valor-games.com");
	define('BASE_SITE', SITE_URL ); 
	define('BASE_TITLE', "CHICKEN-ROAD"); 
	define('VER', "LCST v.0.1b" );			// автор )
	define('MAX_WHILE', 256); 				// максимум итераций для while
	define('BASIC_LENGTH', 10);				// размер возвращаемых из базы массивов
	define('BASIC_USER_ROLE', 3);			// роль нового пользователя (юзер)
	define('MAX_PHOTOSIZE', 3145728);		// максимальный размер фотки
	define('SALT', "HIDDEN_WORDS"); 		// соль для паролей

	define('TRACE_MYSQL', false );	
	define('DEBUG_MODE', false ); 
	//
	// NAVIGATION
	//
	define('CLASS_DIR', BASE_DIR ."classes/");
	define('CLASS_EXT', ".class.php");
	define('MODELS_DIR', BASE_DIR ."models/");
	define('TPL_DIR', BASE_DIR ."templates/"); 
	define('TPL_EXT', ".tpl.php");
	define('INC_DIR', BASE_DIR ."controllers/"); 
	define('INC_EXT', ".inc.php"); 
	define('TRAITS_DIR', BASE_DIR ."traits/"); 
	define('TRAITS_EXT', '.trait.php');

	define('CURRENCY', "USD");
	//
	// DEMO MODE - NO DATABASE
	//
	define('DEMO_MODE', true);
	define('LOREM', "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");











