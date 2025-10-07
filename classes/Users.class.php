<?php
	class Users extends Singleton {  
		protected $demo_data; 
		public static $table = 'users'; 
		protected $id; 
		protected $uid; 
		protected $host_id; 
		protected $name; 
		protected $real_name;
		protected $img; 
		protected $balance; 
		protected $status; 
		protected $date; 
		protected $basic_balance; 
//	
//===================================
		public function __construct( $d=[] ){
			$this->basic_balance = 500; 
			$this->demo_data = [
				'uid' => 'demo_' . uniqid(),
				'host_id' => 0,
				'name' => 'Demo User',
				'real_name' => 'Demo User',
				'img' => rand(1,70),
				'balance' => $this->basic_balance,
				'status' => 2,
				'date' => date('Y-m-d H:i:s')
			];
		}
//		
//-----------------------------------------------------
		public static function getInstance( $c=null, $name="", $params=[] ){
            return parent::getInstance( $c ? $c : __CLASS__ );
        }
//
//===================================
        public function exists( $d=[] ){
            // В демо режиме всегда возвращаем true
            return true;
        }
//
//===================================
		public static function logout(){
			foreach( $_SESSION as $k=>$v ){ unset( $_SESSION[ $k ] ); }
			$_SESSION = [];
			header('Location: /');
			exit();
		}
//
//===================================
		public function add( $d=[] ){
			$uid = isset( $d['uid'] ) ? $d['uid'] : 'demo_' . uniqid();
			
			$data = array(
				'uid'=> $uid, 
				'host_id'=> isset( $d['host_id'] ) ? (int)$d['host_id'] : 0, 
				'name'=> isset( $d['name'] ) ? App::text( $d['name'] ) : substr( $uid, 0, 1 ) .'...'. substr( $uid, 6, 1 ),
				'real_name'=> isset( $d['real_name'] ) ? App::text( $d['real_name'] ) : '', 
				'img'=> rand(1,70),
				'balance'=> isset( $d['balance'] ) ? $d['balance'] : $this->basic_balance, 
				'status'=> isset( $d['status'] ) ? (int)$d['status'] : 2
			);
			
			// В демо режиме просто возвращаем данные
			return ['success'=>1, 'data'=>$data];
		}
//
//===================================
		public function get( $d=[] ){ 
			// В демо режиме возвращаем демо данные
			$demo_user = $this->demo_data;
			$demo_user['bets'] = 0; // Количество ставок
			return $demo_user;
		}
//
//===================================
		public function edit( $d=[] ){ 
			// В демо режиме просто обновляем демо данные
			if( isset($d['name']) ){ $this->demo_data['name'] = App::text($d['name']); }
			if( isset($d['img']) ){ $this->demo_data['img'] = App::text($d['img']); }
			if( isset($d['status']) ){ $this->demo_data['status'] = (int)$d['status']; }
			if( isset($d['balance']) ){ $this->demo_data['balance'] = (float)$d['balance']; }
			
			return ['success'=>1, 'data'=>$this->demo_data];
		}
//
//=================================== 
		public function load( $d=[] ){
			// В демо режиме возвращаем массив с одним демо пользователем
			return [$this->demo_data];
		}
//
//=================================== 
		public function active( $d=[]){
			// В демо режиме возвращаем пустой массив
			return [];
		}
//
//=================================== 
		public function charge( $d=[] ){
			$amount = isset( $d['amount'] ) ? (float)$d['amount'] : 0; 
			$this->demo_data['balance'] += $amount;
			$_SESSION['user']['balance'] = $this->demo_data['balance'];
			return $this->demo_data['balance'];
		}
//
//=================================== 
		public function balance( $d=[] ){
			$balance = $this->demo_data['balance']; 
			$_SESSION['user']['balance'] = $balance; 
			return $balance; 
		}
//
//=================================== 
	public function updateBalance( $d=[] ){
		$user_id = isset( $d['user_id'] ) ? (int)$d['user_id'] : 0;
		$new_balance_usd = isset( $d['balance'] ) ? (float)$d['balance'] : 0;
		
		// В демо режиме всегда работаем с демо данными
		$this->demo_data['balance'] = $new_balance_usd;
		$_SESSION['user']['balance'] = $new_balance_usd;
		
		return [
			'success' => 1, 
			'balance' => $new_balance_usd,
			'balance_national' => $new_balance_usd,
			'user_id' => 0,
			'country' => '',
			'demo_mode' => true
		];
	}
//
//=================================== 
	public function get_user_balance( $d=[] ){
		$user_id = isset( $d['user_id'] ) ? (int)$d['user_id'] : 0;
		
		// В демо режиме всегда возвращаем демо баланс
		return [
			'success' => 1, 
			'balance' => $this->demo_data['balance'],
			'user_id' => 0,
			'country' => '',
			'balance_national' => $this->demo_data['balance'],
			'demo_mode' => true
		];
	}
//
//=================================== 
	public function save_game_result( $d=[] ){
		$user_id = isset( $d['user_id'] ) ? (int)$d['user_id'] : 0;
		$new_balance_usd = isset( $d['balance'] ) ? (float)$d['balance'] : 0;
		$bet_amount = isset( $d['bet_amount'] ) ? (float)$d['bet_amount'] : 0;
		$win_amount = isset( $d['win_amount'] ) ? (float)$d['win_amount'] : 0;
		$game_result = isset( $d['game_result'] ) ? $d['game_result'] : 'lose';
		
		// В демо режиме обновляем баланс
		$this->demo_data['balance'] = $new_balance_usd;
		$_SESSION['user']['balance'] = $new_balance_usd;
		
		return [
			'success' => 1, 
			'balance' => $new_balance_usd,
			'balance_national' => $new_balance_usd,
			'user_id' => 0,
			'country' => '',
			'game_result' => $game_result,
			'bet_amount' => $bet_amount,
			'win_amount' => $win_amount,
			'demo_mode' => true
		];
	}
//
//=================================== 

//
//=================================== 
	}
//
//
//