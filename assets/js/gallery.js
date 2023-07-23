function make_gallery(id) { //make a gallery of the div with that id

    //create gallery
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
        
        // ### gallery content ### 
        items: []
      });

    //retrieve data and instance of the new gallery
    var ngy2data = $('#'+id).nanogallery2('data');
    var instance = $('#'+id).nanogallery2('instance');

    //get photo folder from github repo using github api
    var owner = $('#'+id).attr('owner');
    var repo = $('#'+id).attr('repo');
    var path = $('#'+id).attr('path');
    var photos = new Array();
    var photo_thumbs = new Array();

    (async () => {
        const response = await fetch('https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+path);
        const data = await response.json();
        const response_t = await fetch('https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+path+'/thumbs');
        const data_t = await response_t.json();
        //write
        for (let file of data) {
          if( file.name.match(/\.(jpe?g|png|gif)$/) ) photos.push(file);
        }
        for (let file of data_t) {
          if( file.name.match(/\.(jpe?g|png|gif)$/) ) photo_thumbs.push(file);
        }
        //add new photos
        for (var i = 0; i < photos.length; i++) {
            var ID = ngy2data.items.length + 1;
            var albumID = '0';
            var newItem = NGY2Item.New(instance, photos[i].name.replace(/\.[^/.]+$/, ""), '', ID, albumID, 'image', '' );

            // define thumbnail -> image displayed in the gallery
            newItem.thumbSet( photo_thumbs[i].download_url, 180, 220); // w,h

            // define URL of the media to display in lightbox
            newItem.setMediaURL( photos[i].download_url, 'img');

            // add new item to current Gallery Object Model (GOM) 
            newItem.addToGOM();
        }
        // refresh the display (-> only once if you add multiple items)
        $('#'+id).nanogallery2('resize');
    })()
}

$(document).ready( function () {
    var galleries = $('.nanogallery2');
    for (var i = 0; i < galleries.length; i++) {
        make_gallery(galleries[i].id);
    }
});