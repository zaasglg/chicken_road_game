<?php 
	error_reporting(0);
	ini_set('display_errors', 0);
	ob_start();
	require_once 'init.php';
	ob_end_clean();
	header('Content-Type: application/json');
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	
	// Определяем константы для роутинга
	$uri = $_SERVER['REQUEST_URI'];
	if (preg_match('#/api/([^/]+)/([^/?]+)#', $uri, $matches)) {
		define('CONTROLLER', $matches[1]);
		define('ACTION', $matches[2]);
	} else {
		define('CONTROLLER', isset($_GET['controller']) ? $_GET['controller'] : '');
		define('ACTION', isset($_GET['action']) ? $_GET['action'] : '');
	}
	
	try {
	$post = $_REQUEST; 
	$input = json_decode( file_get_contents('php://input'), 1, 1024 ); 
	$return = array('error'=>1, 'msg'=>"UNAUTHORIZED"); 

	$data = array_merge( $post, $input ? $input : [] );
	
	// В демо режиме всегда создаем пользователя
	if (!isset($_SESSION['user'])) {
		$_SESSION['user'] = [
			'uid' => 'demo_' . uniqid(),
			'balance' => 500,
			'host_id' => 0,
			'name' => 'Demo User',
			'img' => rand(1, 70)
		];
	}

	$fields = isset( $data['fields'] ) ? $data['fields'] : false; 
	$cond = isset( $data['cond'] ) ? $data['cond'] : false; 

	//var_dump( $input );

	$CLASS = "";
//
// VARIABLES
//
	function cmp_function($a, $b, $c){ return ($a[$c] > $b[$c]); } // ASC  uasort($array, 'cmp_function');
	function cmp_function_desc($a, $b, $c){ return ($a[$c] < $b[$c]); } // DESC  uasort($array, 'cmp_function_desc');

	switch( CONTROLLER ){ 
		case "bets": $CLASS = Bets::getInstance(); break; 
		case "cfs": $CLASS = Cfs::getInstance(); break; 
		case "games": $CLASS = Games::getInstance(); break; 
		case "users": $CLASS = Users::getInstance(); break; 

		case "settings": 
			if( isset( $data['play_sounds'] ) ){ $_SESSION['play_sounds'] = $data['play_sounds']; } 
			if( isset( $data['play_music'] ) ){ $_SESSION['play_music'] = $data['play_music']; }
			$return = ['res'=>['sound'=>$_SESSION['play_sounds'], 'music'=>$_SESSION['play_sounds']], 'data'=>$data];
			break; 
	}

	switch( ACTION ){
		case "add": $return = $CLASS->add( $data ); break; 
		case "edit": $return = $CLASS->edit( $data ); break; 
		case "load": $return = $CLASS->load( $data ); break; 
		case "get": $return = $CLASS->get( $data ); break;  
		// users 
		case "auth": $return = $CLASS->auth( $data ); break;
		case "reg": $return = $CLASS->reg( $data ); break; 
		case "balance": $return = $CLASS->balance( $data ); break; 
		// cf
		case "next": $return = $CLASS->next( $data ); break;
		case "bulk": $return = $CLASS->bulk( $data ); break;  
		case "current": $return = $CLASS->current( $data ); break;  
		// games  
		case "search": $return = $CLASS->search( $data ); break; 
		case "history": $return = $CLASS->history( $data ); break; 
		case "close": $return = $CLASS->close( $data ); break; 
		// bets 
		case "move": $return = $CLASS->move( $data ); break; 
		case "fire": $return = $CLASS->fire( $data ); break;
		// game results
		case "save_game_result": $return = $CLASS->save_game_result( $data ); break;
		case "get_user_balance": $return = $CLASS->get_user_balance( $data ); break;
		case "update_balance": $return = $CLASS->updateBalance( $data ); break; 
		// telegram notifications

	}

	} catch (Exception $e) {
		$return = ['error' => 1, 'msg' => $e->getMessage()];
	}
	
	// Очищаем любой возможный вывод перед JSON
	ob_clean();
	echo json_encode( $return );
	exit();