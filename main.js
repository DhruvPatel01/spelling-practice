var buttonToggle = document.getElementById('buttonToggle');
var buttonPlay = document.getElementById("buttonPlay");
var textarea = document.getElementById('list');
var answer_box = document.getElementById('answer');

var spells = [];
var current = null;
var utterance = null;
var seq_idx = 0;

// currentWasCorrect will be used for the purpose of Thompson Sampling(TS)
// if user enters backspace or delete, this will become false.
var currentWasCorrect = true;

function do_play(e) {
    if (utterance != null) {
        speechSynthesis.speak(utterance);
    }
}
buttonPlay.addEventListener('click', do_play);

function thompsonSampling() {
    var idx = null;
    var best = 0;

    var alpha = 1;
    var beta = 1;

    for (var i = 0; i < spells.length; i++) {
        var elem = spells[i];
        alpha = elem[1];
        beta = elem[2];
        console.log("IN");
        theta = rbeta(alpha, beta);
        console.log("OUT");
        if (theta > best) {
            best = theta;
            idx = i;
        }
    }

    return idx;
}

var summary_idx = document.getElementById('summary_index');
function updateSummaryIndex() {
    summary_idx.textContent = seq_idx;
}

function new_spell() {
    // if (current != null) {
    //     if (currentWasCorrect)
    //         current[2] += 1;
    //     else
    //         current[1] += 1;
    // }
    if (spells.length >= 1) {
        // var idx = Math.floor(Math.random() * spells.length);
        // var idx = thompsonSampling();
        var idx = seq_idx;
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
    for (const elem of textarea.value.split('\n')) {
        var trimmed_elem = elem.trim();
        if (trimmed_elem != null && trimmed_elem != "") {
            spells.push([trimmed_elem, 1, 1]);
        }
    }
    seq_idx = 0;
    new_spell();
}

function load_list_from_local_db() {
    var list = window.localStorage.getItem("local_list");
    if (list != null) {
        list = JSON.parse(list);

        spells = [];
        var val = '';
        for (const elem of list) {
            spells.push(elem);
            val += elem[0] + '\n';
        }
        textarea.value = val;
        new_spell();
    }
}

load_list_from_local_db();

function save_list_to_local_db() {
    if (spells.length > 0) {
        var val = JSON.stringify(spells);
        window.localStorage.setItem("local_list", val);
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


//
//  Beta distribution related code
//  Copied from: https://stackoverflow.com/a/13569020
//

function sum(nums) {
    var accumulator = 0;
    for (var i = 0, l = nums.length; i < l; i++)
        accumulator += nums[i];
    return accumulator;
}


// like betavariate, but more like R's name
function rbeta(alpha, beta) {
    var alpha_gamma = rgamma(alpha, 1);
    return alpha_gamma / (alpha_gamma + rgamma(beta, 1));
}

// From Python source, so I guess it's PSF Licensed
var SG_MAGICCONST = 1 + Math.log(4.5);
var LOG4 = Math.log(4.0);

function rgamma(alpha, beta) {
    // does not check that alpha > 0 && beta > 0
    if (alpha > 1) {
        // Uses R.C.H. Cheng, "The generation of Gamma variables with non-integral
        // shape parameters", Applied Statistics, (1977), 26, No. 1, p71-74
        var ainv = Math.sqrt(2.0 * alpha - 1.0);
        var bbb = alpha - LOG4;
        var ccc = alpha + ainv;

        while (true) {
            var u1 = Math.random();
            if (!((1e-7 < u1) && (u1 < 0.9999999))) {
                continue;
            }
            var u2 = 1.0 - Math.random();
            v = Math.log(u1 / (1.0 - u1)) / ainv;
            x = alpha * Math.exp(v);
            var z = u1 * u1 * u2;
            var r = bbb + ccc * v - x;
            if (r + SG_MAGICCONST - 4.5 * z >= 0.0 || r >= Math.log(z)) {
                return x * beta;
            }
        }
    }
    else if (alpha == 1.0) {
        var u = Math.random();
        while (u <= 1e-7) {
            u = Math.random();
        }
        return -Math.log(u) * beta;
    }
    else { // 0 < alpha < 1
        // Uses ALGORITHM GS of Statistical Computing - Kennedy & Gentle
        while (true) {
            var u3 = Math.random();
            var b = (Math.E + alpha) / Math.E;
            var p = b * u3;
            if (p <= 1.0) {
                x = Math.pow(p, (1.0 / alpha));
            }
            else {
                x = -Math.log((b - p) / alpha);
            }
            var u4 = Math.random();
            if (p > 1.0) {
                if (u4 <= Math.pow(x, (alpha - 1.0))) {
                    break;
                }
            }
            else if (u4 <= Math.exp(-x)) {
                break;
            }
        }
        return x * beta;
    }
}
