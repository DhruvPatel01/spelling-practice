var buttonToggle = document.getElementById('buttonToggle');
var buttonPlay = document.getElementById("buttonPlay");
var textarea = document.getElementById('list');
var answer_box = document.getElementById('answer');
var configHalfTime = document.getElementById("halftime");

var spells = [];
var current = null;
var utterance = null;
var seq_idx = 0;



function get_time() {
    return Date.now() / 1000 ; // in seconds
}
var baseline_time = get_time();

// currentWasCorrect will be used for the purpose of Thompson Sampling(TS)
// if user enters backspace or delete, this will become false.
var currentWasCorrect = true;

function do_play(e) {
    if (utterance != null) {
        speechSynthesis.speak(utterance);
    }
    answer_box.focus()
}
buttonPlay.addEventListener('click', do_play);

function find_hardest() {
    var idx = null;
    var best = 1000;
    var elapsed = get_time() - baseline_time;

    for (var i = 0; i < spells.length; i++) {
        var elem = spells[i];
        var recall_prob = ebisu.predictRecall(elem[1], elapsed, exact=true);
        // console.log(elem[0], recall_prob);
        if (recall_prob <= best) {
            best = recall_prob;
            idx = i;
        } 
    }
    // console.log(idx);
    return idx;
}

var summary_idx = document.getElementById('summary_index');
function updateSummaryIndex() {
    summary_idx.textContent = seq_idx;
}

function new_spell(update=true) {
    if (update && current != null) {
        var success = currentWasCorrect?1:0;
        var elapsed = get_time() - baseline_time;
        current[1] = ebisu.updateRecall(current[1], success, 1, elapsed);
    }
    
    if (spells.length >= 1) {
        var idx = find_hardest();
        seq_idx += 1;
        updateSummaryIndex();
        current = spells[idx];
        utterance = new SpeechSynthesisUtterance(current[0]);
    }
    if (answer_box.classList.contains('correct')) {
        answer_box.classList.remove('correct');
    }
    answer_box.value = '';
    currentWasCorrect = true;
}

function process_list() {
    spells = [];
    var half_time = parseFloat(configHalfTime.value);
    half_time = isNaN(half_time)?60:half_time;
    half_time = half_time*60;

    for (const elem of textarea.value.split('\n')) {
        var trimmed_elem = elem.trim();
        if (trimmed_elem != null && trimmed_elem != "") {
            spells.push([trimmed_elem, ebisu.defaultModel(half_time)]);
        }
    }
    seq_idx = 0;
    baseline_time = get_time();
    new_spell(false);
}

function load_list_from_local_db() {
    var list = window.localStorage.getItem("local_list:spells");
    if (list != null) {
        baseline_time = window.localStorage.getItem("local_list:baseline_time");
        list = JSON.parse(list);

        spells = [];
        var val = '';
        for (const elem of list) {
            spells.push(elem);
            val += elem[0] + '\n';
        }
        textarea.value = val;
        new_spell(false);
    }
}

load_list_from_local_db();

function save_list_to_local_db() {
    if (spells.length > 0) {
        var val = JSON.stringify(spells);
        window.localStorage.setItem("local_list:spells", val);
        window.localStorage.setItem("local_list:baseline_time", baseline_time);
    }
}

// window.setTimeout(save_list_to_local_db, 10000);
var saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', save_list_to_local_db);

var buttonPopulate = document.getElementById("buttonPopulate");
buttonPopulate.addEventListener('click', function (e) {
    process_list();
    save_list_to_local_db();
    // textarea.parentElement.classList.add('hidden');
    // buttonToggle.text = "Open List"
});


function check() {
    var val = answer_box.value
    if (val.trim().toLowerCase() == current[0].toLowerCase()) {
        answer_box.classList.add('correct');
        window.setTimeout(new_spell, 500);
        window.setTimeout(do_play, 600);
    }
}

// https://stackoverflow.com/a/5926782
var typingTimer;                //timer identifier
var doneTypingInterval = 500;  //time in ms

answer_box.addEventListener('keyup', function (e) {
    if (e.code == 'Backspace') {
        currentWasCorrect = false;
    }
    clearTimeout(typingTimer);
    if (answer_box.value) {
        typingTimer = setTimeout(check, doneTypingInterval);
    }
});


function viewCorrect(e) {
    if (current != null && current != '') {
        currentWasCorrect = false;
        
        var current_answer = answer_box.value;
        answer_box.value = ''
        answer_box.placeholder = current[0];
        window.setTimeout(function () {
            answer_box.placeholder = '';
            answer_box.value = current_answer;
            answer_box.focus();
        }, 800);
    }
}
document.getElementById("buttonView").addEventListener('click', viewCorrect);

if (textarea.value != '' && spells == null)
    process_list();

var skipButton = document.getElementById("skipButton");

function do_skip(e) {
    new_spell(true);
    do_play();
}
skipButton.addEventListener('click', do_skip);

var wordnikBase = "https://www.wordnik.com/words/"
var vocabularyBase = "https://www.vocabulary.com/dictionary/"

document.getElementById('buttonWordnik').addEventListener('click', function () {
    if (current != null && current[0] != "")
        window.open(wordnikBase + current[0], "").focus();
});
document.getElementById('buttonVocabulary').addEventListener('click', function () {
    if (current != null && current[0] != "")
        window.open(vocabularyBase + current[0], "").focus();
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
fileButton.addEventListener('change', function (e) {
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

function keyboard_shortcuts(e) {
    console.log("in document");

}

// document.addEventListener('keyup', keyboard_shortcuts);