<?php
// Курсы валют для конвертации в USD (как в авиаторе)
$currency_rates = [
    'Argentina' => 1400,    // 1 USD = 1400 ARS
    'Colombia' => 4500,     // 1 USD = 4500 COP
    'Ecuador' => 25000,     // 1 USD = 25000 (старая валюта)
    'Bolivia' => 7,         // 1 USD = 7 BOB
    'Brazil' => 5,          // 1 USD = 5 BRL
    'Chile' => 900,         // 1 USD = 900 CLP
    'Costa Rica' => 500,    // 1 USD = 500 CRC
    'Cuba' => 25,           // 1 USD = 25 CUP
    'Dominican Republic' => 60, // 1 USD = 60 DOP
    'Guatemala' => 8,       // 1 USD = 8 GTQ
    'Haiti' => 150,         // 1 USD = 150 HTG
    'Honduras' => 25,       // 1 USD = 25 HNL
    'Mexico' => 18,         // 1 USD = 18 MXN
    'Nicaragua' => 37,      // 1 USD = 37 NIO
    'Paraguay' => 7500,     // 1 USD = 7500 PYG
    'Peru' => 4,            // 1 USD = 4 PEN
    'Uruguay' => 40,        // 1 USD = 40 UYU
    'Venezuela' => 36       // 1 USD = 36 VES
];

// Функция для получения курса валюты
function getCurrencyRate($country) {
    $currency_rates = [
        'Argentina' => 1400,
        'Colombia' => 4500,
        'Ecuador' => 25000,
        'Bolivia' => 7,
        'Brazil' => 5,
        'Chile' => 900,
        'Costa Rica' => 500,
        'Cuba' => 25,
        'Dominican Republic' => 60,
        'Guatemala' => 8,
        'Haiti' => 150,
        'Honduras' => 25,
        'Mexico' => 18,
        'Nicaragua' => 37,
        'Paraguay' => 7500,
        'Peru' => 4,
        'Uruguay' => 40,
        'Venezuela' => 36
    ];
    return isset($currency_rates[$country]) ? $currency_rates[$country] : 1;
}

// Функция для конвертации из национальной валюты в USD
function convertToUSD($amount, $country) {
    $rate = getCurrencyRate($country);
    return $amount / $rate;
}

// Функция для конвертации из USD в национальную валюту
function convertFromUSD($amount, $country) {
    $rate = getCurrencyRate($country);
    return $amount * $rate;
}

// Инициализация курса для текущего пользователя
if (!isset($_SESSION['CHICKEN_USER_RATE'])) {
    $_SESSION['CHICKEN_USER_RATE'] = 1;
}
?>