// Sketchfab Viewer API: add/remove/show/hide Annotations, annotations events
var version = '1.12.0';
var uid = 'dd958716be0b4786b8700125eec618e5';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

var error = function error() {
  console.error('Sketchfab API error');
};

var success = function success(api) {
  api.start(function () {
    api.addEventListener('viewerready', function () {
      api.getAnnotationList(function (p, list) {
        var l = list.length;
        var i = l;
        setInterval(function () {
          for (var k = 0; k < l; k++) {
            api.hideAnnotation(k);
          }

          i--;
          if (i === -1) i = l - 1;
          api.showAnnotation(i);
        }, 500);
      });
      var transitionningToAnnotation = false;
      var annotationChange = false;
      api.addEventListener('camerastart', function () {
        if (annotationChange !== false && annotationChange !== -1) {
          transitionningToAnnotation = true;
          console.log('camera annotation start');
        } else {
          console.log('camerastart');
        }
      });
      api.addEventListener('camerastop', function () {
        if (annotationChange !== false && annotationChange !== -1 && transitionningToAnnotation) {
          console.log('camera annotation stop, Annotation Displayed');
        } else if (transitionningToAnnotation) {
          console.log('camera stop, Annotation Display Interrupted');
        } else {
          console.log('camerastop');
        }

        annotationChange = false;
        transitionningToAnnotation = false;
      });
      api.addEventListener('annotationFocus', function (info) {
        console.log('annotationFocus', info);
      });
      api.addEventListener('annotationBlur', function (info) {
        console.log('annotationBlur', info);
      });
      api.addEventListener('annotationMouseEnter', function (info) {
        console.log('annotationMouseEnter', info);
      });
      api.addEventListener('annotationMouseLeave', function (info) {
        console.log('annotationMouseLeave', info);
      });
      api.addEventListener('annotationSelect', function (info) {
        if (annotationChange !== info) {
          console.log('annotationSelect', info);
          annotationChange = info;
        }
      });
      document.addEventListener('keydown', function (event) {
        if (event.which === 65) {
          // pressed 'a' it unselect
          api.unselectAnnotation();
        }

        if (event.which === 66) {
          // pressed 'b' it unselect
          api.showAnnotationTooltip(function () {
            console.log('tooltip showed');
          });
        }

        if (event.which === 67) {
          api.hideAnnotationTooltip(function () {
            console.log('tooltip hidden');
          });
        }
      });
      document.getElementById('a0').addEventListener('click', function () {
        api.gotoAnnotation(0, {
          preventCameraAnimation: true,
          preventCameraMove: true
        });
      });
      document.getElementById('a1').addEventListener('click', function () {
        api.gotoAnnotation(1, {
          preventCameraAnimation: true,
          preventCameraMove: false
        });
      });
      api.addEventListener('viewerready', function () {
        api.getSceneGraph(function (err, result) {
          if (err) {
            console.log('Error getting nodes');
            return;
          }

          console.log(result);
        });
        api.getCameraLookAt(function (err, camera) {
          api.createAnnotation([-0.167144215216577174, -3.867954799445659, 0.8214845269137563], [0.1229991557663267, -3.5779795878788656, -0.5151466147866559], camera.position, camera.target, 'mytitle1', 'mytext1 (https://image)[image]', function (index) {
            console.log('added hotspot: ' + index);
          });
          api.createAnnotation([-0.16144215216577174, -3.867954799445659, 0.8214845269137563], [0.1229991557663267, -3.5779795878788656, -0.5151466147866559], camera.position, camera.target, 'mytitle2', 'mytext2 (https://image)[image]', function (indexCreated) {
            console.log('added hotspot: ' + indexCreated);
            api.removeAnnotation(indexCreated);
          });
          api.updateAnnotation(1, {
            title: 'updatedTitle',
            content: 'updatedContent'
          }, function (err, annotation) {
            console.log(annotation);
          });
          api.getAnnotation(1, function (err, annotation) {
            console.log(annotation);
          });
        });
      });
    });
  });
};

client.init(uid, {
  success: success,
  error: error,
  autostart: 1,
  preload: 1
}); //////////////////////////////////
// GUI Code
//////////////////////////////////

function initGui() {
  var controls = document.getElementById('controls');
  var buttonsText = '';
  buttonsText += '<button id="a0">Select annotation 0 without moving camera</button>';
  buttonsText += '<button id="a1">Select annotation 1 without camera animation</button>';
  controls.innerHTML = buttonsText;
}

initGui(); //////////////////////////////////
// GUI Code end
//////////////////////////////////