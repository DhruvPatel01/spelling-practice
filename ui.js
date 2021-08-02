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

var buttonToggle = document.getElementById('buttonToggle');
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


