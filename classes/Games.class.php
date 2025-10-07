<?php
	class Games extends Singleton {         
        protected $demo_games; 
        public static $table = 'games'; 
        protected $id; 
        protected $cf; 
        protected $status; 
        protected $finish;  
//
//=====================================================
        protected function __construct(){
            $this->demo_games = [];
        }
//
//===================================================== 
        public static function getInstance( $c=null, $name="", $params=array() ){
            return parent::getInstance(__CLASS__);
        } 
//
//===================================================== 
        public function search( $d=[] ){
            $game = $this->get([]); 
            if( !$game ){ 
                $old_game = $this->get(['last'=>1]);  
                if( $old_game ){ $cf = Cfs::GI()->next(['id'=>$old_game['cf']]); }
                else { $cf = Cfs::GI()->next([]); } 
                if( $cf ){ $ins = $this->add([ 'cf'=> $cf['id'], 'status'=> 1 ]); } 
                else { $ins = $this->add([ 'cf'=> 1, 'status'=> 1 ]); }
                $game = $this->get([]);
            } 
            return $game; 
        }
//
//===================================================== 
        public function add( $d=[] ){
            $data = [
                'id' => uniqid(),
                'cf'=> isset( $d['cf'] ) ? (int)$d['cf'] : 1, 
                'status'=> isset( $d['status'] ) ? (int)$d['status'] : 1,
                'date' => date('Y-m-d H:i:s'),
                'finish' => null
            ]; 

            // Добавляем игру в демо данные
            $this->demo_games[] = $data;
            $game = $this->get([]);
            return $game; 
        }
//
//===================================================== 
        public function close( $d=[] ){
            $game = $this->get();
            if( $game ){
                $data = [
                    'status'=>7, 
                    'finish'=> date("Y-m-d H:i:s")
                ]; 

                // Обновляем демо игру
                foreach($this->demo_games as &$demo_game) {
                    if($demo_game['id'] == $game['id']) {
                        $demo_game['status'] = 7;
                        $demo_game['finish'] = date("Y-m-d H:i:s");
                        break;
                    }
                }

                $balance = Users::GI()->balance();

                return ['success'=>1, 'balance'=>$balance];
            }
            return ['error'=>1, 'msg'=>"Game not found"];
        }
//
//===================================================== 
        public function edit( $d=[] ){ 
            $id = isset( $d['id'] ) ? (int)$d['id'] : 0; 
            
            if( $id ){
                // Обновляем демо игру
                foreach($this->demo_games as &$demo_game) {
                    if($demo_game['id'] == $id) {
                        if(isset($d['status'])) $demo_game['status'] = (int)$d['status'];
                        if(isset($d['finish'])) $demo_game['finish'] = date("Y-m-d H:i:s");
                        break;
                    }
                }
                return ['success'=>1, 'data'=>$d, 'result'=>1];
            }

            return ['error'=>1, 'msg'=>"Wrong data format"]; 
        }
//
//===================================================== 
        public function get( $d= [] ){ 
            $id = isset( $d['id'] ) ? preg_replace('/[^\d\,]/', '', $d['id']) : ''; 
            $last = isset( $d['last'] ) ? (int)$d['last'] : 0; 
            $status = isset( $d['status'] ) ? preg_replace('/[^\d\,]/', '', $d['status']) : ''; 
            
            // Ищем игру в демо данных
            foreach($this->demo_games as $game) {
                $match = true;
                
                if($id && $game['id'] != $id) $match = false;
                if($last && !$game['finish']) $match = false;
                if($status && $game['status'] != $status) $match = false;
                
                if($match) {
                    $game['amount'] = 100; // Демо значение
                    $game['delta'] = time() - strtotime($game['date']);
                    $game['start'] = $game['date'];
                    return $game;
                }
            }
            
            return null;
        }
//
//===================================================== 
        public function load( $d=array() ){ 
            $sort = isset( $d['sort'] ) ? preg_replace( '/[^A-za-z0-9\-\_]/', '', $d['sort'] ) : ''; 
            $dir = isset( $d['dir'] ) ? App::uid( $d['dir'] ) : "";
            
            $games = [];
            foreach($this->demo_games as $game) {
                $game['amount'] = 100; // Демо значение
                $game['bets'] = 0; // Демо значение
                $game['tst'] = strtotime($game['date']);
                $game['start'] = $game['date'];
                $games[] = $game;
            }
            
            return $games;
		}
//
//=====================================================
		public function history( $d=[] ){
            $history = [];
            foreach($this->demo_games as $game) {
                if($game['status'] == 7 && $game['finish']) {
                    $game['amount'] = 100; // Демо значение
                    $history[] = $game;
                }
            }
            return array_slice($history, 0, 100);
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



