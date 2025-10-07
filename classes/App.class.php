<?php
// 
// public static function test( $d=array() )
// public static function hash( $text="" )
// public static function randomstring( $length=8 )
// public static function createCookie( $name, $value='', $maxage=0, $path='', $domain='', $secure=false, $HTTPOnly=false )
// public static function uid( $t, $type=false )
//
// public static function load_image( $id="" )
// public static function delete_image( $id="" )
// public static function image( $post=array() )
// public static function images( $post=array() ) 
// public static function clear_string( $t="", $length=32 ) 
// public static function tobase( $t="", $len=256 )
// public static function frombase( $t="" )
// 
// public static function parseFloat( $d=array() )
// public static function format( $s=0 )
// public static function bablo( $s=0 )
// public static function dot_format( $d=array() )
// public static function text_to_base( $d=array() )
// public static function exec( $d=array() )	// need complete
// public static function no_zeros( $text="" )
// public static function text_2_base( $text="", $from=false )
// public static function css( $name="" )
// public static function js( $name="" )
// 
// 
// 
	class App {
// 
//====================================================================
		public static function ip(){
			if( getenv('REMOTE_ADDR') ){ 
				$user_ip = getenv('REMOTE_ADDR');
			} 
			if ( empty($user_ip) ){ 
				return false;
			}
			if ( !preg_match("/^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}$/", $user_ip) ){ 
				return false;
			}
			if( $user_ip == "127.0.0.1" ){
				return false; 
			}
			return $user_ip;
		}
// 
//====================================================================
		public static function agent(){
			return $_SERVER['HTTP_USER_AGENT'];
		}
// 
//====================================================================
		public static function activity( $d=array() ){ 
			return false; 
			$DBO = DBO::getInstance(); 
			$uid = isset( $d['uid'] ) ? App::uid( $d['uid'] ) : UID; 
			$action = isset( $d['action'] ) ? (int)$d['action'] : 1; 
			$object = isset( $d['object'] ) ? App::uid( $d['object'] ) : ""; 
			$DBO->ins( 
				TABLE_ACTIVITY, 
				array( 
					'uid'=>$uid, 
					'action'=>$action, 
					'object'=> $object, 
					'ip'=>App::ip(), 
					'agent'=>App::agent() 
				)  
			);
		}
// 
//====================================================================
		public static function test( $d=array() ){
			if( isset( $d['email'] ) ){ 
				return preg_match( "/^\w+[A-Za-z0-9\_\.\-]*@(((([a-z0-9]{2,})|([a-z0-9][-][a-z0-9]+))[\.][a-z0-9])|([a-z0-9]+[-]?))+[a-z0-9]+\.([a-z]{2,7})$/iu", $d['email'] ); 
			}
			if( isset( $d['phone'] ) ){
				return preg_match( '/^\+7\(\d{3}\)\d{7}$/iu', $d['phone'] );
			} 
			if( isset( $d['url'] ) ){

			}
			return false;
		}

		public static function clear_date( $date="" ){
			return preg_replace('/[^\d\.\-\:\s]/', '', preg_replace('/[T]/', ' ', $date) );
		}
// 
//====================================================================
		public static function hash( $text="" ){
			$t = preg_replace( '/[^a-zA-Z0-9]/i', '', $t );
			return $t;
		}
// 
//====================================================================
		public static function randomstring( $length=8 ){
			$symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.@';
			$text = "";
			$max = $strlen( $symbols );
			for( $i=0; $i<$length; $i++ ){ 
				$text .= substr( $symbols, rand(0,$max), 1 ); 
			}
			return $text;
		}
// 
//====================================================================
		public static function createCookie( $name, $value='', $maxage=0, $path='', $domain='', $secure=false, $HTTPOnly=false ){ 
			$ob = ini_get('output_buffering'); 
			if( headers_sent() && (bool) $ob === false || strtolower($ob) == 'off' ){ 
				return false; 
			}
			if( !empty($domain) ){ 
				if ( strtolower( substr($domain, 0, 4) ) == 'www.' ){ 
					$domain = substr($domain, 4); 
				}
				if ( substr($domain, 0, 1) != '.' ){
					$domain = '.'. $domain;
				}
				$port = strpos($domain, ':');
				if ( $port !== false ){ 
					$domain = substr($domain, 0, $port); 
				}
			}
			header('Set-Cookie: '. rawurlencode($name) .'='. rawurlencode($value) 
										.(empty($domain) ? '' : '; Domain='.$domain) 
										.(empty($maxage) ? '' : '; Max-Age='.$maxage) 
										.(empty($path) ? '' : '; Path='.$path) 
										.(!$secure ? '' : '; Secure') 
										.(!$HTTPOnly ? '' : '; HttpOnly'), false); 
			return true; 
		}
// 
//====================================================================
		public static function uid( $t="" ){ 
			if( is_array( $t ) ){ 
				var_dump( $t ); 
				return ""; 
			}
			else {
				$text = trim( $t );
				$text = substr( $text, 0, 32 );
				$text = preg_replace( '/[^A-Za-z0-9-_\,\.]/i', "", $text );
				$text = preg_replace('/\s*--\s*/', "", $text );
				return $text; 
			}
		}
// 
//====================================================================
		private static function _prepare( $value ){
			$value = strval($value);
			$value = stripslashes($value);
			$value = str_ireplace(array("\0", "\a", "\b", "\v", "\e", "\f"), ' ', $value);
			$value = htmlspecialchars_decode($value, ENT_QUOTES);	
			return $value;
		}
// 
//====================================================================
		public static function text( $value, $default = '' ){
			$value = self::_prepare($value);
			$value = preg_replace('/(--)/', '', $value);
			$value = str_ireplace(array("\t"), ' ', $value);			
			$value = preg_replace(array(
				'@<\!--.*?-->@s',
				'@\/\*(.*?)\*\/@sm',
				'@<([\?\%]) .*? \\1>@sx',
				'@<\!\[CDATA\[.*?\]\]>@sx',
				'@<\!\[.*?\]>.*?<\!\[.*?\]>@sx',	
				'@\s--.*@',
				'@<script[^>]*?>.*?</script>@si',
				'@<style[^>]*?>.*?</style>@siU', 
				'@<[\/\!]*?[^<>]*?>@si',			
			), ' ', $value);		
			$value = strip_tags($value); 		
			$value = str_replace(array('/*', '*/', '--', '#__'), ' ', $value); 
			$value = preg_replace('/[ ]+/', ' ', $value);			
			$value = trim($value);
			$value = htmlspecialchars($value, ENT_QUOTES);	
			return (strlen($value) == 0) ? $default : $value;
		}
//
//====================================================================
		public static function parseFloat( $d=array() ){
			if( isset( $d['from'] ) ){ 
				return ($d['from'] / 1000000); 
			}
			if( isset( $d['to'] ) ){ 
				return ($d['to'] * 1000000); 
			}
		}
// 
//====================================================================
		public static function format( $s=0 ){
			return preg_replace( '/(\d)(?=(\d{3})+(?!\d))/i', "$1 ", $s );
		}
// 
//====================================================================
		public static function bablo( $s=0 ){
			return preg_replace( '/(\d)(?=(\d{3})+(?!\d))/i', "$1 ", sprintf( "%01.2f", $s ) );
		}
// 
//====================================================================
		public static function dot_format( $d=array() ){
			$sum = isset( $d['sum'] ) ? self::guard( $d['sum'] ) : 0;
			$len = isset( $d['len'] ) ? (int)$d['len'] : 2;
			return sprintf( "%01.". $len ."f", $sum );
		}
//
//====================================================================
		public static function exec( $d=array() ){
			$ch = curl_init(); 
			curl_setopt( $ch, CURLOPT_URL, "/api" ); 
			curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true ); 
			curl_setopt( $ch, CURLINFO_HEADER_OUT, true ); 
			curl_exec( $ch ); 
			var_dump( curl_getinfo( $ch, CURLINFO_HEADER_OUT ) ); 
			// CURLOPT_HEADERFUNCTION.
			// file_get_contents('php://input'); || $HTTP_RAW_POST_DATA
		}
//
//====================================================================
		public static function float( $d="" ){
			return (float)preg_replace( '/[\,]/', '.', preg_replace( '/[^\d\.\,]/', '', $d ) );
		}
//
//====================================================================
//
//====================================================================
		public static function no_zeros( $text="" ){
			return rtrim( 
				rtrim( 
					preg_replace( '/\,/', '.', trim( $text ) ), "0" 
				), "." 
			);
		}
//
//====================================================================
		public static function css( $name="" ){
			$fileName = BASE_DIR ."static/css/". $name .".css";
			if( file_exists( $fileName ) ){ include_once $fileName; }
		}
//
//====================================================================
		public static function js( $name="" ){
			$fileName = BASE_DIR ."static/js/". $name .".js";
			if( file_exists( $fileName ) ){ include_once $fileName; }
		} 
//
//====================================================================//

//
//====================================================================

	}
?>