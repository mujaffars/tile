$(function () { // DOM ready
    
    //window.location.replace("create.html");
    
    $(window).resize(on_resize);

    //on_resize();

    // wait until every image is loaded to launch the game
    loadimages(images, function () {
        init_game();
    });

    // tabs and panels
    $('.panel').hide();
    $('.tab').click(function () {
        var $this = $(this);
        $('.tab').removeClass('on');
        $this.addClass('on');
        $('.panel').hide();
        $('#' + $this.attr('data-target')).show();
    });
    $('.tab:first').click();

});

function init_game() {
    $('#zone_message').html('');
    NB_ICONS = 6; // normal : 6

    tab_icons = [];
    var make_board = '';

    on_resize();
    var floor_width = $('#zone_play').width() / board_size;
    floor_width = parseInt(100 / board_size);
    var tile_width = eval(floor_width - 4);
    for (var i = 0; i < board_size; i++) {
        for (var j = 0; j < board_size; j++) {
            make_board += '<div class="floor" style="top: ' + Number(i * floor_width) + '%; left: ' + Number(j * floor_width) + '%;"></div>';
            make_board += '<div class="tile draggable" id="' + i + '_' + j + '" data-id="' + i + '_' + j + '" data-line="' + i + '" style="top: ' + eval(Number(i * floor_width) + 2) + '%; left: ' + eval(Number(j * floor_width) + 2) + '%;"></div>';
            pastPositions[i + '_' + j] = {
                top: eval(Number(i * floor_width) + 2),
                left: eval(Number(j * floor_width) + 2)
            }
        }
    }

    $('#zone_play').html(make_board);

    changeCss('.floor', 'width:' + floor_width + '%; height:' + floor_width + '%;');
    changeCss('.tile', 'width:' + tile_width + '%; height:' + tile_width + '%;');

    assignDragEvent();
    //console.log($('.floor').width());

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutationRecord) {
            console.log('style changed!');
        });
    });

    var target = document.getElementById('0_0');
    observer.observe(target, {attributes: true, attributeFilter: ['style']});

}

$.fn.draggableXY = function (options) {
    var defaultOptions = {
        distance: eval($('.floor').width() / 2),
        dynamic: false,
        grid: [$('.floor').width(), $('.floor').width()]
    };
    options = $.extend(defaultOptions, options);

    this.draggable({
        containment: "#zone_play",
        distance: options.distance,
        grid: [$('.floor').width(), $('.floor').width()],
        start: function (event, ui) {
            ui.helper.data('draggableXY.originalPosition', ui.position || {top: 0, left: 0});
            ui.helper.data('draggableXY.newDrag', true);
        },
        drag: function (event, ui) {
            var originalPosition = ui.helper.data('draggableXY.originalPosition');
            var deltaX = Math.abs(originalPosition.left - ui.position.left);
            var deltaY = Math.abs(originalPosition.top - ui.position.top);

            var newDrag = options.dynamic || ui.helper.data('draggableXY.newDrag');

            ui.helper.data('draggableXY.newDrag', false);

            var xMax = newDrag ? Math.max(deltaX, deltaY) === deltaX : ui.helper.data('draggableXY.xMax');
            ui.helper.data('draggableXY.xMax', xMax);

            var newPosition = ui.position;
            if (xMax) {
                newPosition.top = originalPosition.top;
            }
            if (!xMax) {
                newPosition.left = originalPosition.left;
            }

            movingTile = $(this);
            clearTimeout(timeout);
            timeout = setTimeout(doneResizing, 50);

            return newPosition;
        },
        dragstop: function (event, ui) {
            console.log('dragstop');
        }
    });
};



function doneResizing() {
    console.log(Math.round(parseInt($(movingTile).css('left')) * 100 / $(window).width()));
    console.log(Math.round(parseInt($(movingTile).css('top')) * 100 / $(window).width()));
    var mvTileLeft = Math.round(parseInt($(movingTile).css('left')) * 100 / $(window).width());
    var mvTileTop = Math.round(parseInt($(movingTile).css('top')) * 100 / $(window).width());
    $(movingTile).css('top', mvTileTop + '%')
    $(movingTile).css('left', mvTileLeft + '%')
    var data_line = $(movingTile).attr('data-line');
    var data_id = $(movingTile).attr('data-id');
    $('#zone_play').find('.tile').each(function () {
        if ($(this).attr('data-line') === data_line && $(this).attr('data-id') !== data_id) {
            //console.log($(this).attr('data-id'));
            var tileMoved = pastPositions[data_id];
            if (mvTileLeft !== tileMoved.left) {
                //console.log(Math.round(parseInt($(this).css('left')) * 100 / $(window).width()));
                if (Math.round(parseInt($(this).css('left')) * 100 / $(window).width()) !== 82) {
                    var moveLeft = eval(parseInt(Math.round(parseInt($(this).css('left')) * 100 / $(window).width())) + 16);
                    //console.log(moveLeft);
                    $(this).css('left', moveLeft + '%');
                    console.log(pastPositions[data_id].left);
                    pastPositions[data_id].left = moveLeft;
                    console.log(pastPositions[data_id].left);
                } else {
                    $(this).css('left', '2%');
                }
//                console.log(tileMoved.left+" "+pastPositions[data_id]);
            }
        }
    })
}

function assignDragEvent() {
    $(".draggable").draggableXY();
}

function on_resize() {
    var board_width = $(window).width();
    CUT_ICON = board_size / 4;

    $('#zone_play').css({
        'height': board_width + 'px',
        'width': board_width + 'px',
        'background-size': board_width / 4 + 'px ' + board_width / 4 + 'px'
    });

    setTimeout(function () {
        // hide the address bar
        window.scrollTo(0, 1);
    }, 0);
}

function loadimages(imgArr, callback) {
    //Keep track of the images that are loaded
    var imagesLoaded = 0;
    function _loadAllImages(callback) {
        //Create an temp image and load the url
        var img = new Image();
        $(img).attr('src', imgArr[imagesLoaded]);
        if (img.complete || img.readyState === 4) {
            // image is cached
            imagesLoaded++;
            //Check if all images are loaded
            if (imagesLoaded == imgArr.length) {
                //If all images loaded do the callback
                callback();
            } else {
                //If not all images are loaded call own function again
                _loadAllImages(callback);
            }
        } else {
            $(img).load(function () {
                //Increment the images loaded variable
                imagesLoaded++;
                //Check if all images are loaded
                if (imagesLoaded == imgArr.length) {
                    //If all images loaded do the callback
                    callback();
                } else {
                    //If not all images are loaded call own function again
                    _loadAllImages(callback);
                }
            });
        }
    }
    ;
    _loadAllImages(callback);
}
