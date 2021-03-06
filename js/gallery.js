$(function() {
	// ======================= imagesLoaded Plugin ===============================
	// https://github.com/desandro/imagesloaded

	// $('#my-container').imagesLoaded(myFunction)
	// execute a callback when all images have loaded.
	// needed because .load() doesn't work on cached images

	// callback function gets image collection as argument
	//  this is the container

	// original: mit license. paul irish. 2010.
	// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

	$.fn.imagesLoaded 		= function( callback ) {
	var $images = this.find('img'),
		len 	= $images.length,
		_this 	= this,
		blank 	= 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

	function triggerCallback() {
		callback.call( _this, $images );
	}

	function imgLoaded() {
		if ( --len <= 0 && this.src !== blank ){
			setTimeout( triggerCallback );
			$images.off( 'load error', imgLoaded );
		}
	}

	if ( !len ) {
		triggerCallback();
	}

	$images.on( 'load error',  imgLoaded ).each( function() {
		// cached images don't fire load sometimes, so we reset src.
		if (this.complete || this.complete === undefined){
			var src = this.src;
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			// data uri bypasses webkit log warning (thx doug jones)
			this.src = blank;
			this.src = src;
		}
	});

	return this;
	};

	// gallery container
	var $rgGallery			= $('#rg-gallery'),
	// carousel container
	$esCarousel			= $rgGallery.find('div.es-carousel-wrapper'),
	// the carousel items
	$items				= $esCarousel.find('ul > li'),
	// total number of items
	itemsCount			= $items.length;

	Gallery				= (function() {
			// index of the current item
		var current			= 0,
			// mode : carousel || fullview
			mode 			= 'carousel',
			// control if one image is being loaded
			anim			= false,
			init			= function() {

				// (not necessary) preloading the images here...
				$items.add('<img src="images/ajax-loader.gif"/><img src="images/black.png"/>').imagesLoaded( function() {
					// add options
					// _addViewModes();

					// add large image wrapper
					$('#img-wrapper-tmpl').tmpl( {itemsCount : itemsCount} ).prependTo( $rgGallery );

					// show first image
					_showImage( $items.eq( current ) );

				});

				// initialize the carousel
				if( mode === 'carousel' )
					_initCarousel();

			},
			_initCarousel	= function() {

				// we are using the elastislide plugin:
				// http://tympanus.net/codrops/2011/09/12/elastislide-responsive-carousel/
				$esCarousel.show().elastislide({
					imageW 	: 200,
					onClick	: function( $item ) {
						if( anim ) return false;
						anim	= true;
						// on click show image
						_showImage($item);
						// change current
						current	= $item.index();
					}
				});

				// set elastislide's current to current
				$esCarousel.elastislide( 'setCurrent', current );

			},
			_showImage		= function( $item ) {

				// shows the large image that is associated to the $item
				current	= $item.index();

				var $loader	= $rgGallery.find('div.rg-loading').show();

				$items.removeClass('selected');
				$item.addClass('selected');

				var $thumb		= $item.find('img'),
					largesrc	= $thumb.data('id'),
					title		= $thumb.data('description');

				var str;
				if (largesrc === 0) {
					str = '<img src="images/wip.jpg" width="960" />';
				} else {
					str = '<iframe width="960" src="https://player.vimeo.com/video/' + largesrc + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
				}

				$rgGallery.find('div.rg-image').empty().append(str);

				if( title )
					$rgGallery.find('div.rg-caption').show().children('p').empty().text( title );

				$loader.hide();

				if( mode === 'carousel' ) {
					$esCarousel.elastislide( 'reload' );
					$esCarousel.elastislide( 'setCurrent', current );
				}

				anim	= false;

			},
			addItems		= function( $new ) {

				$esCarousel.find('ul').append($new);
				$items 		= $items.add( $($new) );
				itemsCount	= $items.length;
				$esCarousel.elastislide( 'add', $new );

			};

		return {
			init 		: init,
			addItems	: addItems
		};

	})();

	Gallery.init();

	/*
	Example to add more items to the gallery:

	var $new  = $('<li><a href="#"><img src="images/thumbs/1.jpg" data-large="images/1.jpg" alt="image01" data-description="From off a hill whose concave womb reworded" /></a></li>');
	Gallery.addItems( $new );
	*/
});

function vimeoLoadingThumb(ids){
	var i, id, len;

	for (i = 0, len = ids.length; i < len; i++) {
		id = ids[i];
	    var url = "http://vimeo.com/api/v2/video/" + id + ".json?callback=showThumb";

	    var id_img = "#vimeo-" + id;

	    var script = document.createElement( 'script' );
	    script.src = url;

	    $(id_img).before(script);
	}
}


function showThumb(data){
    var id_img = "#vimeo-" + data[0].id;
    $(id_img).attr('src',data[0].thumbnail_medium);
}
