(function(){

    var SCRIPT_EDITOR    = document.getElementById('script_editor');
    var FILE_EDITOR      = document.getElementById('file_editor');
    var FILE_BTNS        = FILE_EDITOR.getElementsByTagName('li');
    var TITLE_EDITOR     = document.getElementById('title_editor');
    var CHARACTER_EDITOR = document.getElementById('character_editor');
    var CHARACTER_BTNS   = document.getElementsByName('character');
    var SAVE_BTN         = document.getElementById('savebtn');

    var ENTER_KEY  = 13;
    var DELETE_KEY = 8;
    var UP_KEY     = 38;
    var DOWN_KEY   = 40;

    var is_chrome;
    var sel;
    var range;
    var characters = ['A','B','C','D','E'];
    var current_tr;
    var current_td;
    var current_th;
    var current_character = -1;
    var current_file = FILE_EDITOR.getElementsByTagName('li')[0].dataset.file;
    var storage;
    var i;

    initComeditor();

    TITLE_EDITOR.onkeyup = function(e){
        var title = e.target.textContent;
        var file = FILE_EDITOR.querySelector('[data-file="' + current_file + '"]');
        file.innerHTML = title;
    }

    TITLE_EDITOR.onkeydown = function(e){
        if(e.keyCode == ENTER_KEY){
            e.preventDefault();
        }
    }

    FILE_EDITOR.onclick = function(e){
        saveFile( current_file, TITLE_EDITOR.textContent, characters, SCRIPT_EDITOR.innerHTML );
        current_file = e.target.dataset.file;
        loadFile(current_file);
        saveFile( current_file, TITLE_EDITOR.textContent, characters, SCRIPT_EDITOR.innerHTML );
    }

    SCRIPT_EDITOR.onkeydown = function(e){
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

    SCRIPT_EDITOR.onkeyup = function(e){
        if( e.keyCode == DELETE_KEY ){
            if(sel.focusNode.tagName === 'TD'){
                execCommandFormatBlock();
            }
        }else if(e.keyCode == UP_KEY || e.keyCode == DOWN_KEY){
            pressUpDownKey(e.keyCode);
        }
    }

    for(i=0; i<CHARACTER_BTNS.length; i++){
        CHARACTER_BTNS[i].onchange =　setCharacters
    }

    SAVE_BTN.onclick = function(){
        saveFile( current_file, TITLE_EDITOR.textContent, characters, SCRIPT_EDITOR.innerHTML );
    }

    function initComeditor(){
        if( !isChrome() ) alert('ブラウザはChromeをお使いください → https://www.google.co.jp/chrome/');
        if( storage = localStorage.getItem('comeditor') ){
            storage = JSON.parse(storage);
            current_file = storage['current_file'];
            loadFile(current_file);
        }else{
            fisrtVisit();
        }
    }

    function fisrtVisit(){
        var table  = document.getElementsByTagName('table')[0];
        SCRIPT_EDITOR = table.getElementsByTagName('tbody')[0];
        current_tr = document.createElement('tr');
        current_th = document.createElement('th');
        current_th.className= 'hidden';
        current_td = document.createElement('td');
        current_td.colSpan = 2;
        current_tr.appendChild(current_th);
        current_tr.appendChild(current_td);
        SCRIPT_EDITOR.appendChild(current_tr);
        table.appendChild(SCRIPT_EDITOR);
        current_td.contentEditable = true;
        current_td.focus();
        setRange(current_td);
        execCommandFormatBlock();
        for(i=0; i<FILE_BTNS.length; i++) saveFile(FILE_BTNS[i].dataset.file,　'台本' + (i+1),　characters,　SCRIPT_EDITOR.innerHTML);
        selectFile(1);
    }

    function pressDeleteKey(e){
        updateCurrentLine();
        var prev_tr = current_tr.previousSibling;
        if( current_td.textContent === '' && SCRIPT_EDITOR.getElementsByTagName('tr').length > 1 ){
            e.preventDefault();
            current_tr.remove();
            var prev_td = prev_tr.getElementsByTagName('td')[0];
            setRange(prev_td);
        }
    }

    function pressEnterKey(){
        updateCurrentLine();
        if( current_td.textContent !== '' ){
             execCommandInsertParagraph();
             execCommandFormatBlock();
        }else{
            changeCharacter(current_th,current_td);
        }
    }

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
        setRange(td);
        execCommandFormatBlock();
    }

    function pressUpDownKey(keyCode){
        updateCurrentLine();
        var tr;
        if(keyCode === UP_KEY && current_tr.previousSibling){
            tr = current_tr.previousSibling;
        }else if(keyCode === DOWN_KEY && current_tr.nextSibling){
            tr = current_tr.nextSibling;
        }
        if(tr){
            var td = tr.getElementsByTagName('td')[0];
            setRange(td);
        }
    }

    function setRange(target){
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        var text = target.lastElementChild;
        if(text){
            range.setStartAfter(text);
        }else{
            range.setStart(target,0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        updateCurrentLine();
    }

    function selectFile(filename){
        for(i=0; i<FILE_BTNS.length; i++) FILE_BTNS[i].classList.remove('current_file');
        var file = document.querySelector('[data-file="' + filename + '"]');
        file.classList.add('current_file');
    }

    function setCharacters(){
        characters = [];
        for(i=0; i<CHARACTER_BTNS.length; i++){
            if(CHARACTER_BTNS[i].checked){
                characters.push(CHARACTER_BTNS[i].value);
            }
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

    function isChrome(){
        var userAgent = window.navigator.userAgent.toLowerCase();
        if(userAgent.indexOf('chrome') != -1){
            is_chrome = true;
        }else{
            is_chrome = false;
        }
        return is_chrome;
    }

    function saveFile(filename, title, characters, script){
        storage = JSON.parse(localStorage.getItem('comeditor'));
        if(storage){
            if(!storage[filename]){
                storage[filename] = {};
            }
        }else{
            storage = {};
            storage[filename] = {};
        }
        storage['current_file'] = filename;
        storage[filename]['title']      = title;
        storage[filename]['characters'] = characters;
        storage[filename]['script']     = script;
        localStorage.setItem('comeditor',JSON.stringify(storage));
    }

    function loadFile(filename){
        storage = JSON.parse(localStorage.getItem('comeditor'));
        for(i in storage){
            if(i=='current_file') continue;
            var file = FILE_EDITOR.querySelector('[data-file="' + i + '"]');
            file.textContent = storage[i]['title'];
        }
        TITLE_EDITOR.textContent = storage[filename]['title'];
        SCRIPT_EDITOR.innerHTML = storage[filename]['script'];
        characters = storage[filename]['characters'];
        for(i=0; i<CHARACTER_BTNS.length; i++) CHARACTER_BTNS[i].checked = false;
        for(i in storage[filename]['characters']) document.getElementById('character-' + storage[filename]['characters'][i]).checked = true;
        current_td = SCRIPT_EDITOR.getElementsByTagName('td')[0];
        current_td.focus();
        setRange(current_td);
        selectFile(filename);
    }

})();
