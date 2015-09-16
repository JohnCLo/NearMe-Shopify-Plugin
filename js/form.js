$(function(){

    // This link should be the link to the Google Form
    var formUrl = 'https://docs.google.com/spreadsheet/formResponse?formkey=dC1VQTFOUFlBd09WcV9rcVc0VU9FVFE6MQ';

    // Handle form submission
    $('form').submit(function(e) {
        var button = $('input[type=submit]', this),
            data = $(this).serialize();

        e.preventDefault();
        if (validate($(this))) {
            button.button('loading');
            $.ajax({
                type: 'POST',
                url: formUrl,
                data: data,
                complete: function() {
                    button.button('reset');
                    window.location = 'report.html';
                }
            });
        }

        function validate(form) {
            $('.control-group').removeClass('error');
            $('input, textarea', form).each(function() {
                var tag = $(this)[0].tagName.toLowerCase(),
                    type = $(this).attr('type');

                // Validate radio buttons
                if (tag === 'input' && type === 'radio') {
                    var name = $(this).attr('name');
                    if ($('[name="' + name + '"]:checked').length < 1) {
                        $(this).parent().parent().parent().addClass('error');
                    }
                }

                // Validate text fields
                if ((tag === 'input' && type === 'text') || tag === 'textarea') {
                    if ($(this).val() === '' && !$(this).parent().hasClass('radio')) {
                        $(this).parent().parent().addClass('error');
                    }
                }
            });

            if ($('.control-group.error').length < 1) return true;
            $('.control-group.error').length
            
            $('html, body').animate({
                scrollTop: $('.control-group.error').offset().top - 20
            }, 500);

            return false;
        }
    });

    //input lat lon with relevant variables here
    function saveLatLon(loc) {
        $('#entry_1').val(loc.lon);
        $('#entry_2').val(loc.lat);
    }
});
