<?php
	class Bets extends Singleton {         
        protected $demo_bets; 
        public static $table = 'bets'; 
        protected $id; 
        protected $user; 
        protected $sid; 
        protected $lvl; 
        protected $bet; 
        protected $fire; 
        protected $finish; 
        protected $result; 
        protected $status; 
        protected $date; 
//
//=====================================================
        protected function __construct(){
            $this->demo_bets = [];
        }
//
//===================================================== 
        public static function getInstance( $c=null, $name="", $params=[] ){
            return parent::getInstance(__CLASS__);
        } 
//
//===================================================== 
        public function add( $d=[] ){ 
            // В демо режиме создаем демо ставку
            $data=[
                'id' => uniqid(),
                'user'=> $_SESSION['user']['uid'], 
                'sid'=> $_SESSION['user']['uid'], 
                'lvl'=> isset( $d['lvl'] ) ? (int)$d['lvl'] : 0,
                'bet'=> isset( $d['bet'] ) ? (float)$d['bet'] : 0, 
                'fire'=> isset( $d['fire'] ) ? (int)$d['fire'] : 0, 
                'finish'=> isset( $d['finish'] ) ? (int)$d['finish'] : 0, 
                'result'=> isset( $d['result'] ) ? (float)$d['result'] : 0, 
                'status'=> isset( $d['status'] ) ? (int)$d['status'] : 2,
                'date' => date('Y-m-d H:i:s')
            ]; 
            if( !$data['status'] ){ $data['status'] = 2; } 

            $balance = isset( $_SESSION['chicken_demo'] ) ? 
                        $_SESSION['chicken_demo'] : 
                        Users::GI()->balance(); 

            if( $data['bet'] > $balance ){
                return ['error'=>1, 'msg'=>"Low balance"]; 
            }

            // Сохраняем ставку в демо данные
            $this->demo_bets[] = $data;

            if( isset( $_SESSION['chicken_demo'] ) ){
                $_SESSION['chicken_demo'] -= $data['bet']; 
            } 
            else { 
                Users::GI()->charge([
                    'uid'=>$_SESSION['user']['uid'], 
                    'amount'=>-$data['bet']
                ]);
            }

            try {
                $balance = isset( $_SESSION['chicken_demo'] ) ? 
                            $_SESSION['chicken_demo'] : 
                            Users::GI()->balance();
            } catch (Exception $e) {
                $balance = 0;
            }

            return ['success'=>1, 'data'=>$data, 'balance'=>$balance];
        } 
//
//=====================================================
        public function move( $d=[] ){
            $stp = isset( $d['stp'] ) ? (int)$d['stp'] : 0; 
            if( $stp ){
                $bet = $this->current(); 
                if( $bet ){ 
                    if( $bet['fire'] == $stp - 1 ){
                        $this->lose([ 
                            'id'=>$bet['id'], 
                            'stp'=> $stp-1
                        ]);
                    } 
                    else {
                        // Обновляем демо ставку
                        foreach($this->demo_bets as &$demo_bet) {
                            if($demo_bet['id'] == $bet['id']) {
                                $demo_bet['finish'] = $stp;
                                break;
                            }
                        }
                    }
                }
            }
        }
//
//=====================================================
        public function current( $d=[] ){ 
            $uid = isset( $d['uid'] ) ? App::uid( $d['uid'] ) : UID; 
            
            // Ищем активную ставку в демо данных
            foreach($this->demo_bets as $bet) {
                if($bet['user'] == $uid && $bet['status'] == 2) {
                    return $bet;
                }
            }
            
            return null;
        } 
//
//=====================================================
        public function lose( $d=[] ){ 
            $id = isset( $d['id'] ) ? $d['id'] : 0; 
            $stp = isset( $d['stp'] ) ? (int)$d['stp'] : 0; 

            if( $id ){ 
                // Обновляем демо ставку
                foreach($this->demo_bets as &$demo_bet) {
                    if($demo_bet['id'] == $id) {
                        $demo_bet['finish'] = $stp;
                        $demo_bet['result'] = 0;
                        $demo_bet['status'] = 7;
                        break;
                    }
                }
                return true; 
            }

            return false; 
        }
//
//=====================================================
        public function close( $d=[] ){ 
            $stp = isset( $d['stp'] ) ? (int)$d['stp'] : 0; 
            $cur_bet = $this->current(); 
            if( $cur_bet ){ 
                $cfs = Cfs::GI()->load(['group'=>$cur_bet['lvl']]); 
                if( $cfs ){ 
                    if( $cur_bet['fire'] == $stp - 1 ){ 
                        $data = [
                            'finish'=> $stp, 
                            'result'=> 0, 
                            'status'=> 7
                        ];
                    } 
                    else { 
                        $cur_cf = $cfs[ $stp - 1 ]['value']; 
                        $award = $cur_bet['bet'] * $cur_cf; 
                        $data = [ 
                            'finish'=> $stp, 
                            'result'=> $award, 
                            'status'=> 7 
                        ]; 
                        
                        // Обновляем демо ставку
                        foreach($this->demo_bets as &$demo_bet) {
                            if($demo_bet['id'] == $cur_bet['id']) {
                                $demo_bet['finish'] = $stp;
                                $demo_bet['result'] = $award;
                                $demo_bet['status'] = 7;
                                break;
                            }
                        }
                        
                        if( isset( $_SESSION['chicken_demo'] ) ){
                            $_SESSION['chicken_demo'] += $award;
                        } 
                        else { 
                            Users::GI()->charge([
                                'uid'=>$cur_bet['user'], 
                                'amount'=>$award
                            ]);
                        }
                    }
                    return true; 
                } 
                return false; 
            }
            return false; 
        }
//
//===================================================== 
        public function fire( $d=[] ){
            $host_id = isset( $d['host_id'] ) ? (int)$d['host_id'] : 
                ( isset( $_REQUEST['user_id'] ) ? (int)$_REQUEST['user_id'] : '' ); 
            
            // В демо режиме возвращаем случайное значение
            return rand(1, 10);
        }
// DEPRECATED
//===================================================== 
        public function edit( $d=[] ){ 
            $id = isset( $d['id'] ) ? (int)$d['id'] : 0; 

            if( $id ){
                // Обновляем демо ставку
                foreach($this->demo_bets as &$demo_bet) {
                    if($demo_bet['id'] == $id) {
                        if(isset($d['lvl'])) $demo_bet['lvl'] = (int)$d['lvl'];
                        if(isset($d['bet'])) $demo_bet['bet'] = (float)$d['bet'];
                        if(isset($d['fire'])) $demo_bet['fire'] = (int)$d['fire'];
                        if(isset($d['finish'])) $demo_bet['finish'] = (int)$d['finish'];
                        if(isset($d['result'])) $demo_bet['result'] = (float)$d['result'];
                        if(isset($d['status'])) $demo_bet['status'] = (int)$d['status'];
                        break;
                    }
                }
                
                $balance = Users::GI()->balance();
                return ['success'=>1, 'data'=>$d, 'result'=>1, 'balance'=>$balance]; 
            }
            return ['error'=>1, 'msg'=>"Wrong data format"]; 
        }
// DEPRECATED 
//===================================================== 
        public function get( $d=[] ){ 
            $id = isset( $d['id'] ) ? preg_replace('/[^\d\,]/', '', $d['id']) : ''; 
            
            if( $id ){
                // Ищем ставку в демо данных
                foreach($this->demo_bets as $bet) {
                    if($bet['id'] == $id) {
                        $bet['img'] = 1;
                        $bet['active'] = 0;
                        return $bet;
                    }
                }
            }
            
            return null;
        }
// DEPRECATED
//===================================================== 
        public function load( $d=[] ){ 
            // В демо режиме возвращаем все демо ставки
            $bets = [];
            foreach($this->demo_bets as $bet) {
                $bet['img'] = 1;
                $bet['name'] = 'Demo User';
                $bet['active'] = 0;
                $bets[] = $bet;
            }
            
            return $bets;
		}
//
//===================================================== 
        
//
//===================================================== 
        
//
//=====================================================  
		
//
//=====================================================
		
	} 



