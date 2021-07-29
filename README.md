A Live App: https://dhruvpatel.dev/spelling-practice/

A quick spell check practice app written in vanilla-js.
 
It uses webspeech API. I hate myself for using it but it was simple. So simple.

This app didn't work in Firefox, neither in Mac nor in Linux. Does it work for you in Firefox? Let me know.

It didn't even work in Chromium on Linux, didn't try on Chromium on Mac.

It works in Chrome though. Also on Edge. In both OSes I checked.

## How to use?

Simple. Copy and paste the spellings you want to practice in the box. One word per line. Then click on `Populate` button. Now in the bottom, click on the `Play` button, a voice will speak the word. Your job is to write correct spelling in the box. Once correct spell has been written, text will turn in green, and it will reset after one second. A random word from the list will be picked next for you to repeat the exercise.

In case you need are stuck, click on `View Correct` button, it will put correct spell in the box for one second and then replace with earlier text.

I use local storage API to save the populated list, so when you come back again, the list will stay there.