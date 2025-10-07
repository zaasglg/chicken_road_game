<?php
	//
	// GAME DATA
	//
	define('HOST_ID', ( isset( $_REQUEST['user_id'] ) ? $_REQUEST['user_id'] : 'demo' )); 
    $rates = [
        'Argentina'=> 1400, 
        'Colombia'=> 4500, 
        'Ecuador'=> 25000 
    ];
    //if( !isset( $_SESSION['user']['uid'] ) ){ 
    	if( HOST_ID != 'demo' ) { 
    		// Временно отключаем подключение к основной БД для демо
    		/*
    		$Q = "SELECT * 
    			FROM `users` 
    			WHERE `user_id`='". HOST_ID ."'";
    		$main_user = DB2::GI()->get($Q); 
    		if( isset( $main_user['user_id'] ) && $main_user['user_id'] ){ 
    			//var_dump( $main_user );
    			$_SESSION['USER_RATE'] = isset( $rates[ $main_user['country'] ] ) ? $rates[ $main_user['country'] ] : 1; 
    			$ex = Users::GI()->get(['host_id'=>(int)HOST_ID]); 
    			if( $ex ){ 
    				Users::GI()->edit(['uid'=>$ex['uid'], 'balance'=>($main_user['deposit'] / $_SESSION['USER_RATE'])]);
    				$_SESSION['user'] = Users::GI()->get(['uid'=>$ex['uid']]); 
    				$_SESSION['user']['real_name'] = $main_user['email']; 
    			}
    			else {
    				$new_user = [
			    		'name'=> substr( $main_user['email'], 0, 1 ) .'...'. substr( $main_user['email'], ( strlen( $main_user['email'] )-1 ), 1 ), 
			    		'real_name'=> substr( $main_user['email'], 0, 8 ),  
			    		'host_id'=> HOST_ID, 
			    		'balance'=> $main_user['deposit'] / $_SESSION['USER_RATE']  
			    	];
			    	$_SESSION['user'] = Users::GI()->add( $new_user ); 
			    	$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
			    	$_SESSION['user']['real_name'] = $main_user['email']; 
    			}
    			$_SESSION['AUTH'] = $main_user['user_id'];
    		}
    		else { 
    			//var_dump( $main_user );
    			if( !isset( $_SESSION['user']['uid'] ) && ( isset( $_SESSION['user']['host_id'] ) && $_SESSION['user']['host_id'] ) ){ 
	    			$_SESSION['USER_RATE'] = 1; 
	    			$_SESSION['user'] = Users::GI()->add([]); 
	    			$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
	    			$_SESSION['user']['real_name'] = $_SESSION['user']['name']; 
	    			$_SESSION['AUTH'] = false; 
	    		}
    		}
    		*/
    		// Создаем демо пользователя
    		if( !isset( $_SESSION['user']['uid'] ) ){ 
	    		$_SESSION['USER_RATE'] = 1; 
	    		$_SESSION['user'] = Users::GI()->add([]); 
	    		$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
	    		$_SESSION['user']['real_name'] = $_SESSION['user']['name']; 
	    		$_SESSION['AUTH'] = false; 
	    	}
    	} 
    	else {
    		if( !isset( $_SESSION['user']['uid'] ) || ( isset( $_SESSION['user']['host_id'] ) && $_SESSION['user']['host_id'] ) ){ 
	    		$_SESSION['USER_RATE'] = 1; 
	    		$_SESSION['user'] = Users::GI()->add([]); 
	    		$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
	    		$_SESSION['user']['real_name'] = $_SESSION['user']['name']; 
	    		$_SESSION['AUTH'] = false; 
	    	}
    	}
    //} 
    //define('USER_RATE', $_SESSION['USER_RATE']); 







