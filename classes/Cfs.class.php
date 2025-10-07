<?php
	class Cfs extends Singleton {         
        protected $demo_cfs; 
        public static $table = 'cfs'; 
        protected $id; 
        protected $value; 
        protected $group; 
        protected $status;  
//
//=====================================================
        protected function __construct(){
            // Инициализируем полные демо коэффициенты
            $this->demo_cfs = [];
            $id = 1;
            
            // Easy коэффициенты
            $easy_cfs = [1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.75, 1.88, 2.04, 2.22, 2.45, 2.72, 3.06, 3.50, 4.08, 4.90, 6.13, 6.61, 9.81, 19.44];
            foreach($easy_cfs as $cf) {
                $this->demo_cfs[] = ['id' => $id++, 'value' => $cf, 'group' => 1, 'status' => 2, 'lvl' => 'easy'];
            }
            
            // Medium коэффициенты
            $medium_cfs = [1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.20, 6.91, 8.90, 11.74, 15.99, 22.61, 33.58, 53.20, 92.17, 182.51, 451.71, 1788.80];
            foreach($medium_cfs as $cf) {
                $this->demo_cfs[] = ['id' => $id++, 'value' => $cf, 'group' => 2, 'status' => 2, 'lvl' => 'medium'];
            }
            
            // Hard коэффициенты
            $hard_cfs = [1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.59, 34.79, 55.97, 94.99, 172.42, 341.40, 760.46, 2007.63, 6956.47, 41321.43];
            foreach($hard_cfs as $cf) {
                $this->demo_cfs[] = ['id' => $id++, 'value' => $cf, 'group' => 3, 'status' => 2, 'lvl' => 'hard'];
            }
            
            // Hardcore коэффициенты
            $hardcore_cfs = [1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2643.89, 9161.08, 39301.05, 233448.29];
            foreach($hardcore_cfs as $cf) {
                $this->demo_cfs[] = ['id' => $id++, 'value' => $cf, 'group' => 4, 'status' => 2, 'lvl' => 'hardcore'];
            }
        }
//
//===================================================== 
        public static function getInstance( $c=null, $name="", $params=[] ){
            return parent::getInstance(__CLASS__);
        } 
//
//===================================================== 
        public function bulk( $d=[] ) {
            $cfs = isset( $d['cfs'] ) ? explode('#', $d['cfs']) : [];
            $res = []; 
            if( $cfs ){
                foreach( $cfs as $cf ){
                    $val = preg_replace('/[^\d\,\.]/', '', $cf); 
                    $val = preg_replace('/[\,]/', '.', $val); 
                    $this->add(['value'=>(float)$val, 'status'=>2]);
                    $res[] = $val; 
                }
            } 
            return ['success'=>1, 'data'=>$res];
        }
//
//===================================================== 
        public function add( $d=[] ){
            $data = [
                'id' => uniqid(),
                'value'=> isset( $d['value'] ) ? (float)$d['value'] : 0, 
                'group'=> isset( $d['group'] ) ? (int)$d['group'] : 0, 
                'status'=> isset( $d['status'] ) ? (int)$d['status'] : 2 
            ]; 
            if( !$data['status'] ) { $data['status'] = 2; }

            // Добавляем коэффициент в демо данные
            $this->demo_cfs[] = $data;

            return ['success'=>1, 'data'=>$data];
        }
//
//===================================================== 
        public function edit( $d=[] ){ 
            $id = isset( $d['id'] ) ? (int)$d['id'] : 0; 

            if( $id ){
                // Обновляем демо коэффициент
                foreach($this->demo_cfs as &$demo_cf) {
                    if($demo_cf['id'] == $id) {
                        if(isset($d['value'])) $demo_cf['value'] = (float)$d['value'];
                        if(isset($d['group'])) $demo_cf['group'] = (int)$d['group'];
                        if(isset($d['status'])) $demo_cf['status'] = (int)$d['status'];
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
            $status = isset( $d['status'] ) ? preg_replace('/[^\d\,]/', '', $d['status']) : ''; 
            
            // Ищем коэффициент в демо данных
            foreach($this->demo_cfs as $cf) {
                $match = true;
                
                if($id && $cf['id'] != $id) $match = false;
                if($status && $cf['status'] != $status) $match = false;
                
                if($match) {
                    return $cf;
                }
            }
            
            return null;
        }
//
//===================================================== 
        public function load( $d=[] ){ 
            $group = isset( $d['group'] ) ? (int)$d['group'] : 0; 
            $status = isset( $d['status'] ) ? preg_replace('/[^\d\,]/', '', $d['status']) : ''; 
            $page = isset( $d['page'] ) ? (int)$d['page'] : 1; 
            $length = isset( $d['length'] ) ? (int)$d['length'] : 100; 

            $cfs = [];
            foreach($this->demo_cfs as $cf) {
                $match = true;
                
                if($group && $cf['group'] != $group) $match = false;
                if($status && $cf['status'] != $status) $match = false;
                
                if($match) {
                    $cfs[] = $cf;
                }
            }

            $full = isset( $d['full'] ) ? (int)$d['full'] : 0; 
            if( $full ){
                $ret = []; 
                foreach( $cfs as $cf ){
                    if( !isset( $ret[ $cf['lvl'] ] ) ){
                        $ret[ $cf['lvl'] ] = []; 
                    } 
                    $ret[ $cf['lvl'] ][] = $cf['value']; 
                } 
                return $ret; 
            }

            return $cfs; 
		} 
//
//=====================================================
        public function next( $d=[] ){
            // Возвращаем следующий коэффициент для демо режима
            $id = isset( $d['id'] ) ? (int)$d['id'] : 0;
            
            if($id) {
                // Ищем следующий коэффициент после указанного ID
                foreach($this->demo_cfs as $cf) {
                    if($cf['id'] > $id) {
                        return $cf;
                    }
                }
            }
            
            // Возвращаем первый коэффициент
            return $this->demo_cfs[0] ?? null;
        }
//
//=====================================================
		
	} 



