// (function(){

    var COMEDITOR  = document.getElementById('comeditor');
    var ELEMENT    = Node.ELEMENT_NODE;
    var ENTER_KEY  = 13;
    var DELETE_KEY = 8;
    var UP_KEY     = 38;
    var DOWN_KEY   = 40;

    var THEADS_TITLE = 'タイトル';
    var THEADS_CHARACTER = '登場人物';
    var THEADS_DESCRIPTION = 'あらすじ';
    var THEADS = [THEADS_TITLE,THEADS_CHARACTER,THEADS_DESCRIPTION];

    var is_chrome;
    var sel;
    var range;
    var characters;
    var table;
    var thead;
    var tbody;
    var current_tr;
    var current_td;
    var current_th;
    var current_character = -1;

    //events

    window.onload = init;

    document.onselectionchange = selectChange;

    COMEDITOR.onkeydown = function(e){
        if(e.keyCode == ENTER_KEY){
            e.preventDefault();
            if( e.shiftKey ){
                pressShiftEnterKey();
            }else{
                pressEnterKey();
            }
        }else if(e.keyCode == DELETE_KEY){
            pressDeleteKey(e);
        }else if(e.keyCode == UP_KEY || e.keyCode == DOWN_KEY){
            e.preventDefault();
        }

    }

    COMEDITOR.onkeyup = function(e){
        if( e.keyCode == DELETE_KEY ){
            if(sel.focusNode.tagName === 'TD'){
                execCommandFormatBlock();
            }
        }else if(e.keyCode == UP_KEY || e.keyCode == DOWN_KEY){
            pressUpDownKey(e.keyCode);
        }
    }

    //functions

    function init(e){

        if( !isChrome() ) alert('ブラウザはChromeをお使いください → https://www.google.co.jp/chrome/');

        characters = ['A','B','C'];

        table  = document.createElement('table');
        thead  = document.createElement('thead');
        tbody = document.createElement('tbody');

        THEADS.forEach(function(item){
            var thead_tr = document.createElement('tr');
            var thead_th = document.createElement('th');
            var thead_td = document.createElement('td');
            thead_th.innerHTML = item + '：';
            thead_tr.appendChild(thead_th);
            thead_tr.appendChild(thead_td);
            thead.appendChild(thead_tr);
        });

        current_tr = document.createElement('tr');
        current_th = document.createElement('th');
        current_th.className= 'hidden';
        current_td = document.createElement('td');
        current_tr.appendChild(current_th);
        current_tr.appendChild(current_td);
        table.appendChild(thead);
        tbody.appendChild(current_tr);
        table.appendChild(tbody);

        COMEDITOR.appendChild(table);
        current_td.contentEditable = true;
        current_td.focus();
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        range.setStart(current_td,0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        execCommandFormatBlock();

    }

    function selectChange(e){}

    //行を削除
    function pressDeleteKey(e){
        updateCurrentLine();
        var prev_tr = current_tr.previousSibling;
        if( canRemoveLine() ){
            e.preventDefault();
            current_tr.remove();
            var prev_td = prev_tr.getElementsByTagName('td')[0];
            range = sel.getRangeAt(0);
            var text = prev_td.lastElementChild;
            if(text){
                range.setStartAfter(text);
            }else{
                range.setStart(prev_td,0);
            }
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    //改行
    function pressEnterKey(){
        updateCurrentLine();
        if( current_td.textContent !== '' ){
             execCommandInsertParagraph();
             execCommandFormatBlock();
        }else{
            changeCharacter(current_th,current_td);
        }
    }

    function changeCharacter(th,td){
        if(current_character < characters.length - 1){
            th.classList.remove('hidden');
            current_character ++;
            th.innerHTML = characters[current_character];
            td.colSpan = 1;
        }else{
            th.classList.add('hidden');
            current_character = -1;
            th.innerHTML = ''
            td.colSpan = 2;
        }
    }

    //進む戻る
    function pressUpDownKey(keyCode){
        updateCurrentLine();
        if(keyCode === UP_KEY){
            var tr = current_tr.previousSibling;
        }else if(keyCode === DOWN_KEY){
            var tr = current_tr.nextSibling;
        }
        var td = tr.getElementsByTagName('td')[0];
        range = sel.getRangeAt(0);
        var text = td.lastElementChild;
        if(text){
            range.setStartAfter(text);
        }else{
            range.setStart(td,0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }


    //新しい行を追加する
    function pressShiftEnterKey(){
        document.execCommand('formatBlock', false, 'p');
        updateCurrentLine()
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        var td = document.createElement('td');
        changeCharacter(th,td);
        tr.appendChild(th);
        tr.appendChild(td);
        current_tr.parentNode.insertBefore(tr,current_tr.nextElementSibling);
        td.contentEditable = true;
        range = sel.getRangeAt(0);
        range.setStart(td,0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        execCommandFormatBlock();
    }

    //現在地
    function updateCurrentLine(){
        var parentNode = sel.focusNode;
        while( parentNode.tagName !== 'TR' ) parentNode = parentNode.parentElement;
        current_tr = parentNode;
        current_th = current_tr.getElementsByTagName('th')[0];
        current_td = current_tr.getElementsByTagName('td')[0];
    }

    function execCommandFormatBlock(){
        document.execCommand('formatBlock', false, 'p');
    }

    function execCommandInsertParagraph(){
        document.execCommand('insertParagraph', false);
    }

    function canRemoveLine(){
        return current_td.textContent === '' && tbody.getElementsByTagName('tr').length > 1;
    }

    //Chromeブラウザ判定
    function isChrome(){
        var userAgent = window.navigator.userAgent.toLowerCase();
        if(userAgent.indexOf('chrome') != -1){
            is_chrome = true;
        }else{
            is_chrome = false;
        }
        return is_chrome;
    }



// })();
