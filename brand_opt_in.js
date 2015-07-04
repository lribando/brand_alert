/*jshint asi: false, bitwise: true, boss: false, curly: true, eqeqeq: true, eqnull: false, evil: false, forin: false, immed: true, laxbreak: false, newcap: true, noarg: true, noempty: true, nonew: false, nomen: false, onevar: true, plusplus: false, regexp: false, undef: true, sub: false, strict: false, white: false */
/*jshint browser: true, maxerr: 50, passfail: false */
/*global createModule: false*/

/**
 * @module src.controllers.brand_opt_in
 */

createModule(
  'src.controllers.brand_opt_in',
  [
    'vendor.jquery',
    'common.template',
    'dom.viewport'
  ],
function ($, template, viewport) {
  var
    searchResults,
    brandOptInElem,
    hidePopUp,
    init,
    turnOnScrollMonitor,
    turnOffScrollMonitor,
    enablePopup,
    disablePopup,
    monitorScrollIfNecessary,

    // If current page state allows the banner to be shown.
    isEnabled = false,

    // If the banner is available to be shown at all.
    isAvailable = false;

  disablePopup = function() {
    isEnabled = false;
    monitorScrollIfNecessary();
  };

  enablePopup = function() {
    isEnabled = true;
    monitorScrollIfNecessary();
  };

  monitorScrollIfNecessary = function() {
    if (isEnabled && isAvailable) {
        turnOnScrollMonitor();
      } else {
        turnOffScrollMonitor();
      }
  };

  function bindEvents () {

    if (searchResults.length) {
      searchResults.on('click touchstart', '.opt-in-confirm', function (e) {
        e.preventDefault();
        brandOptInElem.removeClass('follow').addClass('confirmed');
      });

      searchResults.on('click touchstart', '.opt-in-close', function () {
        brandOptInElem.removeClass('follow').addClass('brand-alert-hide');
      });
    }
  }

  init = function(baBrandId, baBrandName) {
    searchResults = $('.search-results.sale-listing');

    if (!baBrandId){
      // if not single brand sale, then bail
      return;
    }

    $('.unfollow-brand').data('brand-id', baBrandId);

    template.render('src/brand_opt_in_popup', { singleBrandSaleBrandName: baBrandName, singleBrandSaleBrandId: baBrandId }).then(function (html) {
      searchResults.append(html);
      brandOptInElem = $('.brand-alert-opt-in');
      bindEvents();
      hidePopUp();
      isAvailable = true;
      monitorScrollIfNecessary();
    });
  };

  function fadeIn() {
    brandOptInElem.addClass('follow');
  }

  hidePopUp = function hidePopUp() {
    if (brandOptInElem.hasClass('follow')){
      if (viewport.isElementInViewport($('.nav-footer')[0]) || !viewport.isElementInViewport($('.inventory-status.sold_out')[0])) {
          brandOptInElem.hide();
      }
      else {
        brandOptInElem.show();
      }
    }
    setTimeout(hidePopUp, 500);
  };

  turnOffScrollMonitor = function() {
    $(window).off('scroll.checkScroll');
  };

  turnOnScrollMonitor = function() {
    $(window).on('scroll.checkScroll', function() {
      var
        targetHeight,
        isSoldOutItemInViewPort,
        soldOuts = $('.inventory-status.sold_out'),
        doc = $(document);

      if(soldOuts.length) {
        targetHeight = soldOuts.first().offset().top + 100;
        isSoldOutItemInViewPort = viewport.isElementTopInView($('.inventory-status.sold_out')[0]);

        if(isSoldOutItemInViewPort && (doc.scrollTop() + $(window).height() >= targetHeight)) {
          if ($('.brand-alert-opt-in').length) {
            if (!brandOptInElem.hasClass('follow') && !brandOptInElem.hasClass('confirmed')) {
              fadeIn();
              turnOffScrollMonitor();
            }
          }
        }
      }
    });
  }

  return {
    init: init,
    disablePopup: disablePopup,
    enablePopup: enablePopup
  };
});
