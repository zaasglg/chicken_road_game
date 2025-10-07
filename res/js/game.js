var SETTINGS = {
    w: document.querySelector('#game_container').offsetWidth, //$('#canvas').width(), 
    h: document.querySelector('#game_container').offsetHeight, //$('#canvas').height(), 
    start: {
        x: 0, 
        y: 0 
    }, 
    timers: {  
    }, 
    volume: {
        active: +$('body').attr('data-sound'), 
        music: 0.2, 
        sound: 0.9
    }, 
    currency: $('body').attr('data-currency') ? $('body').attr('data-currency')  : "USD", 
    cfs: {
        easy: [ 1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.75, 1.88, 2.04, 2.22, 2.45, 2.72, 3.06, 3.50, 4.08, 4.90, 6.13, 6.61, 9.81, 19.44 ], 
        medium: [ 1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.20, 6.91, 8.90, 11.74, 15.99, 22.61, 33.58, 53.20, 92.17, 182.51, 451.71, 1788.80 ],  
        hard: [ 1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.59, 34.79, 55.97, 94.99, 172.42, 341.40, 760.46, 2007.63, 6956.47, 41321.43 ], 
        hardcore: [ 1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2643.89, 9161.08, 39301.05, 233448.29 ]
    }, 
    chance: {
        easy: [7, 23], 
        medium: [5, 15], 
        hard: [3, 10], 
        hardcore: [2, 6]
    },
    min_bet: 0.5, 
    max_bet: 150, 
    segw: 240  

} 

var $canvas = document.querySelector("#game_field");
var $ctx = $canvas.getContext("2d");
$canvas.width = SETTINGS.w; 
$canvas.height = SETTINGS.h; 

