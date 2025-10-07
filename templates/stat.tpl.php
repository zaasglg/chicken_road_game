<style>
    body{ align-items:start; justify-content:center; height:auto; overflow:auto; padding-bottom:40px; background: #000 url('/res/img/bg-sun.svg') center center no-repeat; background-attachment: fixed; background-size: cover; }
    h2{ display:block; color:#fff; font-size:30px; font-weight:700; text-align:center; padding:0px; margin:10px auto; }
    h3{ display:block; color:#fff; font-size:18px; font-weight:700; text-align:left; padding:0px; margin:0px; } 
    table{ border:0; margin:0px; border-collapse:collapse; border:0; }  
    table td{ padding:10; text-align:center; vertical-align:middle; color:#000; font-size:14px; font-weight:400; background:#fff; border:solid 1px #000; } 
    table th{ background:rgb(207, 226, 255); color:#000; font-size:16px; font-weight:500; text-align:center; padding:10px; } 
    table tr.current{ }
    table tr.current td{ font-weight:bold; background:#cff4fc; } 
    table td img{ width:40px; height:auto; border-radius:50%; transition:all 0.3s linear; transform-origin:center; filter: drop-shadow(0px 0px 0px #000);}
    table td img:hover{ transform:scale(2); filter:drop-shadow(5px 5px 5px #000); z-index:100; }
    select{ width:100%; height:40px; background:#fff; border:solid 1px #000; color:#000; font-size:14px; font-weight:400; text-align:left; padding:10px; }
    #stat_wrapper{ display:flex; flex-flow:column nowrap; justify-content:start; align-items:stretch; gap:20px; padding:0px; margin:0px auto; width:100%; max-width:940px; }
    #stat_wrapper .block{ flex-grow:1; flex-shrink:1;  display:flex; flex-flow:column nowrap; justify-content:start; align-items:stretch; gap:10px; padding:20px; margin:0px; border:solid 1px #fff; border-radius:32px; }
    #add_cf{ display:flex; flex-flow:column nowrap; justify-content:start; align-items:stretch; gap:10px; } 
    #add_cf textarea{ height:200px; width:100%; padding:10px; color:#000; font-size:14px; background:#fff; resize:none; }
    #add_cf .actions{ display:flex; flex-flow:row nowrap; justify-content:end; align-items:center; gap:10px; }
    #add_cf button{ min-width:200px; height:40px; background:#0d6efd; border:0; color:#fff; font-size:16px; font-weight:bold; cursor:pointer; display:flex; flex-flow:row nowrap; justify-content:center; align-items:center; gap:0; }
</style>
<div id="stat_wrapper">
    <h2>STATS</h2>

    <div id="add_cf" class="block">
        <h3>Add CFs</h3>
        <textarea id="new_cf_val" autocomplete="off"></textarea>
        <div class="actions">
            <button id="new_cf">Add</button>
        </div>
    </div>

    <div id="cfs" class="block">
        <h3>CFs</h3>
        <table>
            <tr>
                <th>id</th>
                <th>amount</th>
                <th>status</th> 
            </tr>
            <?php 
                $cfs = Cfs::GI()->load(['length'=>1000, 'sort'=>'id', 'dir'=>"ASC"]); 
                if( $cfs ){
                    foreach( $cfs as $cf ){
                        echo '<tr class="'. ( $cf['active'] ? 'current' : '' ) .'">
                                <td>'. $cf['id'] .'</td>
                                <td>'. $cf['amount'] .'x</td>
                                <td>
                                    <select name="status" class="field" data-id="'. $cf['id'] .'" data-field="cfs"> 
                                        <option value="2" '. ( $cf['status'] == 2 ? 'selected' : '' ) .'>active</option> 
                                        <option value="5" '. ( $cf['status'] == 5 ? 'selected' : '' ) .'>deleted</option>
                                    </select>
                                </td>
                            </tr>'; 
                    }
                }
            ?>
        </table>
    </div>

    <div id="games" class="block">
        <h3>Games</h3>
        <table>
            <tr>
                <th>id</th>
                <th>cf</th>
                <th>amount</th>
                <th>bets</th>
                <th>start</th>
                <th>finish</th> 
            </tr>
            <?php 
                $games = Games::GI()->load(['length'=>20, 'sort'=>"id", 'dir'=>"DESC"]); 
                if( $games ){
                    foreach( $games as $game ){
                        echo '<tr class="'. ( $game['finish'] ? '' : 'current' ) .'">
                                <td>'. $game['id'] .'</td>
                                <td>'. $game['cf'] .'</td> 
                                <td>'. $game['amount'].'x</td>
                                <td>'. $game['bets'] .'</td>
                                <td>'. $game['start'] .'</td>
                                <td>'. ( $game['finish'] ? $game['finish'] : '<b>active</b>' ) .'</td>
                            </tr>';
                    }
                }
            ?>
        </table>
    </div>

    <div id="bets" class="block">
        <h3>Bets</h3>
        <table>
            <tr>
                <th>id</th>
                <th>user</th>
                <th>bet</th>
                <th>cf</th>
                <th>result</th> 
                <th>game</th> 
                <th>type</th> 
                <th>src</th> 
                <th>date</th> 
            </tr>
            <?php  
                $bets = Bets::GI()->load(['length'=>20, 'sort'=>'id', 'dir'=>"desc"]); 
                if( $bets ){
                    foreach( $bets as $bet ){
                        echo '<tr calss="'. ( $bet['active'] ? 'current' : '' ) .'">
                                <td>'. $bet['id'] .'</td>
                                <td><img src="/res/img/users/av-'. $bet['img'] .'.png" att="'. $bet['user'] .'" title="'. $bet['name'] .'"></td>
                                <td>'. $bet['bet'] .'</td>
                                <td>'. $bet['cf'] .'</td>
                                <td>'. $bet['result'] .'</td>
                                <td>'. $bet['game'] .'</td>
                                <td>'. $bet['type'] .'</td>
                                <td>'. $bet['src'] .'</td>
                                <td>'. $bet['date'] .'</td>
                            </tr>'; 
                    }
                }
            ?>
        </table>
    </div>

    <div id="users" class="block">
        <h3>Users</h3>
        <table>
            <tr>
                <th>id</th>
                <th>uid</th>
                <th>name</th>
                <th>img</th>
                <th>balance</th> 
                <th>bets</th> 
                <th>regdate</th>  
            </tr>
            <?php 
                $users = Users::GI()->load(['length'=>1000, 'sort'=>'id', 'dir'=>"desc"]); 
                if( $users ){
                    foreach( $users as $user ){
                        echo '<tr>
                                <td>'. $user['id'] .'</td>
                                <td>'. $user['uid'] .'</td>
                                <td>'. $user['name'] .'</td>
                                <td><img src="/res/img/users/av-'. $user['img'] .'.png" alt=""></td>
                                <td>'. $user['balance'] .'</td>
                                <td>'. $user['bets'] .'</td>
                                <td>'. $user['date'] .'</td> 
                            </tr>';
                    }
                }
            ?>
        </table>
    </div>
</div>
<script>
    $(document).ready(function(){
        $('#new_cf').off().on('click', function(){
            var $val = $('#new_cf_val').val().replace(/\n/gi, '#') 
            if( $val ){
                $.ajax({
                    url: "/api/cfs/bulk", 
                    type: "ajax", 
                    method: "post", 
                    data: { cfs:$val }, 
                    error: function($e){ console.error($e); }, 
                    success: function($r){ 
                        window.location.reload(); 
                        console.log($r);
                    }
                });
            }
        });
        $('.field').off().on('change', function(){
            var $self=$(this); 
            var $url = $self.data('field'); 
            var $id = $self.data('id'); 
            var $key = $self.attr('name');
            var $val = $self.val(); 
            var $data = { id: $id }
            $data[ $key ] = $val; 
            $.ajax({
                url: "/api/"+$url+"/edit", 
                type: "json", 
                method: "post", 
                data: $data, 
                error: function($e){ console.error($e); }, 
                success: function($r){ 
                    //window.location.reload(); 
                    console.log($r);
                }
            });
        });
    });
</script>