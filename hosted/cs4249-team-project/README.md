
# CS4249 Team G07 Project - SketchFab

Hi! This is the repository for our project's experiment apparatus. To work with your implementation you just need to edit the html and js documents given.

## Setup

To start working, clone this repository and create your own branch (name with your name) to commit and push to.

### Layout Implementation
The homepage of three different layout prototypes are:

- Original Layouts: [origin folderl](./origin)
- Cluster Layouts: [cluster folder](./cluster)
- Enhanced List Layouts: [list folder](./list)

For each layout folders, three html files need to be filled in for the three models we have for trials. Take origin for example, the files should be:

- [origin-simple.html](./origin/origin-simple.html)
- [origin-clustered.html](./origin/origin-clustered.html)
- [origin-well-spread.html](./origin/origin-well-spread.html)

We are gonna use these three models for each case:

[**Model with Simple Annotations**](https://skfb.ly/6W8Xy)

<div class="sketchfab-embed-wrapper"> <iframe title="Ju87 Stuka B2 Dive Bomber (T6+CK) Parked" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/bb079342d29b483c8d6e6f757cef9b4c/embed"> </iframe> <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> <a href="https://sketchfab.com/3d-models/ju87-stuka-b2-dive-bomber-t6ck-parked-bb079342d29b483c8d6e6f757cef9b4c?utm_medium=embed&utm_campaign=share-popup&utm_content=bb079342d29b483c8d6e6f757cef9b4c" target="_blank" style="font-weight: bold; color: #1CAAD9;"> Ju87 Stuka B2 Dive Bomber (T6+CK) Parked </a> by <a href="https://sketchfab.com/lylecay?utm_medium=embed&utm_campaign=share-popup&utm_content=bb079342d29b483c8d6e6f757cef9b4c" target="_blank" style="font-weight: bold; color: #1CAAD9;"> Lyle </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=bb079342d29b483c8d6e6f757cef9b4c" target="_blank" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p></div>

[**Model with Clustered Annotations**](https://skfb.ly/LqMv)

<div class="sketchfab-embed-wrapper"> <iframe title="SkyLand- Erin and her leap of faith" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/ea312cd63c07426ab3df275139525341/embed"> </iframe> <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> <a href="https://sketchfab.com/3d-models/skyland-erin-and-her-leap-of-faith-ea312cd63c07426ab3df275139525341?utm_medium=embed&utm_campaign=share-popup&utm_content=ea312cd63c07426ab3df275139525341" target="_blank" style="font-weight: bold; color: #1CAAD9;"> SkyLand- Erin and her leap of faith </a> by <a href="https://sketchfab.com/midio?utm_medium=embed&utm_campaign=share-popup&utm_content=ea312cd63c07426ab3df275139525341" target="_blank" style="font-weight: bold; color: #1CAAD9;"> Midio </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=ea312cd63c07426ab3df275139525341" target="_blank" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p></div>

[**Model with Well-spread Annotations**](https://skfb.ly/oqWwr)

<div class="sketchfab-embed-wrapper"> <iframe title="Kungssalen / The King's Hall" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/ae89eaa902574329a3444f5d80461f7f/embed"> </iframe> <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> <a href="https://sketchfab.com/3d-models/kungssalen-the-kings-hall-ae89eaa902574329a3444f5d80461f7f?utm_medium=embed&utm_campaign=share-popup&utm_content=ae89eaa902574329a3444f5d80461f7f" target="_blank" style="font-weight: bold; color: #1CAAD9;"> Kungssalen / The King's Hall </a> by <a href="https://sketchfab.com/lackoslott?utm_medium=embed&utm_campaign=share-popup&utm_content=ae89eaa902574329a3444f5d80461f7f" target="_blank" style="font-weight: bold; color: #1CAAD9;"> Läckö Slott </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=ae89eaa902574329a3444f5d80461f7f" target="_blank" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p></div>

I suggest creating a prototype html page along with your js implementation, then just change the link to the model in the api functions for each of your html file. I have also provided an [annotation_example.js](./annotation_example.js) file in the root directory. For the api you need to include [sketchfab-viewer-1.12.0.js](./sketchfab-viewer-1.12.0.js) in the root directory.

### Logging Implementation
The logging instruments are in the [logging folder](./logging). I think a good start will be to create a test.html file and include buttons to interact with. Specifically, we need these reporting functions:

- Functions to record timestamps of user entering and leaving this webpage.
- Functions to record timestamps upon clicking a specific button.
- Functions to record total keystrokes and mouse clicks.
- Functions to record total pointer movement distance.
- Functions to record errors, the errors are defined by accidental clicks on unwanted buttons.

After recording, all the data should be sent to a google form. You can create this form in the shared google drive folder we have.

## Resources

We are working with SketchFab's ViewerAPI, you may find these documentations helpful:

- [Sketchfab Viewer API Homepage](https://sketchfab.com/developers/viewer)
- [Example Use Cases](https://sketchfab.com/developers/viewer/examples)

We don't need any fancy formatting so no CSS is necessary. Let's try to be fast and simple! If you have any problems, I'm usually online on Discord until 10pm everyday.

Cheers!
