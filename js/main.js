/* document ready
-------------------------------------------------------------------------------------*/
$(document).ready(function() {
    var $btn = $('.icon-info');

    $btn.click(function(event) {
        // swap content and btn text
        $('.modal-info').fadeToggle('fast');
        if ($btn.text() === '?')
            $btn.text('X');
        else
            $btn.text('?');
    });
});