var SOUNDS = {
    music: new Howl({
        src: ['res/sfx/music.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: true, 
        volume: SETTINGS.volume.music 
    }), 
    button: new Howl({
        src: ['res/sfx/button.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    }), 
    win: new Howl({
        src: ['res/sfx/win.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    }), 
    lose: new Howl({
        src: ['res/sfx/lose.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    }), 
    step: new Howl({
        src: ['res/sfx/step.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    })
}

var LIGHTS_SATURATE = 100; 
var LIGHTS_SATURATE_DIR = 1; 
var LIGHTS_HUE = 0; 

var IMAGES = "./res/img/";
var $fire_big = [ ]; 
for( var $i=0; $i<21; $i++ ){ 
    $fire_big[ $i ] = new Image(); 
    $fire_big[ $i ].src = IMAGES+'fire_'+ ( $i+1 ) +'.png';
} 
var $breaks_img = [ new Image(), new Image(), new Image() ];
    $breaks_img[0].src = IMAGES + "break1.png";
    $breaks_img[1].src = IMAGES + "break2.png";
    $breaks_img[2].src = IMAGES + "break3.png"; 
var $finish_arc = new Image(); 
    $finish_arc.src = IMAGES + "arc2.png"; 
var $winner_cup = new Image(); 
    $winner_cup.src = IMAGES + "stand.png"; 
var $finish_light = new Image(); 
    $finish_light.src = IMAGES + "lights1.png";
var $chicken_light = new Image(); 
    $chicken_light.src = IMAGES + "lights2.png"; 
var $win_egg = new Image(); 
    $win_egg.src = IMAGES + "bet5.png"; 
var $award_egg = new Image(); 
    $award_egg.src = IMAGES + "bet6.png"; 
var $lose_egg = new Image(); 
    $lose_egg.src = IMAGES + "bet7.png"; 
var $walll = new Image(); 
    $walll.src = IMAGES + "walll.png";
var $corpse = new Image(); 
    $corpse.src = IMAGES + "chicken_dead.png"; 
var $flame = new Image(); 
    $flame.src = IMAGES + "mini_fire.png"; 

var BREAKS = [ 
    { x: 50, y: 90, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break1.png" }, 
    { x: 90, y: 200, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break2.png" }, 
    { x: 120, y: 400, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break3.png" }, 
    { x: 90, y: 200, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break2.png" }, 
    { x: 120, y: 400, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break3.png" }, 
    { x: 90, y: 200, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break2.png" }, 
    { x: 60, y: 480, w:80, h: 45, width: 196, height: 122, src: IMAGES + "break3.png" }  
]; 

class Helpers {
    constructor( $obj ){ 
        this.PI = 3.14; 
        this.ctx = $obj.ctx ? $obj.ctx : false; 
    } 
    deg2rad( $a ){
        return $a * ( this.PI / 180 )
    } 
    hexToRgbA( hex, opacity ){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){ c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+ ( typeof opacity != "undefined" ? opacity : 1 ) +')';
        }
        console.log('Bad Hex');
    } 
    distance( A, B ){
        var $distance = Math.sqrt( Math.pow( A.x - B.x, 2 ) + Math.pow( A.y - B.y, 2 ) ); 
        return $distance; 
    }
    len( $v ){
        return Math.sqrt( $v.x * $v.x + $v.y * $v.y + 0 );
    } 
    normalize( $v ){ 
        var $len = this.len( $v );
        var $res = { x: ( $v.x / $len ), y: ( $v.y / $len ), z:0 }
        return $res;
    } 
    text( $text, $x, $y, $params ){ 
        this.ctx.beginPath();
        this.ctx.textAlign = $params && $params.align ? $params.align : "center";
        this.ctx.textBaseline = $params && $params.baseline ? $params.baseline : "middle";
        this.ctx.font = $params && $params.font ? $params.font : "normal 12px Arial";
        this.ctx.fillStyle = $params && $params.color ? $params.color : "#ffffff";
        this.ctx.strokeStyle = $params && $params.scolor ? $params.scolor : "#ffffff";
        if( $params && $params.shadow ){ 
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            this.ctx.shadowBlur = 2;
        }
        if( $params && $params.stroke ){ 
            this.ctx.strokeText( $text, $x, $y ); 
        }
        else { 
            this.ctx.fillText( $text, $x, $y ); 
        }
        this.ctx.stroke();
        this.ctx.closePath();
    } 
    line( $x1, $y1, $x2, $y2, $width, $color, $dash, $cap ){
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.lineWidth = $width ? $width : 1;
        this.ctx.strokeStyle = $color ? $color : "#ffffff";
        this.ctx.lineCap = $cap ? $cap : "square"; // butt, square round
        this.ctx.setLineDash( ( $dash && $dash.length ) ? $dash : [] );
        this.ctx.moveTo( $x1, $y1 );
        this.ctx.lineTo( $x2, $y2 );
        this.ctx.stroke();
        this.ctx.closePath(); 
    } 
    arc( $x, $y, $radius, $start, $end, $direction, $width, $color, $fill, $dash ){  
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.lineWidth = $width ? $width : 1;
        this.ctx.setLineDash( ( $dash && $dash.length ) ? $dash : [] );
        this.ctx.strokeStyle = $color ? $color : "black";
        if( $fill ){ 
            $this.ctx.fillStyle = $fill; 
        } 
        this.ctx.arc( $x, $y, $radius, $start*(this.PI/180), $end*(this.PI/180), $direction ); 
        if( $fill ){ 
            this.ctx.fill(); 
        }
        this.ctx.stroke();
        this.ctx.closePath(); 
    } 
    filled_arch( $x, $y, $radius, $start, $end, $direction, $width, $color ){ 
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash( [] );
        this.ctx.strokeStyle = $color ? $color : "#ffffff";
        this.ctx.fillStyle = $color ? $color : "#ffffff";
        this.ctx.arc( $x, $y, $radius, $start*(this.PI/180), $end*(this.PI/180), $direction, 1, ( $color ? $color : "black" ) );
        this.ctx.arc( $x, $y, $radius-$width, $end*(this.PI/180), $start*(this.PI/180), !$direction, 1, ( $color ? $color : "black" ) );
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath(); 
    } 
    coords_from_angle( $x, $y, $radius, $angle ){ 
        var $angle = $this.deg2rad( $angle );
        return {
            x: $x + $radius * Math.cos( $angle ), 
            y: $y + $radius * Math.sin( $angle )
        } 
    } 
    rect( $obj ){ 
        this.ctx.beginPath();
        this.ctx.lineWidth = $obj.line ? $obj.line : 1;
        // rect(x, y, rectangle-width, rectangle-height); 
        var $x = $obj.x ? $obj.x : 0; 
        var $y = $obj.y ? $obj.y : 0; 
        var $w = $obj.w ? $obj.w : 100; 
        var $h = $obj.h ? $obj.h : 100; 
        this.ctx.strokeStyle = $obj.stroke ? $obj.stroke : "#000"; 
        if( $obj.stroke ){ 
            this.ctx.strokeRect( $x, $y, $w, $h ); 
        } 
        this.ctx.fillStyle = $obj.fill ? $obj.fill : "transparent"; 
        if( $obj.fill ){ 
            this.ctx.fillRect( $x, $y, $w, $h ); 
        }
        //this.ctx.globalAlpha = 0.5;
    }
    image( $obj ){
        this.ctx.drawImage(
            $obj.img,
            $obj.sx,
            $obj.sy,
            $obj.sw,
            $obj.sh,
            $obj.dx,
            $obj.dy,
            $obj.dw,
            $obj.dh
        );
    }
    img( $obj ){
        this.ctx.drawImage(
            $obj.img,
            $obj.dx,
            $obj.dy,
            $obj.dw,
            $obj.dh
        );
    }
}

var HELPERS = new Helpers({ ctx: $ctx }); 

class Sprite {
    constructor( $obj ){
        this.timer = new Date().getTime();
        this.current = 0; 
        this.ctx = $obj.ctx ? $obj.ctx : $cth;
        this.images = $obj.images; 
        this.x = $obj.x ? $obj.x : 0; 
        this.y = $obj.y ? $obj.y : 0; 
        this.width = $obj.width;
        this.height = $obj.height; 
        this.speed = $obj.speed; 
        this.infinite = $obj.infinite ? true : false; 
        this.alife = $obj.alife ? $obj.alife : 0; 
    } 
    update( obj ){
        var $timer = new Date().getTime(); 
        var $delta = $timer - this.timer; 
        if( $delta >= this.speed ){
            this.current += 1; 
            if( this.current == this.images.length ){ 
                if( this.infinite ){
                    this.current = 0; 
                } 
                else {
                    this.alife = 0; 
                }
            }
            this.timer = $timer; 
        }
        this.draw( obj ); 
    }
    draw( obj ){ 
        if( this.alife ){ 
            $ctx.drawImage(
                this.images[ this.current ],
                this.x,
                this.y,
                this.width,
                this.height 
            ); 
        }
    }
} 

class Flame{
    constructor( $obj ){
        this.alife = 0; 
        this.x = $obj.x ? $obj.x : 0; 
        this.y = $obj.y ? $obj.y : SETTINGS.h - 50 - SETTINGS.segw * 0.8; 
        this.w = $obj.w ? $obj.w : SETTINGS.segw * 0.8; 
        this.h = $obj.h ? $obj.h : SETTINGS.segw * 0.8; 
        this.dw = 312; // 1248; 
        this.dh = 429; // 1287; 
        this.rows = 4; 
        this.length = 12;
        this.frame = 0; 
        this.frames =  [
            { x: 0, y: 0 },
            { x: 312, y: 0 },
            { x: 624, y: 0 },
            { x: 936, y: 0 },
            { x: 0, y: 429 },
            { x: 312, y: 429 },
            { x: 624, y: 429 },
            { x: 936, y: 429 }, 
            { x: 0, y: 858 },
            { x: 312, y: 858 },
            { x: 624, y: 858 },
            { x: 936, y: 858 }
        ]; 
        this.delta = 0; 
        this.speed = 100; 
        this.timer = new Date().getTime(); 
        this.time = 0; 
        this.seg = 0; 
    } 
    update(){ 
        //console.log("FLAME ALIFE: "+this.alife);
        this.time = new Date().getTime(); 
        this.delta = this.time - this.timer; 
        if( this.alife ){ 
            this.draw(); 
        } 
        else {
            var $start = Math.round( Math.random() * 100 ) > 75; 
            var $segment = Math.ceil( Math.random() * (SEGMENTS.length-2) ); 
            //console.log("START: "+ $start +" SEGMENT: "+ $segment); 
            if( ( GAME.cur_status == "game" || GAME.cur_status == "loading" ) && GAME.stp != $segment && $start ){
                this.alife = 1; 
                this.x = SEGMENTS[ $segment ].x; 
                this.seg = SEGMENTS[ $segment ].id; 
            }
        }
    }
    draw(){
        if( this.alife ){ 
            HELPERS.image({
                img: $flame,
                sx: this.frames[ this.frame ].x,
                sy: this.frames[ this.frame ].y,
                sw: this.dw,
                sh: this.dh,
                dx: this.x + SETTINGS.segw * 0.1,
                dy: this.y,
                dw: this.w,
                dh: this.h
            }); 
            if( this.delta >= this.speed ){ 
                this.delta = 0; 
                this.timer = this.time; 
                this.frame += 1; 
                if( this.frame >= this.length ){
                    this.frame = 0; 
                    this.alife = 0; 
                } 
            }
        }
    }
}

var FLAME = new Flame({}); 

class Segment {
    constructor( $obj ){
        this.ctx = $obj.ctx ? $obj.ctx : $ctx; 
        this.type = $obj.type ? $obj.type : 'step'; 
        this.id = $obj.id ? $obj.id : 0; 
        this.state = 'active';
        this.x = $obj.x ? $obj.x : 0; 
        this.new_x = $obj.x ? $obj.x : 0; 
        this.y = $obj.y ? $obj.y : 0; 
        this.w = $obj.w ? $obj.w : SETTINGS.segw; 
        this.h = $obj.h ? $obj.h : SETTINGS.h; 
        this.details = $obj.det ? $obj.det : { 
            bg: 'transparent', // '#2d324d'
            footer: [ '#1f212d', '#3a3d51', '#333647' ], 
            breaks: [], 
            border: 0  
        }; 
        this.footer = new Image(); 
        this.footer.src = $obj.footer; 
        if( this.type == "step" ){ 
            this.frame = new Image(); 
            this.frame.src = IMAGES + "frame.png"; 
            this.bet1 = new Image(); 
            this.bet1.src = IMAGES + "bet1.png";  
            this.bet2 = new Image(); 
            this.bet2.src = IMAGES + "bet2.png";  
            this.bet3 = new Image(); 
            this.bet3.src = IMAGES + "bet3.png";  
            this.bet4 = new Image(); 
            this.bet4.src = IMAGES + "bet4.png";  
            this.betbg = new Image(); 
            this.betbg.src = IMAGES + "betbg.png"; 
        } 
        if( this.type == "step" || this.type == "finish" ){ 
            this.trigger = new Image(); 
            this.trigger.src = IMAGES + "trigger.png"; 
            this.trigger_y = this.h - 50 - 16;
        }
        if( this.type == "start" ){
            this.arc = new Image(); 
            this.arc.src = IMAGES + "arc.png"; 
        }
        if( this.type == "finish" ){
            this.egg_shift = 450; 
            this.egg_dir = 1; 
            this.bet_shift = 70;
        }
        this.fire = $obj.fire ? $obj.fire : false; 
        this.distance = 0; 
        if( this.fire ){
            SPRITES.push( 
                new Sprite({
                    ctx: this.ctx ? this.ctx : $ctx,
                    images: $fire_big, 
                    x: this.x , 
                    y: 0, 
                    width: this.w,
                    height: this.h - 50, 
                    speed: 100 
                })
            ); 
            this.fire = SPRITES[ SPRITES.length - 1 ]; 
        } 
        this.sounded = false; 
    }
    move(){ 
        if( this.x > this.new_x ){
            // Определяем скорость движения камеры в зависимости от размера экрана
            var moveSpeed = 5;
            if (window.innerWidth <= 800) {
                moveSpeed = 3; // Уменьшаем скорость для мобильных устройств
            }
            
            this.x -= moveSpeed;
            if( this.fire ){
                this.fire.x = this.x + ( this.x * 0.05 ); 
            } 
            if( this.x < this.new_x ){
                this.x = this.new_x; 
            } 
            if( FLAME.seg == this.id ){
                FLAME.x = this.x; 
            }
        } 
        if( GAME.segment && this.id == ( GAME.stp - 1 ) && this.x == this.new_x ){
            GAME.moving = 0; 
            GAME.segment = 0; 
            //console.log("STOP FROM SEGMENT "+this.id);
        }
    }
    update(){ 
        this.move(); 
        this.draw(); 
        if( this.fire && this.fire.alife ){
            this.fire.update(); 
        } 
    }
    draw(){
        // clear
        HELPERS.rect({
            x: this.x, 
            y: this.y, 
            w: this.w, 
            h: this.h, 
            fill: this.details.bg
        }); 
        // border
        if( this.details.border ){
            HELPERS.line( 
                ( this.x + this.w ), 
                this.y,  
                ( this.x + this.w ),
                this.h - 50, 
                5, 
                '#9ea6ca', 
                [20,20]
            );
        } 
        // breaks
        if( this.details.breaks && this.details.breaks.length ){
            for( var $b of this.details.breaks ){
                HELPERS.img({
                    img: $breaks_img[ $b.id ],
                    dx: this.x + $b.x,
                    dy: this.h - 200 - $b.y,
                    dw: $b.w,
                    dh: $b.h
                }); 
            }
        }
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        if( this.type == "start" ){
            // arc 
            HELPERS.image({
                img: this.arc,
                sx: 0,
                sy: 0,
                sw: 150,
                sh: 426,
                dx: this.x + ( this.w / 2 ) - ( 150 / 2 ),
                dy: this.h - 50 - 426,
                dw: 150,
                dh: 426
            }); 
        }
        if( this.type == "step" ){ 
            var $draw_text = 1; 
            // bet coin
            HELPERS.image({
                img: this.betbg,
                sx: 0,
                sy: 0,
                sw: 453,
                sh: 456,
                dx: this.x + ( this.w / 2 ) - 90,
                dy: this.h - 50 - 270 - 163,
                dw: 180,
                dh: 180
            }); 
            // ели позади 
            if( this.id <= GAME.stp - 2 ){
                HELPERS.image({
                    img: this.bet4,
                    sx: 0,
                    sy: 0,
                    sw: 401,
                    sh: 413,
                    dx: this.x + ( this.w / 2 ) - 75,
                    dy: this.h - 50 - 270 - 150,
                    dw: 150,
                    dh: 153
                }); 
                $draw_text  = 0; 
            }
            // если там же 
            if( this.id == GAME.stp - 1 ){
                HELPERS.image({
                    img: CHICKEN.alife ? this.bet2 : ( !GAME.win ? this.bet3 : this.bet2 ),
                    sx: 0,
                    sy: 0,
                    sw: 401,
                    sh: 413,
                    dx: this.x + ( this.w / 2 ) - 75,
                    dy: this.h - 50 - 270 - 150,
                    dw: 150,
                    dh: 153
                }); 
                if( !CHICKEN.alife ){
                    $draw_text = !GAME.win ? 0 : 1; 
                }
            }
            // если впереди
            if( this.id > GAME.stp ){ 
                this.ctx.save(); 
                this.ctx.globalAlpha = 0.5; 
                HELPERS.image({
                img: this.bet1,
                sx: 0,
                sy: 0,
                sw: 401,
                sh: 413,
                dx: this.x + ( this.w / 2 ) - 75,
                dy: this.h - 50 - 270 - 150,
                dw: 150,
                dh: 153
            }); 
                this.ctx.globalAlpha = 1; 
                this.ctx.restore(); 
            }
            if( this.id == GAME.stp ){ 
                HELPERS.image({
                    img: this.bet1,
                    sx: 0,
                    sy: 0,
                    sw: 401,
                    sh: 413,
                    dx: this.x + ( this.w / 2 ) - 75,
                    dy: this.h - 50 - 270 - 150,
                    dw: 150,
                    dh: 153
                }); 
            } 
            if( $draw_text ){ 
                this.ctx.save(); 
                HELPERS.text(
                    SETTINGS.cfs[ GAME.cur_lvl ][ this.id ] + 'x', 
                    this.x + this.w / 2, 
                    this.h - 50 - 270 - 70, 
                    { 
                        shadow: 1, 
                        font: 'bold 40px Roboto, Arial' 
                    }
                );
                this.ctx.restore(); 
            }
            // frame
            HELPERS.image({
                img: this.frame,
                sx: 0,
                sy: 0,
                sw: 145,
                sh: 156,
                dx: this.x + ( this.w / 2 ) - ( 145 / 2 ),
                dy: this.h - 50 - 156,
                dw: 145,
                dh: 156
            }); 
            //light 
            if( this.id == GAME.stp - 1 ){ 
                this.ctx.save(); 
                //if( CHICKEN.alife ){ 
                    this.ctx.filter = "sepia(100%) hue-rotate("+ LIGHTS_HUE +"deg) saturate("+ LIGHTS_SATURATE +"%)"; 
                //} 
                //else {
                //    this.ctx.filter = "sepia(100%) hue-rotate(-30deg) saturate(900%)"; 
                //}
                HELPERS.image({
                    img: $chicken_light,
                    sx: 0,
                    sy: 0,
                    sw: 240,
                    sh: 296,
                    dx: this.x,
                    dy: this.h - 50 - 296,
                    dw: 240,
                    dh: 296
                }); 
                this.ctx.restore(); 
            }
            // trigger 
            if( this.id == ( GAME.stp - 1 ) && GAME.moving_time > 500 ){ 
                if( this.trigger_y < this.h - 16 ){ 
                    this.trigger_y += 1; 
                } 
                if( !this.sounded ){
                    this.sounded = true; 
                    if( SETTINGS.volume.active ){ SOUNDS.step.play(); }
                }
            }
            HELPERS.image({
                img: this.trigger,
                sx: 0,
                sy: 0,
                sw: 100,
                sh: 16,
                dx: this.x + ( this.w / 2 ) - 80,
                dy: this.trigger_y, 
                dw: 160,
                dh: 16
            }); 
        }
        if( this.type == "finish" ){ 
            // finish arc
            this.ctx.save(); 
            this.ctx.globalAlpha = 0.5; 
            HELPERS.image({
                img: $finish_arc,
                sx: 0,
                sy: 0,
                sw: 240,
                sh: 485,
                dx: this.x,
                dy: this.h - 50 - 485,
                dw: 240,
                dh: 485
            }); 
            this.ctx.globalAlpha = 1; 
            this.ctx.restore(); 
            // winner cup
            HELPERS.image({
                img: $winner_cup,
                sx: 0,
                sy: 0,
                sw: 282,
                sh: 158,
                dx: this.x + ( this.w / 2 ) - 60,
                dy: this.h - 50 - 67,
                dw: 120,
                dh: 67
            }); 
            // light 
            this.ctx.save(); 
            this.ctx.filter = "sepia(100%) hue-rotate("+ LIGHTS_HUE +"deg) saturate("+ LIGHTS_SATURATE +"%)";
            HELPERS.image({
                img: $finish_light,
                sx: 0,
                sy: 0,
                sw: 240,
                sh: 375,
                dx: this.x + 20,
                dy: this.h - 50 - 375,
                dw: 200,
                dh: 375
            }); 
            this.ctx.restore(); 
            // egg 
            var $draw_egg = $win_egg; 
            if( this.id == ( GAME.stp - 1 ) && GAME.moving_time > 500 ){
                $draw_egg = $award_egg;
                if( this.fire ){
                    $draw_egg = $lose_egg; 
                    if( GAME.cur_status == "game" ){ GAME.finish(); }
                }
                if( GAME.cur_status == "game" ){ GAME.finish(1); }
            } 
            else {
                if( !CHICKEN.alife ){ 
                    if( !GAME.win ){ 
                        $draw_egg = $lose_egg; 
                    } 
                    else {
                        $draw_egg = $award_egg;
                    }
                    if( GAME.cur_status == "game" ){ GAME.finish(); }
                }
            }
            HELPERS.image({
                img: $draw_egg,
                sx: 0,
                sy: 0,
                sw: 350,
                sh: 428,
                dx: this.x + ( this.w / 2 ) - 75,
                dy: this.h - 50 - this.egg_shift,
                dw: 150,
                dh: 200
            });
            // text 
            if( CHICKEN.alife || ( !CHICKEN.alife && GAME.win ) ){ 
                this.ctx.save(); 
                HELPERS.text(
                    SETTINGS.cfs[ GAME.cur_lvl ][ this.id ] + 'x', 
                    this.x + this.w / 2, 
                    this.h - 50 - 270 - this.bet_shift, 
                    { 
                        shadow: 1, 
                        font: 'bold 40px Roboto, Arial' 
                    }
                );
                this.ctx.restore(); 
            }
            // trigger 
            if( this.id == ( GAME.stp - 1 ) && GAME.moving_time > 500 ){ 
                if( this.trigger_y < this.h - 16 ){ 
                    this.trigger_y += 1; 
                } 
                if( !this.sounded ){
                    this.sounded = true; 
                    if( SETTINGS.volume.active ){ SOUNDS.step.play(); } 
                }
            }
            HELPERS.image({
                img: this.trigger,
                sx: 0,
                sy: 0,
                sw: 100,
                sh: 16,
                dx: this.x + ( this.w / 2 ) - 80,
                dy: this.trigger_y, 
                dw: 160,
                dh: 16
            }); 

            if( this.egg_dir ){ 
                this.egg_shift += 0.5; 
                this.bet_shift += 0.5; 
                if( this.egg_shift > 470 ){
                    this.egg_dir = 0; 
                }
            } 
            else { 
                this.egg_shift -= 0.5; 
                this.bet_shift -= 0.5; 
                if( this.egg_shift < 430 ){
                    this.egg_dir = 1; 
                }
            }
        } 
        if( this.type == "back" ){
            // bg 
            // wall 
            HELPERS.image({
                img: $walll,
                sx: 0,
                sy: 0,
                sw: 130,
                sh: 1146,
                dx: this.x,
                dy: 0,
                dw: 50,
                dh: this.h / 2 - 25
            }); 
            HELPERS.image({
                img: $walll,
                sx: 0,
                sy: 0,
                sw: 130,
                sh: 1146,
                dx: this.x,
                dy: this.h / 2 - 25,
                dw: 50,
                dh: this.h / 2 - 25
            });
        }
        if( this.id == GAME.stp - 1 && this.fire && GAME.moving_time > 600 ){
            HELPERS.image({
                img: $corpse,
                sx: 0,
                sy: 0,
                sw: 482,
                sh: 424,
                dx: this.x + ( this.w / 2 ) - 100,
                dy: this.h - 50 - 160, 
                dw: 200,
                dh: 176
            });
        }
        // footer 
        HELPERS.image({
            img: this.footer,
            sx: 0,
            sy: 0,
            sw: SETTINGS.segw,
            sh: 50,
            dx: this.x,
            dy: this.h - 50,
            dw: this.w,
            dh: 50
        }); 
    }
} 

var SEGMENTS = []; 
var SPRITES = []; 

class Chicken {
    constructor( $obj ){
        this.ctx = $obj.ctx ? $obj.ctx : $ctx; 
        this.timer = new Date().getTime(); 
        this.delta = 0; 
        this.states = {
            idle: 0, 
            go: 0, 
            jump: 0
        } 
        this.frames = {
            idle: { 
                w: 302,
                h: 302, 
                rows: 5, 
                length: 24, 
                speed: 150, 
                frames: [
                    { x: 0, y: 0 },
                    { x: 302, y: 0 },
                    { x: 604, y: 0 },
                    { x: 906, y: 0 },
                    { x: 1208, y: 0 },
                    { x: 0, y: 302 },
                    { x: 302, y: 302 },
                    { x: 604, y: 302 },
                    { x: 906, y: 302 },
                    { x: 1208, y: 302 },
                    { x: 0, y: 604 },
                    { x: 302, y: 604 },
                    { x: 604, y: 604 },
                    { x: 906, y: 604 },
                    { x: 1208, y: 604 },
                    { x: 0, y: 906 },
                    { x: 302, y: 906 },
                    { x: 604, y: 906 },
                    { x: 906, y: 906 },
                    { x: 1208, y: 906 },
                    { x: 0, y: 1208 },
                    { x: 302, y: 1208 },
                    { x: 604, y: 1208 },
                    { x: 906, y: 1208 } 
                ]
            }, 
            go: { 
                w: 302, 
                h: 302,
                rows: 4,
                length: 16, 
                speed: 50, 
                frames: [
                    { x: 0, y: 0 }, 
                    { x: 302, y: 0 }, 
                    { x: 604, y: 0 }, 
                    { x: 906, y: 0 }, 
                    { x: 0, y: 302 }, 
                    { x: 302, y: 302 }, 
                    { x: 604, y: 302 }, 
                    { x: 906, y: 302 }, 
                    { x: 0, y: 604 }, 
                    { x: 302, y: 604 }, 
                    { x: 604, y: 604 }, 
                    { x: 906, y: 604 }, 
                    { x: 0, y: 906 }, 
                    { x: 302, y: 906 }, 
                    { x: 604, y: 906 }, 
                    { x: 906, y: 906 } 
                ] 
            }, 
            jump: {
                w: 302,
                h: 362, 
                rows: 4, 
                length: 10, 
                speed: 150, 
                frames: [
                    { x: 0, y: 0 }, 
                    { x: 302, y: 0 }, 
                    { x: 604, y: 0 }, 
                    { x: 906, y: 0 }, 
                    { x: 0, y: 362 }, 
                    { x: 302, y: 362 }, 
                    { x: 604, y: 362 }, 
                    { x: 906, y: 362 }, 
                    { x: 0, y: 604 }, 
                    { x: 302, y: 604 }, 
                    { x: 0, y: 0 }, 
                    { x: 0, y: 0 }, 
                    { x: 0, y: 0 }, 
                    { x: 0, y: 0 }, 
                    { x: 0, y: 0 }, 
                ]  
            }
        }
        this.state = $obj.state ? $obj.state : 'idle'; 
        this.x = $obj.x ? $obj.x : 0; 
        this.new_x = $obj.x ? $obj.x : 0;
        this.y = $obj.y ? $obj.y : 0; 
        this.w = $obj.w ? $obj.w : 0; 
        this.h = $obj.h ? $obj.h : 0; 
        this.images = {
            idle: new Image(), 
            go: new Image(), 
            jump: new Image() 
        } 
        this.images.idle.src = IMAGES + "chicken_idle.png"; 
        this.images.go.src = IMAGES + "chicken_go.png"; 
        this.images.jump.src = IMAGES + "chicken_jump.png"; 
        this.alife = 1; 
    } 
    update(){ 
        this.time = new Date().getTime(); 
        this.delta = this.time - this.timer;  
        this.move(); 
        this.draw(); 
    }
    move( ){
        if( this.x < this.new_x && GAME.chicken ){ 
            // Определяем скорость движения курицы в зависимости от размера экрана
            var moveSpeed = 5;
            if (window.innerWidth <= 800) {
                moveSpeed = 3; // Уменьшаем скорость для мобильных устройств
            }
            
            this.x += moveSpeed; 
            if( this.x >= this.new_x ){
                this.x = this.new_x;  
                GAME.moving = 0; 
                GAME.chicken = 0; 
                //console.log("STOP FROM CHICKEN");
            }
        } 
    } 
    draw(){ 
        if( this.alife ){ 
            HELPERS.image({
                img: this.images[ this.state ],
                sx: this.frames[ this.state ].frames[ this.states[ this.state ] ].x,
                sy: this.frames[ this.state ].frames[ this.states[ this.state ] ].y,
                sw: this.frames[ this.state ].w,
                sh: this.frames[ this.state ].h,
                dx: this.x,
                dy: this.y,
                dw: this.w,
                dh: this.h
            }); 
            if( 2 == 3 ){ 
                HELPERS.rect({
                    stroke: '#fff', 
                    x: this.x, 
                    y: this.y, 
                    w: this.w, 
                    h: this.h 
                });
            }
            if( this.delta >= this.frames[ this.state ].speed ){ 
                this.delta = 0; 
                this.timer = this.time; 
                this.states[ this.state ] += 1; 
                if( this.states[ this.state ] >= this.frames[ this.state ].frames.length ){
                    this.states[ this.state ] = 0; 
                    this.states.idle = 0; 
                    this.state = "idle"; 
                } 
            }
        }
    } 
    drop(){ 
        this.alife = 1; 
        this.x = 0 + ( SETTINGS.segw * 0.05 ); 
        this.y = SETTINGS.h - 30 - ( SETTINGS.segw * 0.9 ); 
        this.w = SETTINGS.segw * 0.9; 
        this.h = SETTINGS.segw * 0.9;
    }
} 

var CHICKEN = new Chicken({});
CHICKEN.drop(); 

class Game {
    constructor( $obj ){ 
        this.timer = new Date().getTime(); 
        this.delta = 0; 
        this.ctx = $obj.ctx ? $obj.ctx : {}; 
        this.cur_lvl = $obj.cur_lvl ? 'easy' : $obj.cur_lvl; 
        this.cur_bet = $obj.cur_bet ? $obj.cur_bet : 0; 
        this.states = {
            loading: 0, 
            game: 0, 
            finish: 0
        } 
        this.cur_status = 'loading'; 
        this.stp = 0;
        this.create(); 
        this.alife = 0; 
        // Получаем баланс из URL параметров (уже в USD)
        var urlParams = new URLSearchParams(window.location.search);
        var balanceParam = urlParams.get('balance');
        var userIdParam = urlParams.get('user_id');
        
        // Если это демо режим, устанавливаем 500 USD
        if (userIdParam === 'demo' || !userIdParam) {
            this.balance = 500;
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
        } else {
            // Реальный режим - загружаем актуальный баланс из базы данных
            this.balance = balanceParam ? parseFloat(balanceParam) : 0;
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
            this.loadActualBalance(userIdParam);
        } 
        this.current_bet = 0; 
        this.currency = 'USD'; 
        this.moving = 0; 
        this.moving_time = 0; 
        this.segment  = 0;
        this.chicken = 0; 
        this.win = 0;
        
        // Локальные коэффициенты вместо WebSocket
    this.localTraps = null;
    }
    
    // Генерируем локальные трапы на основе коэффициентов
    generateLocalTraps() {
        const cfs = SETTINGS.cfs[this.cur_lvl];
        const traps = [];
        
        // Генерируем трапы на основе коэффициентов
        for (let i = 0; i < cfs.length; i++) {
            // Вероятность трапа зависит от коэффициента (чем выше коэффициент, тем меньше вероятность)
            const trapProbability = Math.max(0.1, 1 / cfs[i]);
            traps.push({
                position: i,
                coefficient: cfs[i],
                isTrap: Math.random() < trapProbability
            });
        }
        
        this.localTraps = traps;
        return traps;
    }
    create(){
        this.stp = 0; 
        this.win = 0; 
        var $cur_bet = +$('#bet_size').val(); 
            $cur_bet = $cur_bet >= this.balance ? this.balance : $cur_bet; 
            $('#bet_size').val( $cur_bet );
        this.cur_lvl = $('[name="difficulity"]:checked').val(); 
        
        // Генерируем локальные трапы
        this.generateLocalTraps();
        
        var $arr = SETTINGS.cfs[ this.cur_lvl ]; 
        SEGMENTS = []; 
        var $numbreaks = 2; 
        var $breaks = []; 
        if( $numbreaks ){ 
            for( var $j=0; $j<$numbreaks; $j++ ){ 
                $breaks.push( BREAKS[ Math.floor( Math.random() * BREAKS.length ) ] ); 
                $breaks[ $breaks.length - 1 ].id = $j;  
            } 
        } 
        SEGMENTS.push(
            new Segment({ 
                type: "start", 
                footer: IMAGES + "footer1.png", 
                det: {
                    bg: '#2d324d',
                    //footer: [ '#1f212d', '#3a3d51' ], 
                    breaks: $breaks, 
                    border: 0  
                }
            })
        ); 
        // flame segment - используем локальные трапы
        var $flame_segment;
        if (this.localTraps && this.localTraps.length > 0) {
            // Находим первый трап в локальных данных
            const trap = this.localTraps.find(t => t.isTrap);
            $flame_segment = trap ? trap.position + 1 : Math.ceil( Math.random() * SETTINGS.chance[ this.cur_lvl ][ Math.round( Math.random() * 100  ) > 90 ? 1 : 0 ] );
        } else {
            $flame_segment = Math.ceil( Math.random() * SETTINGS.chance[ this.cur_lvl ][ Math.round( Math.random() * 100  ) > 90 ? 1 : 0 ] );
        }
        for( var $i=0; $i<$arr.length; $i++ ){ 
            var $numbreaks = Math.round( Math.random() * 3 ); 
            var $breaks = []; 
            if( $numbreaks ){ 
                for( var $j=0; $j<$numbreaks; $j++ ){ 
                    $breaks.push( BREAKS[ Math.floor( Math.random() * BREAKS.length ) ] ); 
                    $breaks[ $breaks.length - 1 ].id = $j; 
                    //$breaks[ $breaks.length - 1 ].img = $breaks_img[$j]; 
                    //$breaks[ $breaks.length - 1 ].img.src = $breaks[ $breaks.length - 1 ].src; 
                } 
            } 
            //console.log( $breaks );
            SEGMENTS.push( 
                new Segment({ 
                    type: ( $i == $arr.length - 1 ) ? "finish" : "step", 
                    id: $i, 
                    x: SETTINGS.segw + ( $i * SETTINGS.segw ), 
                    footer: IMAGES + ( $i % 2 ? "footer1.png" : "footer2.png" ), 
                    fire: $i == $flame_segment - 1 ? 1 : 0, 
                    det: {
                        bg: '#394265', //'transparent', //footer: [ '#1f212d', ( $i % 2 ? '#3a3d51' : '#333647' ) ], 
                        breaks: $breaks, 
                        border: ( $i == $arr.length - 1 ) ? 0 : 1  
                    }
                })
            ); 
        } 
        SEGMENTS.push(
            new Segment({ 
                type: "back", 
                x: SEGMENTS[ SEGMENTS.length - 1 ].x + SETTINGS.segw, 
                footer: IMAGES + "footer1.png", 
                det: {
                    bg: '#2d324d', 
                    breaks: [], 
                    border: 0  
                }
            })
        ); 

        CHICKEN.drop();  
    } 
    start(){ 
        this.current_bet = +$('#bet_size').val();
        if( this.balance && this.current_bet && this.current_bet <= this.balance ){ 
            this.cur_status = 'game';
            this.alife = 1; 
            CHICKEN.alife = 1; 
            this.balance -= this.current_bet;
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
            
            // Запрашиваем трапы от WebSocket сервера
            if (this.ws) {
                this.ws.send(JSON.stringify({ type: 'game_start' }));
            }
        }
    }
    finish( $win ){ 
        $('#overlay').show(); 
        this.cur_status = "finish"; 
        this.alife = 0; 
        CHICKEN.alife = 0;
        
        // Уведомляем WebSocket о завершении игры
        if (this.ws) {
            this.ws.send(JSON.stringify({ type: 'game_end' }));
        }
        
        var $award = 0;
        if( $win ){ 
            this.win = 1;
            $award = ( this.current_bet * SETTINGS.cfs[ this.cur_lvl ][ this.stp - 1 ] ); 
            $award = $award ? $award : 0; 
            //console.log("AWARD: "+ $award);
            this.balance += $award; 
            if( SETTINGS.volume.active ){ SOUNDS.win.play(); } 
            $('#win_modal').css('display', 'flex');
            $('#win_modal h3').html( 'x'+ SETTINGS.cfs[ this.cur_lvl ][ this.stp - 1 ] );
            $('#win_modal h4 span').html( $award.toFixed(2) );
        } 
        else {
            if( SETTINGS.volume.active ){ SOUNDS.lose.play(); } 
        }
        
        // Сохраняем результат игры в базе данных
        this.saveGameResult($win, $award);
        
        //console.log("CREATE REBUILD");
        window.$rebuild = setTimeout(
            function(){ 
                $('#overlay').hide(); 
                GAME.cur_status = "loading"; 
                $('#win_modal').hide(); 
                GAME.create();  
            }, $win ? 5000 : 3000  
        ); 
    }
    saveGameResult($win, $award) {
        // Получаем user_id из URL
        var urlParams = new URLSearchParams(window.location.search);
        var userId = urlParams.get('user_id');
        var self = this;
        
        // Сохраняем только в реальном режиме (не демо)
        if (userId && userId !== 'demo') {
            var gameData = {
                user_id: userId,
                balance: this.balance,
                bet_amount: this.current_bet,
                win_amount: $win ? $award : 0,
                game_result: $win ? 'win' : 'lose'
            };
            
            // Отправляем данные на сервер
            $.ajax({
                url: '/chicken-road/api/users/save_game_result',
                type: 'POST',
                data: gameData,
                dataType: 'json',
                success: function(response) {
                    console.log('Game result saved:', response);
                    if (response.success) {
                        // Обновляем баланс в игре и интерфейсе
                        self.balance = response.balance;
                        $('[data-rel="menu-balance"] span').html(response.balance.toFixed(2));
                        
                        // Отправляем сообщение родительскому окну об обновлении баланса
                        if (window.parent && window.parent !== window) {
                            window.parent.postMessage({
                                type: 'balanceUpdated',
                                balance: response.balance,
                                userId: userId
                            }, '*');
                        }
                    } else {
                        console.error('Failed to save game result:', response.msg);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Failed to save game result:', error);
                }
            });
        } else {
            // В демо режиме просто обновляем баланс в интерфейсе
            $('[data-rel="menu-balance"] span').html(this.balance.toFixed(2));
        }
    }
    updateBalance() {
        // Получаем user_id из URL
        var urlParams = new URLSearchParams(window.location.search);
        var userId = urlParams.get('user_id');
        var self = this;
        
        // Обновляем только в реальном режиме (не демо)
        if (userId && userId !== 'demo') {
            var balanceData = {
                user_id: userId,
                balance: this.balance
            };
            
            // Отправляем данные на сервер
            $.ajax({
                url: '/chicken-road/api/users/update_balance',
                type: 'POST',
                data: balanceData,
                dataType: 'json',
                success: function(response) {
                    console.log('Balance updated:', response);
                    if (response.success) {
                        // Обновляем баланс в игре и интерфейсе
                        self.balance = response.balance;
                        $('[data-rel="menu-balance"] span').html(response.balance.toFixed(2));
                        
                        // Отправляем сообщение родительскому окну об обновлении баланса
                        if (window.parent && window.parent !== window) {
                            window.parent.postMessage({
                                type: 'balanceUpdated',
                                balance: response.balance,
                                userId: userId
                            }, '*');
                        }
                    } else {
                        console.error('Failed to update balance:', response.msg);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Failed to update balance:', error);
                }
            });
        } else {
            // В демо режиме просто обновляем баланс в интерфейсе
            $('[data-rel="menu-balance"] span').html(this.balance.toFixed(2));
        }
    }
    loadActualBalance(userId) {
        var self = this;
        
        // Загружаем актуальный баланс из базы данных
        $.ajax({
            url: '/chicken-road/api/users/get_user_balance',
            type: 'POST',
            data: { user_id: userId },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    self.balance = response.balance;
                    $('[data-rel="menu-balance"] span').html(self.balance.toFixed(2));
                    console.log('Actual balance loaded:', response.balance);
                } else {
                    console.error('Failed to load balance:', response.msg);
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to load actual balance:', error);
            }
        });
    }
    make_stp(){ 
        if( this.alife && !this.moving ){ 
            this.moving = new Date().getTime();
            this.stp += 1; 
            //console.log("SEGMENT "+ ( SEGMENTS[ SEGMENTS.length - 1 ].x + SEGMENTS[ SEGMENTS.length -1 ].w ) +" BOUND "+ SETTINGS.w);
            if( CHICKEN.x < SETTINGS.w / 3 ){ 
                this.chicken = 1;
                this.segment = 0;
                CHICKEN.new_x = CHICKEN.x + SETTINGS.segw; 
            } 
            else { 
                if( ( SEGMENTS[ SEGMENTS.length - 1 ].x + SEGMENTS[ SEGMENTS.length - 1 ].w ) > ( SETTINGS.w + SETTINGS.segw ) ){ 
                    //console.log("SEGMENT "+ ( SEGMENTS[ SEGMENTS.length - 1 ].x + SEGMENTS[ SEGMENTS.length -1 ].w ) +" BOUND "+ ( SETTINGS.w + SETTINGS.segw ) );
                    this.segment = 1; 
                    this.chicken = 0; 
                    for( var $x of SEGMENTS ){ $x.new_x = $x.x - SETTINGS.segw; } 
                } 
                else {
                    this.chicken = 1; 
                    this.segment = 0; 
                    CHICKEN.new_x = CHICKEN.x + SETTINGS.segw;
                }
            }
            CHICKEN.state = 'go'; 
            if( SETTINGS.volume.active ){ SOUNDS.step.play(); } 
        }
    } 
    random_str( length = 8 ){
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt( Math.floor( Math.random() * chars.length ) );
        }
        return result;
    }
    random_bet(){
        var $user_id = Math.ceil( Math.random() * 70 ); 
        var $user_name = this.random_str(); 
        var $user_win = Math.random() * 1000; 
        var $tmps = `<div class="inner">
                        <img src="./res/img/users/av-${ $user_id }.png" alt="">
                        <h2>${ $user_name }</h2>
                        <h3>+${ $user_win.toFixed(2) } ${ SETTINGS.currency }</h3>
                    </div>`; 
        $('#random_bet').html( $tmps ).css('height', '40px'); 
        clearTimeout( window.random_bet ); 
        window.random_bet = setTimeout( function(){ $('#random_bet').html('').css('height', '0px'); }, 6000 );
    }
    update(){ 
        this.time = new Date().getTime(); 
        this.delta = this.time - this.timer; 
        this.timer = this.time; 
        //console.log("Game delta :"+this.delta);
        if( this.moving ){ 
            $('#overlay').show(); 
            var timer = new Date().getTime(); 
            this.moving_time = timer - this.moving; 
            if( this.moving_time > 500 ){
                if( SEGMENTS[ this.stp ].fire ){ 
                    SEGMENTS[ this.stp ].fire.alife = 1; 
                    if( CHICKEN.alife ){
                        this.finish(); 
                    }
                    CHICKEN.alife = 0; 
                } 
                else {
                    if( SEGMENTS[ this.stp ].type == "finish" ){
                        this.finish(1); 
                    }
                }
            }
            //console.log("MOVING TIME "+this.moving_time);
        } 
        else {
            $('#overlay').hide(); 
        }
        switch( this.cur_status ){
            case 'loading': 
                $('#close_bet').css('display', 'none');
                $('#close_bet span').html( 0+' '+GAME.currency ).css('display', 'none');
                $('#start').html( LOCALIZATION.TEXT_BETS_WRAPPER_PLAY );
                break; 
            case 'game': 
                $('#close_bet').css('display', 'flex'); 
                var $award = ( this.current_bet * SETTINGS.cfs[ this.cur_lvl ][ this.stp - 1 ] ); 
                    $award = $award ? $award.toFixed(2) : 0; 
                $('#close_bet span').html( $award +' '+ SETTINGS.currency ).css('display', 'flex');
                $('#start').html( LOCALIZATION.TEXT_BETS_WRAPPER_GO );
                break; 
            case 'finish': 
                $('#close_bet').css('display', 'none');
                $('#close_bet span').html( 0+' '+GAME.currency ).css('display', 'none'); 
                $('#start').html( LOCALIZATION.TEXT_BETS_WRAPPER_WAIT );
                break;  
        } 
        $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) ); 

        if( Math.round( Math.random() * 100 ) > 99 ){ 
            $('#stats span.online').html( LOCALIZATION.TEXT_LIVE_WINS_ONLINE + ': '+ Math.round( Math.random() * 10000 ));
            this.random_bet(); 
        }
    } 
} 

var GAME = new Game({ 
    ctx: $ctx, 
    cur_lvl: 'easy'
});  

function render( obj ){ 
    //console.log("Render");
    $ctx.fillStyle = "#000";
    $ctx.clearRect( 0, 0, SETTINGS.w, SETTINGS.h ); 

    if( LIGHTS_SATURATE_DIR ){ 
        LIGHTS_SATURATE += 10; 
        if( LIGHTS_SATURATE > 900 ){
            LIGHTS_SATURATE_DIR = 0; 
        }
    }
    else {
        LIGHTS_SATURATE -= 10; 
        if( LIGHTS_SATURATE < 100 ){
            LIGHTS_SATURATE_DIR = 1; 
        }
    }
    if( GAME ){ 
        GAME.update({}); 
    }
    if( SEGMENTS && SEGMENTS.length ){
        for( var $x of SEGMENTS ){
            $x.update(); 
        }
    } 
    if( SPRITES && SPRITES.length ){
        for( var $x of SPRITES ){
            if( $x.alife ){ $x.update(); } 
        }
    }
    if( CHICKEN ){ 
        CHICKEN.update(); 
    }
    if( FLAME ){
        FLAME.update(); 
    }
    requestAnimationFrame( render );
}

render(); 

function open_game(){ 
    $('#splash').addClass('show_modal');
    var $cur_settings = +$('body').attr('data-sound'); // SETTINGS.volume.active; 
    SETTINGS.volume.active = $cur_settings; 
    $('#splash button').off().on('click', function(){
        $('#splash').remove(); 
        if( SETTINGS.volume.active ){ SOUNDS.button.play(); } 
        if( $cur_settings ){ 
            SETTINGS.volume.active = $cur_settings; 
            SOUNDS.music.play(); 
            $('#sound_switcher').removeClass('off'); 
        }
        else {
            $('#sound_switcher').addClass('off'); 
        }
    }); 
} 

$(document).ready(function(){ 
    // переключение звука 
    $('#sound_switcher').off().on('click', function(){
        var $self=$(this); 
        $self.toggleClass('off'); 
        if( $self.hasClass('off') ){
            SOUNDS.music.stop(); 
            SETTINGS.volume.active = 0; 
        } 
        else {
            SOUNDS.music.play(); 
            SETTINGS.volume.active = 1;
        }
        $('body').attr('data-sound', SETTINGS.volume.active);
        $.ajax({
            url:"/chicken-road/api/settings", type:"json", method:"post", data:{ play_sounds: SETTINGS.volume.active }
        });
    });
    // установка ставки в инпуте
    $('#bet_size').off().on('change', function(){ 
        if( GAME.cur_status == 'loading' ){
            var $self=$(this); 
            var $val= +$self.val(); 
            $val = $val < SETTINGS.min_bet ? SETTINGS.min_bet : ( $val > SETTINGS.max_bet ? SETTINGS.max_bet : $val ); 
            $val = $val >= GAME.balance ? GAME.balance : $val; 
            $self.val( $val ); 
        }
    });
    // установка ставки кнопками min max
    $('.bet_value_wrapper button').off().on('click', function(){ 
        if( GAME.cur_status == 'loading' ){ 
            if( SETTINGS.volume.active ){ SOUNDS.button.play(); } 
            var $self=$(this); 
            var $rel = $self.data('rel'); 
            switch( $rel ){
                case "min": 
                    $('#bet_size').val( SETTINGS.min_bet );
                    break; 
                case "max": 
                    $('#bet_size').val( SETTINGS.max_bet >= GAME.balance ? GAME.balance : SETTINGS.max_bet );
                    break; 
            }
        }
    });
    // установка ставки кнопками со значением
    $('.basic_radio input[name="bet_value"]').off().on('change', function(){ 
        if( GAME.cur_status == 'loading' ){
            if( SETTINGS.volume.active ){ SOUNDS.button.play(); } 
            var $self=$(this); 
            var $val = +$self.val();  
            $val = $val >= GAME.balance ? GAME.balance : $val;
            $('#bet_size').val( $val ); 
        }
    }); 
    // установка уровня сложности
    $('[name="difficulity"]').off().on('change', function(){ 
        if( GAME.cur_status == 'loading' ){ 
            if( SETTINGS.volume.active ){ SOUNDS.button.play(); } 
            var $self=$(this); 
            var $val = $self.val(); 
            GAME.cur_lvl = $val;
            // Обновляем уровень в WebSocket
            if (GAME.isConnected && GAME.ws) {
                GAME.ws.send(JSON.stringify({ type: 'set_level', level: $val }));
            }
            GAME.create(); 
        } 
        else {
            return false; 
        }
    });
    // забрать ставку
    $('#close_bet').off().on('click', function(){ 
        if( GAME.stp ){ 
            if( SETTINGS.volume.active ){ SOUNDS.button.play(); } 
            var $self=$(this); 
            $self.hide(); 
            GAME.finish(1); 
        }
    });
    // начать игру или сделать ход
    $('#start').off().on('click', function(){ 
        if( SETTINGS.volume.active ){ SOUNDS.button.play(); } 
        var $self=$(this);
        switch( GAME.cur_status ){
            case 'loading': 
                $self.html( LOCALIZATION.TEXT_BETS_WRAPPER_GO ); 
                GAME.start(); 
                break; 
            case 'game': 
                if( CHICKEN.alife ){ 
                    $self.html( LOCALIZATION.TEXT_BETS_WRAPPER_GO ); 
                    GAME.make_stp(); 
                }
                break; 
            case 'finish': 
                $self.html( LOCALIZATION.TEXT_BETS_WRAPPER_WAIT );
                //GAME.cur_status = "loading";
                break;  
        }
    });
}); 

setTimeout( open_game, 1000 );