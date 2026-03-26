/**
 * BetterWeather v3
 * Author: BetterStudio (http://themeforest.net/user/Better-Studio?ref=Better-Studio)
 * @license BetterStudio
*/
(function($){
    $.betterWeather = function(el, options){
        var base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.data("betterWeather", base);

        // Template Initialized
        base.templateInitialized = false;

        // Detecting retina
        base.retina = window.devicePixelRatio > 1;

        base.init = function(){

            // Init svg icon
            base.initIcons();

            // widget mode init
            if(  base.$el.hasClass( 'better-weather') ){
                base.prettifyIconSize();
                $( window ).resize(function() {
                    base.prettifyIconSize();
                });
            }

            // Hide loader after EQ init
            setTimeout(function(){
                base.helper.hideLoader();
            }, 600);

        };

        base.initIcons = function(){

            if( ! base.$el.hasClass( 'animated-icons' ) ) {
                return;
            }
                // Prepare icons for widget
            if( base.$el.hasClass( 'better-weather' ) ){

                // Base Icon Manager
                if( base.helper.isCanvasSupported() ){
                    base.skycons = new Skycons({
                        "color" : base.$el.data('font-color'),
                        "dropShadow" : true
                    });
                }

                // Big icon
                if( base.$el.hasClass( 'style-normal' ) ){
                    var _id = '#' + base.$el.attr('id') +'-summary-icon';
                    $( _id ).attr( 'height', base.helper.getCorrectSize( 85 )).attr( 'width', base.helper.getCorrectSize( 85 ));
                    base.skycons.set( base.$el.attr('id') +'-summary-icon' , $( _id ).data( 'icon' ) );
                    base.skycons.play();
                }else{
                    var _id = '#' + base.$el.attr('id') +'-summary-icon';
                    $( _id ).attr( 'height', base.helper.getCorrectSize( 55 )).attr( 'width', base.helper.getCorrectSize( 55 ));
                    base.skycons.set( base.$el.attr('id') +'-summary-icon' , $( _id ).data( 'icon' ) );
                    base.skycons.play();
                }


                // Days icons
                if( base.$el.hasClass( 'have-next-days' ) ){

                    var _id = '#' + base.$el.attr('id');

                    // Day 1 icon
                    $( _id + '-day1-icon' ).attr( 'height', base.helper.getCorrectSize( 17 )).attr( 'width', base.helper.getCorrectSize( 17 ));
                    base.skycons.set( base.$el.attr('id') + '-day1-icon' , $( _id +'-day1-icon' ).data( 'icon' ) );
                    base.skycons.play();

                    // Day 2 icon
                    $( _id + '-day2-icon' ).attr( 'height', base.helper.getCorrectSize( 17 )).attr( 'width', base.helper.getCorrectSize( 17 ));
                    base.skycons.set( base.$el.attr('id') + '-day2-icon' , $( _id +'-day2-icon' ).data( 'icon' ) );
                    base.skycons.play();

                    // Day 3 icon
                    $( _id + '-day3-icon' ).attr( 'height', base.helper.getCorrectSize( 17 )).attr( 'width', base.helper.getCorrectSize( 17 ));
                    base.skycons.set( base.$el.attr('id') + '-day3-icon' , $( _id +'-day3-icon' ).data( 'icon' ) );
                    base.skycons.play();

                    // Day 4 icon
                    $( _id + '-day4-icon' ).attr( 'height', base.helper.getCorrectSize( 17 )).attr( 'width', base.helper.getCorrectSize( 17 ));
                    base.skycons.set( base.$el.attr('id') + '-day4-icon' , $( _id +'-day4-icon' ).data( 'icon' ) );
                    base.skycons.play();
                }

            } else if( base.$el.hasClass( 'better-weather-inline' ) ){ // Prepare icons for inline style

                // Base Icon Manager
                if( base.helper.isCanvasSupported() ){
                    base.skycons = new Skycons({
                        "color" : base.$el.data('font-color'),
                        "dropShadow" : false
                    });
                }

                var _w = '', _h ='';
                switch ( base.$el.data('inline-size') ){
                    case 'small':
                        _h = _w = 18;
                        break;
                    case 'medium':
                        _h = _w = 30;
                        break;
                    case 'large':
                        _h = _w = 55;
                        break;
                }

                $( '#' + base.$el.attr('id') +'-summary-icon' ).attr( 'height', _h ).attr( 'width', _w );
                base.skycons.set( base.$el.attr('id') +'-summary-icon' , $( '#' + base.$el.attr('id') + '-summary-icon').data( 'icon' ) );
                base.skycons.play();

            }


        };

        base.prettifyIconSize = function(){

            var _w = base.$el.width();
            var $_icon = base.$el.find('.bw_summary .bw_icon');

            if( $_icon.hasClass( 'hw_static-icon' ) ){
                return;
            }

            switch( true ){

                case _w <= 70:
                    base.helper.updateIconSize( $_icon , 28 , 28 );
                    break;

                case _w <= 100:
                    base.helper.updateIconSize( $_icon , 35 , 35 );

                    break;

                case _w <= 200:
                    base.helper.updateIconSize( $_icon , 40 , 40 );
                    break;

                case _w <= 400:
                    if( base.$el.hasClass( 'style-modern' ) ){
                        base.helper.updateIconSize( $_icon , 55 , 55 );
                    }else if( base.$el.hasClass( 'style-modern' ) ){
                        base.helper.updateIconSize( $_icon , 70 , 70 );
                    }
                    break;

                case _w <= 1170:
                    base.helper.updateIconSize( $_icon , 35 , 35 );
                    break;
            }

        };

        base.helper = {
            getCorrectSize: function( value ){
                if( base.retina ){
                    return value * 2;
                }
                else{
                    return value;
                }
            },
            updateIconSize: function( $_icon , width , height ){
                $_icon.attr( 'width' , base.helper.getCorrectSize(width));
                $_icon.attr( 'height' , base.helper.getCorrectSize(height));
                $_icon.css( "width" , width+'px' );
                $_icon.css( "height" , height+'px' );
            },
            hideLoader: function(){
                base.$el.find('.bw-loader').remove();
            },
            isCanvasSupported: function() {
                var elem = document.createElement('canvas');
                return !!(elem.getContext && elem.getContext('2d')) ;
            }
        };

        // Hack for element query on local/cross domain
        if (typeof elementQuery == 'function') {
            elementQuery({
                ".better-weather": {"max-width": ["2000px", "1170px", "970px", "900px", "830px", "650px", "550px", "440px", "400px", "350px", "300px", "250px", "200px", "170px", "120px", "100px", "50px"]},
            });
        }

        base.init();
    };

    $.fn.betterWeather = function(options){
        return this.each( function(){
            new $.betterWeather(this, options);
        });
    };
})(jQuery);

(function( $ ) {

    $('.better-weather, .better-weather-inline').each(function(){
        $(this).betterWeather();
    });

})( jQuery );
