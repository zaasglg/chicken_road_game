<!DOCTYPE html>
<html class="page" lang="en">
<head>
    <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no""> 
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title><?= PAGETITLE; ?></title>
    <meta name="description" content="<?= PAGEDESCRIPTION; ?>">
    <meta name="keywords" content="<?= PAGEKEYWORDS; ?>">
    <meta name="author" content="<?= PAGEAUTHOR; ?>"> 
    <link rel="shortcut icon" href="./res/img/favicon.svg?<?= rand(0, 99999); ?>" type="image/x-icon">
    
    <link rel="apple-touch-icon" href="/res/img/apple57.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/res/img/apple72.png">  
    <link rel="apple-touch-icon" sizes="114x114" href="/res/img/apple114.png">
    <link rel="apple-touch-startup-image" href="/res/img/splash.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

    <meta property="og:title" content="CHICKEN ROAD"> 
    <meta property="og:description" content="Choose from four difficulty levels: easy, medium, hard or hardcore. Each level of difficulty increases the possible winning odds, but the risk of getting fried also increases with each step.">
    <meta property="og:image" content="./res/img/apple-touch-icon.png">
    <meta property="og:type" content="Game">
    <meta property="og:url" content= "/">  
    <meta property="og:locale" content="en_EN">
    <meta property="og:locale:alternate" content="ru_RU"> 
    <meta property="og:site_name" content="CHICKEN ROAD"> 

    <link rel="stylesheet" type="text/css" href="./res/css/reset.css">
    <link rel="stylesheet" type="text/css" href="./res/css/style.css?<?= rand(0, 99999); ?>">
    <link rel="stylesheet" type="text/css" href="./res/css/style2.css?<?= rand(0, 99999); ?>">

    <script src="./res/js/jquery.js"></script> 
    <script src="./res/js/howler.min.js"></script> 
    <script>
        window.LOCALIZATION = {
            TEXT_LIVE_WINS_ONLINE: '<?= TEXT_LIVE_WINS_ONLINE; ?>',
            TEXT_BETS_WRAPPER_PLAY: '<?= TEXT_BETS_WRAPPER_PLAY; ?>',  
            TEXT_BETS_WRAPPER_GO: '<?= TEXT_BETS_WRAPPER_GO; ?>', 
            TEXT_BETS_WRAPPER_WAIT: '<?= TEXT_BETS_WRAPPER_WAIT; ?>'
        }
    </script>
</head>