<?php

	abstract class Singleton {
		public static $instances = Array();
		public static function getInstance( $c=null, $name="", $params=array() ){
			if( is_null($c) ){
				$c = get_called_class();
			}
			if( $name == '' ){ 
				$name = $c;                                                                                           
            }                                                                                                
    		if( !isset( Singleton::$instances[ $name ] ) ){ 
    			Singleton::$instances[ $name ] = new $c( $params );
    		}
    		return Singleton::$instances[ $name ];
		}
		public function is_assoc( $arr ){
    		return ( is_array($arr) && ( !count($arr) || count( array_filter( array_keys($arr), 'is_string' ) ) == count( $arr ) ) );
		}
		public function __clone(){
			//throw new HTS_Exception('Singletone clonning is not permitted. Just becase it\'s non-sense.');
		}
		public static function GI(){
			return Singleton::getInstance( get_called_class() );
		}	
	}
