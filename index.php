<?php 
	if( !defined('BASE_DIR') ){ 
		define('BASE_DIR', dirname(__FILE__)."/"); 
	}
	include_once BASE_DIR ."init.php"; 
	//include_once BASE_DIR ."common.php"; 
	include_once BASE_DIR ."router.php"; 
	define('LANG', isset( $_REQUEST['lang'] ) ? App::uid( $_REQUEST['lang'] ) : 'en'); 
	$localization = BASE_DIR ."localization_". LANG .".php"; 
	include_once is_file( $localization ) ? $localization : BASE_DIR ."localization.php";
	
	if( ISAPI ){ 
		include_once BASE_DIR ."api.php";
		exit();
	} 

	if( !defined('TPL') ){ define('TPL', "404"); } 
    if( !defined('PAGETITLE') ){ define('PAGETITLE', BASE_TITLE ); } 
    if( !defined('PAGEKEYWORDS') ){ define('PAGEKEYWORDS', "Choose from four difficulty levels: easy, medium, hard or hardcore. Each level of difficulty increases the possible winning odds, but the risk of getting fried also increases with each step."); } 
    if( !defined('PAGEDESCRIPTION') ){ define('PAGEDESCRIPTION', "Choose from four difficulty levels: easy, medium, hard or hardcore. Each level of difficulty increases the possible winning odds, but the risk of getting fried also increases with each step."); } 
    if( !defined('PAGEAUTHOR') ){ define('PAGEAUTHOR', "LCST"); }
    if( !defined('VISUALISATION') ){ define('VISUALISATION', true ); }
    if( !defined('ADMIN') ){ define( ADMIN, false ); } 

	$head = TPL_DIR ."head". TPL_EXT; 
	if( is_file( $head ) ){ 
		include_once $head; 
	}
?>
<body 
	data-controller="<?= CONTROLLER; ?>" 
	data-action="<?= ACTION; ?>" 
	data-tpl="<?= TPL; ?>" 
	data-currency="<?= CURRENCY; ?>" 
	data-sound="<?= isset( $_SESSION['play_sounds'] ) ? $_SESSION['play_sounds'] : 1; ?>" 
	data-music="<?= isset( $_SESSION['play_music'] ) ? $_SESSION['play_music'] : 1; ?>">
	<?php 
		$tpl = TPL_DIR . TPL . TPL_EXT;
		if( is_file( $tpl ) ){ include_once $tpl; } 
	?> 
</body>
</html>
