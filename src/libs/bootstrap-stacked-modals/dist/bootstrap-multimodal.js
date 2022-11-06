/*
 * Bootstrap multi modal support.
 * Comes with loads of monkey patching.
 *
 * https://github.com/aleho/bootstrap-multimodal
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 *
 * Copyright: Alexander Hofbauer, <alex@derhofbauer.at>
 *
 * (Originally based on https://github.com/jhaygt/bootstrap-multimodal by jhaygt.)
 *
 */
BootstrapMultimodal = (function ($) {
    var BASE_ZINDEX       = 1040;
    var ZINDEX_MULTIPLIER = 20;
    var ZINDEX_MODAL      = 10;
    var NAVBAR_SELECTOR   = '.apply-modal-open-padding .navbar';

    var modalsCount = 0;
    var $firstModal = null;


    /**
     * Hides any extra backdrops created by bootstrap and arranges the first one to always be below the top modal.
     */
    function adjustBackdrops() {
        var modalIndex     = modalsCount - 1;
        var $firstBackdrop = $('.modal-backdrop:first');

        $('.modal-backdrop').not(':first').addClass('hidden');

        if (modalIndex == 0) {
            $firstBackdrop.css('z-index', '');
        } else {
            $firstBackdrop.css('z-index', BASE_ZINDEX + (modalIndex * ZINDEX_MULTIPLIER));
        }
    }

    /**
     * Moves a modal to the correct z-index position.
     *
     * @param $modal
     */
    function adjustModal($modal) {
        var modalIndex = modalsCount - 1;

        $modal.css('z-index', BASE_ZINDEX + (modalIndex * ZINDEX_MULTIPLIER) + ZINDEX_MODAL);
    }

    /**
     * Monkey patches modal's hide for resetting of counts and body adjustments.
     *
     * @param {Object} modal
     */
    function patchModalHide(modal) {
        if (modal.__isHidePatched === true) {
            return;
        }
        modal.__isHidePatched = true;

        var hide = modal.hide;

        modal.hide = function (event) {
            var wasShown = modal.isShown;
            hide.apply(modal, arguments);

            if (!wasShown || (wasShown && this.isShown)) {
                return;
            }

            modalsCount--;

            if (modalsCount > 0) {
                adjustBackdrops();
            }
        }.bind(modal);
    }

    /**
     * Monkey patches modal's adjustDialog for resetting of counts and body adjustments.
     *
     * @param {Object} modal
     */
    function patchModalAdjustDialog(modal) {
        if (modal.__isAdjustDialogPatched === true) {
            return;
        }
        modal.__isAdjustDialogPatched = true;

        var firstModal         = $firstModal.data('bs.modal');
        var bodyIsOverflowing  = firstModal.bodyIsOverflowing;
        var scrollbarWidth     = firstModal.scrollbarWidth;

        modal.adjustDialog = function () {
            var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;

            // make sure paddings are set correctly according to first modal's determination of paddings
            this.$element.css({
                paddingLeft:  !bodyIsOverflowing && modalIsOverflowing ? scrollbarWidth : '',
                paddingRight: bodyIsOverflowing && !modalIsOverflowing ? scrollbarWidth : ''
            });
        }.bind(modal);
    }

    /**
     * Monkey patches modal's backdrop for positional adjustments.
     * Only executed for stacked modals.
     *
     * @param {Object} modal
     */
    function patchModalBackdrop(modal) {
        if (modal.__isBackdropPatched === true) {
            return;
        }
        modal.__isBackdropPatched = true;

        var backdrop = modal.backdrop;

        modal.backdrop = function () {
            backdrop.apply(modal, arguments);
            adjustBackdrops();
        };
    }

    /**
     * Patches a modal's padding setting for hidden body scrollbars.
     * Only executed for stacked modals.
     *
     * @param modal
     */
    function patchModalSetScrollbar(modal) {
        var $navbars = $(NAVBAR_SELECTOR);

        var setScrollbar = modal.setScrollbar;
        modal.setScrollbar = function () {
            setScrollbar.apply(modal, arguments);

            if (modal.bodyIsOverflowing) {
                $navbars.css('padding-right', modal.$body.css('padding-right'));
            }
        };

        var resetScrollbar = modal.resetScrollbar;
        modal.resetScrollbar = function () {
            resetScrollbar.apply(modal, arguments);

            $navbars.css('padding-right', '');
        };
    }

    /**
     * Patches a modal's methods.
     *
     * @param $modal
     */
    function patchModal($modal) {
        var modal = $modal.data('bs.modal');

        patchModalHide(modal);

        if (modalsCount == 1) {
            patchModalSetScrollbar(modal);

        } else if (modalsCount > 1) {
            adjustModal($modal);
            patchModalAdjustDialog(modal);
            patchModalBackdrop(modal);

            modal.setScrollbar   = function () { /* noop */ };
            modal.resetScrollbar = function () {
                if (modalsCount > 0) {
                    modal.$body.addClass('modal-open');
                }
            };
        }
    }


    /**
     * Bootstrap triggers the show event at the beginning of the show function and before
     * the modal backdrop element has been created.
     *
     * The additional event listener allows bootstrap to complete show, after which the modal backdrop will have been
     * created and appended to the DOM.
     *
     * @param event
     */
    function onShow(event) {
        if (event && event.isDefaultPrevented()) {
            return;
        }

        var $modal = $(event.target);

        if ($modal.data('multimodal') == 'disabled') {
            return;
        }

        modalsCount++;

        if (!$firstModal || modalsCount == 1) {
            $firstModal = $modal;
        }

        patchModal($modal);
    }


    /**
     * Enables multimodal patching.
     */
    function enable() {
        $(document).on('show.bs.modal.multimodal', onShow);
    }

    /**
     * Disables multimodal patching.
     */
    function disable() {
        $(document).off('show.bs.modal.multimodal', onShow);
    }


    // enable by default
    enable();


    return {
        disable: disable,
        enable:  enable
    };
}(jQuery));
