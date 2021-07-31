var buttonToggle = document.getElementById('buttonToggle');
var textarea = document.getElementById('list');
var answer_box = document.getElementById('answer');

function toggleVisible(e) {
    var toHide = textarea.parentElement
    if (toHide.classList.contains('hidden')) {
        toHide.classList.remove('hidden');
        buttonToggle.text = "Close List"
    } else {
        toHide.classList.add('hidden');
        buttonToggle.text = "Open List"
    }
}

buttonToggle.addEventListener('click', toggleVisible);

var darkToggle = document.getElementById("darkToggle");
darkToggle.addEventListener('click', function(e) {
    cur = document.documentElement.dataset.theme;
    if (cur == "dark") {
        darkToggle.text = "Dark Theme";
        document.documentElement.dataset.theme = "light";
        localStorage.setItem('theme', 'light');
    } else {
        darkToggle.text = "Light Theme";
        document.documentElement.dataset.theme = "dark";
        localStorage.setItem('theme', 'dark');
    }
});

var prevTheme = localStorage.getItem('theme');
if (prevTheme != null) {
    darkToggle.text = prevTheme == 'dark'?'Light Theme': 'Dark Theme';
    document.documentElement.dataset.theme = prevTheme;
}

var spells = [];
var current = null;
var utterance = null;

function do_play(e) {
    if (utterance != null) {
        speechSynthesis.speak(utterance);
    }
}

function new_spell() {
    if (spells.length >= 1) {
        var idx = Math.floor(Math.random() * spells.length);
        current = spells[idx].trim().toLowerCase();
        utterance = new SpeechSynthesisUtterance(current);
    }
    if (answer_box.classList.contains('correct')) {
        answer_box.classList.remove('correct');
    }
    answer_box.value = '';
}

function process_list() {
    spells = [];
    for (const elem of textarea.value.split('\n')) {
        var trimmed_elem = elem.trim();
        if (trimmed_elem != null && trimmed_elem != "") {
            spells.push(elem.trim());    
        }
    }
    new_spell();
}

function load_list_from_local_db() {
    var list = window.localStorage.getItem("local_list");
    if (list != null) {
        textarea.value = list;
        process_list();
    }
}

function save_list_to_local_db() {
    window.localStorage.setItem("local_list", textarea.value);
}

load_list_from_local_db();

var buttonPopulate = document.getElementById("buttonPopulate");
buttonPopulate.addEventListener('click', function(e) {
    save_list_to_local_db();
    process_list();
    textarea.parentElement.classList.add('hidden');
    buttonToggle.text = "Open List"
});



var buttonPlay = document.getElementById("buttonPlay");
buttonPlay.addEventListener('click', do_play);

function check(e) {
    var val = answer_box.value
    if (val.trim().toLowerCase() == current) {
        answer_box.classList.add('correct');
        window.setTimeout(new_spell, 1000);
        window.setTimeout(do_play, 1500);
    }
}

answer_box.addEventListener('keyup', check);

function view_correct(e) {
    if (current != null && current != '') {
        var current_answer = answer_box.value;
        answer_box.value = ''
        answer_box.placeholder = current;
        window.setTimeout(function() {
            answer_box.placeholder = '';
            answer_box.value = current_answer;
        }, 1000);
    }
}

document.getElementById("buttonView").addEventListener('click', view_correct);

if (textarea.value != '')
    process_list();

var wordnikBase = "https://www.wordnik.com/words/"
document.getElementById('buttonWordnik').addEventListener('click', function () {
    if (current != null && current != "")
        window.open(wordnikBase + current, "", '__blank').focus();
});


function readFile(file) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      textarea.value = event.target.result;
      process_list();
    });
    reader.readAsText(file);
}

var fileButton = document.getElementById('filePicker');
fileButton.addEventListener('change', function(e) {
    for (const file of fileButton.files) {
        var type = file.type ? file.type : 'NA';
        if (type == "NA" || type == "text/plain") {
            readFile(file);
        } else {
            window.alert("Only plain text files are supported!")
        }
        break;
      }
});