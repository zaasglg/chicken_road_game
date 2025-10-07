<?php
	//
	// GAME DATA
	//
	define('HOST_ID', ( isset( $_REQUEST['user_id'] ) ? $_REQUEST['user_id'] : 'demo' )); 
    $rates = [
        'Argentina'=> 1, 
        'Colombia'=> 1, 
        'Ecuador'=> 1 
    ];
    
    // Если мы запущены в iframe из valorgames, используем данные оттуда
    if( defined('AUTH') && defined('SYS_BALANCE') && AUTH ){ 
    	// Пользователь авторизован в основной системе
    	$_SESSION['USER_RATE'] = isset( $rates[ SYS_COUNTRY ] ) ? $rates[ SYS_COUNTRY ] : 1; 
    	$ex = Users::GI()->get(['host_id'=>(int)UID]); 
    	if( $ex ){ 
    		// Обновляем баланс из основной системы
    		Users::GI()->edit(['uid'=>$ex['uid'], 'balance'=>(SYS_BALANCE / $_SESSION['USER_RATE'])]);
    		$_SESSION['user'] = Users::GI()->get(['uid'=>$ex['uid']]); 
    	}
    	else {
    		// Создаем нового пользователя с данными из основной системы
    		$new_user = [
	    		'name'=> 'User_' . substr(UID, -4), 
	    		'real_name'=> 'User_' . substr(UID, -4),  
	    		'host_id'=> UID, 
	    		'balance'=> SYS_BALANCE / $_SESSION['USER_RATE']  
	    	];
	    	$_SESSION['user'] = Users::GI()->add( $new_user ); 
	    	$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
    	}
    	$_SESSION['AUTH'] = UID;
    }
    // Демо режим или автономная работа
    else {
    	if( HOST_ID != 'demo' ){ 
    		// Создаем пользователя с переданным ID
    		if( !isset( $_SESSION['user']['uid'] ) ){ 
	    		$_SESSION['USER_RATE'] = 1; 
	    		$ex = Users::GI()->get(['host_id'=>(int)HOST_ID]); 
	    		if( $ex ){ 
	    			$_SESSION['user'] = $ex;
	    		} else {
	    			$new_user = [
			    		'name'=> 'User_' . substr(HOST_ID, -4), 
			    		'real_name'=> 'User_' . substr(HOST_ID, -4),  
			    		'host_id'=> HOST_ID, 
			    		'balance'=> 500  
			    	];
		    		$_SESSION['user'] = Users::GI()->add( $new_user );
		    		$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
	    		}
	    		$_SESSION['AUTH'] = HOST_ID; 
	    	}
    	} 
    	else {
    		// Демо режим
    		if( !isset( $_SESSION['user']['uid'] ) ){ 
	    		$_SESSION['USER_RATE'] = 1; 
	    		$_SESSION['user'] = Users::GI()->add([]); 
	    		$_SESSION['user'] = isset( $_SESSION['user']['data'] ) ? $_SESSION['user']['data'] : [];
	    		$_SESSION['user']['real_name'] = $_SESSION['user']['name']; 
	    		$_SESSION['AUTH'] = false; 
	    	}
    	}
    }
    //} 
    //define('USER_RATE', $_SESSION['USER_RATE']); 
