function make_gallery(id) { //make a gallery of the div with that id
    var folder = $('#'+id).attr('folder');
    var photo_vals = new Array();

    $.ajax({ //use synchronious ajax to get list of photos
            url : folder,
            async: false,
            success: function (data) {
                $(data).find("a").attr("href", function (i, val) {
                    if( val.match(/\.(jpe?g|png|gif)$/) ) {
                        photo_vals.push(val);
                    }
                });
            }
        });


    var photos = new Array();

    for (var i = 0; i < photo_vals.length; i++) {
        var val = photo_vals[i];
        var fn = val.substring(0, val.lastIndexOf('.')); //filename without extension
        photos.push({ src: val, srct: 'thumbs/'+fn+'.jpg', title: fn });
    }

    $('#'+id).nanogallery2( {
        // GALLERY AND THUMBNAIL LAYOUT
        galleryMosaic : [                       // default layout
          { w: 2, h: 2, c: 1, r: 1 },
          { w: 1, h: 1, c: 3, r: 1 },
          { w: 1, h: 1, c: 3, r: 2 },
          { w: 1, h: 2, c: 4, r: 1 },
          { w: 2, h: 1, c: 5, r: 1 },
          { w: 2, h: 2, c: 5, r: 2 },
          { w: 1, h: 1, c: 4, r: 3 },
          { w: 2, h: 1, c: 2, r: 3 },
          { w: 1, h: 2, c: 1, r: 3 },
          { w: 1, h: 1, c: 2, r: 4 },
          { w: 2, h: 1, c: 3, r: 4 },
          { w: 1, h: 1, c: 5, r: 4 },
          { w: 1, h: 1, c: 6, r: 4 }
        ],
        galleryMosaicXS : [                     // layout for XS width
          { w: 2, h: 2, c: 1, r: 1 },
          { w: 1, h: 1, c: 3, r: 1 },
          { w: 1, h: 1, c: 3, r: 2 },
          { w: 1, h: 2, c: 1, r: 3 },
          { w: 2, h: 1, c: 2, r: 3 },
          { w: 1, h: 1, c: 2, r: 4 },
          { w: 1, h: 1, c: 3, r: 4 }
        ],
        galleryMosaicSM : [                     // layout for SM width
          { w: 2, h: 2, c: 1, r: 1 },
          { w: 1, h: 1, c: 3, r: 1 },
          { w: 1, h: 1, c: 3, r: 2 },
          { w: 1, h: 2, c: 1, r: 3 },
          { w: 2, h: 1, c: 2, r: 3 },
          { w: 1, h: 1, c: 2, r: 4 },
          { w: 1, h: 1, c: 3, r: 4 }
        ],

        galleryMaxRows: 1,
        galleryDisplayMode: 'rows',
        gallerySorting: 'random',
        thumbnailDisplayOrder: 'random',

        thumbnailHeight: '180', thumbnailWidth: '220',
        thumbnailAlignment: 'scaled',
        thumbnailGutterWidth: 0, thumbnailGutterHeight: 0,
        thumbnailBorderHorizontal: 0, thumbnailBorderVertical: 0,

        thumbnailToolbarImage: null,
        thumbnailToolbarAlbum: null,
        thumbnailLabel: { display: false },

        // DISPLAY ANIMATION
        // for gallery
        galleryDisplayTransitionDuration: 1500,
        // for thumbnails
        thumbnailDisplayTransition: 'imageSlideUp',
        thumbnailDisplayTransitionDuration: 1200,
        thumbnailDisplayTransitionEasing: 'easeInOutQuint',
        thumbnailDisplayInterval: 60,

        // THUMBNAIL HOVER ANIMATION
        thumbnailBuildInit2: 'image_scale_1.15',
        thumbnailHoverEffect2: 'thumbnail_scale_1.00_1.05_300|image_scale_1.15_1.00',
        touchAnimation: true,
        touchAutoOpenDelay: 500,

        // LIGHTBOX
        viewerToolbar: { display: false },
        viewerTools:    {
          topLeft:   'label',
          topRight:  'shareButton, rotateLeft, rotateRight, fullscreenButton, closeButton'
        },

        // GALLERY THEME
        galleryTheme : { 
          thumbnail: { background: '#111' },
        },
    
        // DEEP LINKING
        locationHash: true,

        itemsBaseURL:     folder,
        
        // ### gallery content ### 
        items: photos
      });
}

$(document).ready( function () {
    var galleries = $('.nanogallery2');
    for (var i = 0; i < galleries.length; i++) {
        make_gallery(galleries[i].id);
    }
});