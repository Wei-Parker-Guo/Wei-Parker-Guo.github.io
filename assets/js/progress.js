//an array of progress bars
var progress_bars = [];

$(document).ready( function() {
    //get all progress bars
    var bars = $('.progress-bar');
    //create progress bars
    for (var i = 0; i < bars.length; i++) {
        var bar = new ProgressBar.Line('#'+bars[i].id, {
            color: '#E87572',
            trailColor: '#eeeeee',
            strokeWidth: 5.1,
            trailWidth: 1.1,

            //steps
            from: {color: '#eeeeee', a:0},
              to: {color: '#E87572', a:1},
            // Set default step function for all animate calls
            step: function(state, bar) {
                bar.path.setAttribute('stroke', state.color);
            },
            duration: 1000,
            easing: 'bounce'
        });
        progress_bars[i] = bar;

        var value = bars.eq(i).attr('value');
        var max = bars.eq(i).attr('max');
        bar.animate(value/max);
    }
});

//scroll events: trigger animation
$(window).scroll( function() {
    //get all progress bars
    var bars = $('.progress-bar');
    //trigger progress bars if visible
    for (var i = 0; i < bars.length; i++) {
        var bar = bars.eq(i);
        //scroll offsets
        var hT = bar.offset().top,
            hH = bar.outerHeight(),
            wH = $(window).height(),
            wS = $(this).scrollTop();
        //check if the element is in viewport
        var in_view = wS > (hT+hH-wH) && (hT > wS) && (wS+wH > hT+hH);
        if (progress_bars[i].value()==0 && in_view) {
            var value = bar.attr('value');
            var max = bar.attr('max');
            progress_bars[i].animate(value/max);
        }
        //reset animation if not in view
        if(!in_view && progress_bars[i]!=0) progress_bars[i].set(0);
    }
});