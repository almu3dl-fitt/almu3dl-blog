(function( $ ) {
    $.unserialize = function(serializedString){
        var str = decodeURI(serializedString);
        var pairs = str.split('&');
        var obj = {}, p, idx, val;
        for (var i=0, n=pairs.length; i < n; i++) {
            p = pairs[i].split('=');
            idx = p[0];

            if (idx.indexOf("[]") == (idx.length - 2)) {
                // Eh um vetor
                var ind = idx.substring(0, idx.length-2)
                if (obj[ind] === undefined) {
                    obj[ind] = [];
                }
                obj[ind].push(p[1]);
            }
            else {
                obj[idx] = p[1];
            }
        }
        return obj;
    };

    $('.bw-color-field').wpColorPicker();

    jQuery(document).ajaxSuccess(function(e, xhr, settings) {

        var widget_id_base = 'better_weather_widget';

        if( typeof settings.data != "string" )
            return false;

        var _settings = $.unserialize(settings.data);

        if( settings.data.search('action=save-widget') != -1 && settings.data.search('id_base=' + widget_id_base) != -1) {

            var $_widget = $('input[value=better_weather_widget-'+_settings['widget_number']).closest('.widget');
            $_widget.find('.bw-color-field').wpColorPicker();

        }

    });

})( jQuery );