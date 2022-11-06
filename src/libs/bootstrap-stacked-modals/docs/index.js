(function ($) {
    var $modal = $('.sample-modal');
    var $body  = $('body');

    /**
     * Clone our modal and show it
     */
    function showModal() {
        var $m = $modal.clone();

        $m.find('button.show-modal').data('type', 'stacked');

        $m.appendTo($body)
            .modal();
    }

    /**
     * Clone out modal and show it with the event disabled
     */
    function showModalDisabled() {
        var $m = $modal.clone();

        $m.find('button.show-modal').data('type', 'disabled');

        $m
            .appendTo($body)
            .data('multimodal', 'disabled')
            .modal();
    }


    $(document).on('click', 'button.show-modal', function (event) {
        switch ($(event.target).data('type')) {
            case 'stacked':
                showModal();
                break;

            case 'disabled':
                showModalDisabled();
                break;
        }
    });

    // clean up after cloning the modal
    $(document).on('click', 'button.close-modal', function (event) {
        var $m = $(event.target).parents('.sample-modal');

        $m.one('hidden.bs.modal', function () {
            setTimeout(function () {
                $m.remove();
            }, 0);
        });
    });
})(jQuery);
