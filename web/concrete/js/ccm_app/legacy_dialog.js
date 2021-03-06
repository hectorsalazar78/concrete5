$.widget.bridge( "jqdialog", $.ui.dialog );

// wrap our old dialog function in the new dialog() function.
jQuery.fn.dialog = function() {
	// Pass this over to jQuery UI Dialog in a few circumstances
	if (arguments.length > 0) {
		$(this).jqdialog(arguments[0], arguments[1], arguments[2]);
		return;
	} else if ($(this).is('div')) {
		$(this).jqdialog();
		return;
	}
	// LEGACY SUPPORT
	return $(this).each(function() {
		$(this).click(function(e) {
			var href = $(this).attr('href');
			var width = $(this).attr('dialog-width');
			var height =$(this).attr('dialog-height');
			var title = $(this).attr('dialog-title');
			var onOpen = $(this).attr('dialog-on-open');
			var onDestroy = $(this).attr('dialog-on-destroy');
			var appendButtons = $(this).attr('dialog-append-buttons');
			var onClose = $(this).attr('dialog-on-close');
			obj = {
				modal: true,
				href: href,
				width: width,
				height: height,
				title: title,
				appendButtons: appendButtons,
				onOpen: onOpen,
				onDestroy: onDestroy,
				onClose: onClose
			}
			jQuery.fn.dialog.open(obj);
			return false;
		});	
	});
}

jQuery.fn.dialog.close = function(num) {
	num++;
	$("#ccm-dialog-content" + num).jqdialog('close');
}

jQuery.fn.dialog.open = function(obj) {
	jQuery.fn.dialog.showLoader();
	if (ccm_uiLoaded) {
		ccm_hideMenus();
	}
	var nd = $(".ui-dialog").length;
	nd++;
	$('body').append('<div id="ccm-dialog-content' + nd + '" style="display: none"></div>');
	
	if (typeof(obj.width) == 'string') {
		if (obj.width.indexOf('%', 0) > 0) {
			w = obj.width.replace('%', '');
			w = $(window).width() * (w / 100);
			w = w + 50;
		} else {
			w = parseInt(obj.width) + 50;
		}
		
		if (obj.height.indexOf('%', 0) > 0) {
			h = obj.height.replace('%', '');
			h = $(window).height() * (h / 100);
			h = h + 100;
		} else {
			h = parseInt(obj.height) + 100;
		}
	} else if (obj.width) { 
		w = parseInt(obj.width) + 50;
		h = parseInt(obj.height) + 100;
	} else {
		w = 550;
		h = 400;
	}
	if (obj.appendButtons) {
		var buttons = [{}];
	} else {
		var buttons = false;
	}
	if (h > $(window).height()) {
		h = $(window).height();
	}
	$("#ccm-dialog-content" + nd).jqdialog({
		'modal': true,
		'height': h,
		'width': w,
		show:{
		effect:"fade", 
		duration:150, 
		easing:"easeInExpo"
		},
		'escapeClose': true,
		'buttons': buttons,
		'title': obj.title,
		'open': function() {
			$("body").css("overflow", "hidden");
		},
		'beforeClose': function() {
			$("body").css("overflow", "auto");		
		},
		'close': function(ev, u) {
			$(this).jqdialog('destroy').remove();
			$("#ccm-dialog-content" + nd).remove();
			if (typeof obj.onClose != "undefined") {
				if ((typeof obj.onClose) == 'function') {
					obj.onClose();
				} else {
					eval(obj.onClose);
				}
			}
			if (typeof obj.onDestroy != "undefined") {
				if ((typeof obj.onDestroy) == 'function') {
					obj.onDestroy();
				} else {
					eval(obj.onDestroy);
				}
			}
			nd--;
		}
	});		
	
	if (!obj.element) {
		$.ajax({
			type: 'GET',
			url: obj.href,
			success: function(r) {
				jQuery.fn.dialog.hideLoader();
				$("#ccm-dialog-content" + nd).html(r);
				$("#ccm-dialog-content" + nd + " .dialog-launch").dialog();
				$("#ccm-dialog-content" + nd + " .ccm-dialog-close").click(function() {
					jQuery.fn.dialog.closeTop();
				});
				if ($("#ccm-dialog-content" + nd + " .dialog-buttons").length > 0) {
					$("#ccm-dialog-content" + nd).parent().find('.ui-dialog-buttonpane').addClass("ccm-ui");
					$("#ccm-dialog-content" + nd + " .dialog-buttons").appendTo($("#ccm-dialog-content" + nd).parent().find('.ui-dialog-buttonpane').html(''));
					$("#ccm-dialog-content" + nd + " .dialog-buttons").remove();
				}
				if ($("#ccm-dialog-content" + nd + " .dialog-help").length > 0) {
					$("#ccm-dialog-content" + nd + " .dialog-help").hide();
					if (ccmi18n.helpPopup) {
						var helpText = ccmi18n.helpPopup;
					} else {
						var helpText = 'Help';
					}
					$("#ccm-dialog-content" + nd).parent().find('.ui-dialog-titlebar').append('<span class="ccm-dialog-help"><a href="javascript:void(0)" onclick="ccm_togglePopover(event, this)" title="' + helpText + '" id="ccm-menu-help">Help</a></span>');
					$("#ccm-menu-help").popover({content: function() {
						var id = $(this).attr('id') + '-content';
						return $('#' + id).html();
						
					}, placement: 'below', html: true, trigger: 'manual'});

					
				}
				if (typeof obj.onOpen != "undefined") {
					if ((typeof obj.onOpen) == 'function') {
						obj.onOpen();
					} else {
						eval(obj.onOpen);
					}
				}
				
			}
		});			
	} else {
		jQuery.fn.dialog.hideLoader();
		$("#ccm-dialog-content" + nd).append($(obj.element));
		if ($(obj.element).css('display') == 'none') {
			$(obj.element).show();
		}
		$("#ccm-dialog-content" + nd + " .dialog-launch").dialog();
		$("#ccm-dialog-content" + nd + " .ccm-dialog-close").click(function() {
			jQuery.fn.dialog.closeTop();
		});
		if (typeof obj.onOpen != "undefined") {
			if ((typeof obj.onOpen) == 'function') {
				obj.onOpen();
			} else {
				eval(obj.onOpen);
			}
		}
	}
		
}

jQuery.fn.dialog.replaceTop = function(h) {
	var nd = $(".ui-dialog").length;
	$("#ccm-dialog-content" + nd).html(h);
}

jQuery.fn.dialog.showLoader = function(text) {
	if (typeof(imgLoader)=='undefined' || !imgLoader || !imgLoader.src) return false; 
	if ($('#ccm-dialog-loader').length < 1) {
		$("body").append("<div id='ccm-dialog-loader-wrapper' class='ccm-ui'><img id='ccm-dialog-loader' src='"+imgLoader.src+"' /></div>");//add loader to the page
	}
	if (text != null) {
		$("<div />").attr('id', 'ccm-dialog-loader-text').html(text).prependTo($("#ccm-dialog-loader-wrapper"));
	}

	var w = $("#ccm-dialog-loader-wrapper").width();
	var h = $("#ccm-dialog-loader-wrapper").height();
	var tw = $(window).width();
	var th = $(window).height();
	var _left = (tw - w) / 2;
	var _top = (th - h) / 2;
	$("#ccm-dialog-loader-wrapper").css('left', _left + 'px').css('top', _top + 'px');
	$('#ccm-dialog-loader-wrapper').show();//show loader
	//$('#ccm-dialog-loader-wrapper').fadeTo('slow', 0.2);
}

jQuery.fn.dialog.hideLoader = function() {
	$("#ccm-dialog-loader-wrapper").hide();
	$("#ccm-dialog-loader-text").remove();
}

jQuery.fn.dialog.closeTop = function() {
	var nd = $(".ui-dialog").length;
	$("#ccm-dialog-content" + nd).jqdialog('close');
}

jQuery.fn.dialog.closeAll = function() {
	$(".ui-dialog-content").jqdialog('close');
}


var imgLoader;
var ccm_dialogOpen = 0;
jQuery.fn.dialog.loaderImage = CCM_IMAGE_PATH + "/throbber_white_32.gif";

var ccmAlert = {  
    notice : function(title, message, onCloseFn) {
        $.fn.dialog.open({
            href: CCM_TOOLS_PATH + '/alert',
            title: title,
            width: 320,
            height: 160,
            modal: false, 
			onOpen: function () {
        		$("#ccm-popup-alert-message").html(message);
			},
			onDestroy: onCloseFn
        }); 
    },
    
    hud: function(message, time, icon, title) {
    	if ($('#ccm-notification-inner').length == 0) { 
    		$(document.body).append('<div id="ccm-notification" class="ccm-ui"><div id="ccm-notification-inner"></div></div>');
    	}
    	
    	if (icon == null) {
    		icon = 'edit_small';
    	}
    	
    	if (title == null) {	
	    	var messageText = message;
	    } else {
	    	var messageText = '<h3>' + title + '</h3>' + message;
	    }
    	$('#ccm-notification-inner').html('<img id="ccm-notification-icon" src="' + CCM_IMAGE_PATH + '/icons/' + icon + '.png" width="16" height="16" /><div id="ccm-notification-message">' + messageText + '</div>');
		
		$('#ccm-notification').show();
		
    	if (time > 0) {
    		setTimeout(function() {
    			$('#ccm-notification').fadeOut({easing: 'easeOutExpo', duration: 300});
    		}, time);
    	}
    	
    }
}      

$(document).ready(function(){   
	imgLoader = new Image();// preload image
	imgLoader.src = jQuery.fn.dialog.loaderImage;

});
