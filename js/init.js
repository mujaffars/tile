(function () {
    var supportTouch = $.support.touch,
            scrollEvent = "touchmove scroll",
            touchStartEvent = supportTouch ? "touchstart" : "mousedown",
            touchStopEvent = supportTouch ? "touchend" : "mouseup",
            touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup: function () {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function (event) {
                var data = event.originalEvent.touches ?
                        event.originalEvent.touches[ 0 ] :
                        event,
                        start = {
                            time: (new Date).getTime(),
                            coords: [data.pageX, data.pageY],
                            origin: $(event.target)
                        },
                stop;

                function moveHandler(event) {
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ?
                            event.originalEvent.touches[ 0 ] :
                            event;
                    stop = {
                        time: (new Date).getTime(),
                        coords: [data.pageX, data.pageY]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                        event.preventDefault();
                    }
                }
                $this
                        .bind(touchMoveEvent, moveHandler)
                        .one(touchStopEvent, function (event) {
                            $this.unbind(touchMoveEvent, moveHandler);
                            if (start && stop) {
                                if (stop.time - start.time < 1000 &&
                                        Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                                        Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                                    start.origin
                                            .trigger("swipeupdown")
                                            .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                                }
                            }
                            start = stop = undefined;
                        });
            });
        }
    };
    $.each({
        swipedown: "swipeupdown",
        swipeup: "swipeupdown"
    }, function (event, sourceEvent) {
        $.event.special[event] = {
            setup: function () {
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });

})();

$(function () { // DOM ready

    //window.location.replace("create.html");

    $(window).resize(on_resize);

    init_game();

});

var classes = {};
var floorClasses = {1: "floorRed", 2: "floorYellow", 3: "floorAqua", 4: "floorGreen"};
//
//var classes = {};
var floorClasses = {};
function init_game() {
    $('#zone_message').html('');
    NB_ICONS = 6; // normal : 6

    tab_icons = [];
    var make_board = jQuery("<div>", {
        id: 'inner'
    });

    on_resize();
    floor_width = parseInt(eval(100 / board_col_size));
    floor_height = parseInt(eval(100 / board_row_size));

    var totalWidth = eval(floor_width * board_col_size);
    var rightMargin = eval(100 - totalWidth);
    changeCss("#play_area", "margin-left:" + eval(rightMargin / 2) + "%;");

    var tile_width = eval(floor_width - 4);
    var tile_height = eval(floor_height - 4);
    for (var i = 0; i < board_row_size; i++) {
        for (var j = 0; j < board_col_size; j++) {

            var randNo = Math.floor(Math.random() * 6) + 1
            if (i !== 0 && j !== 0 && i !== eval(board_row_size - 1) && j !== eval(board_col_size - 1)) {

            } else {
                randNo = 10;
            }
            var cornerClass = '';
            if (i === 0 && j === 0) {
                cornerClass = 'floorTopLeft';
            } else if (i === 0 && j === eval(board_col_size - 1)) {
                cornerClass = 'floorTopRight';
            } else if (i === eval(board_row_size - 1) && j === 0) {
                cornerClass = 'floorBottomLeft';
            } else if (i === eval(board_row_size - 1) && j === eval(board_col_size - 1)) {
                cornerClass = 'floorBottomRight';
            }

            if (i === 0 && cornerClass === '') {
                cornerClass += 'floorTop';
            }
            if (j === 0 && cornerClass === '') {
                cornerClass += 'floorLeft';
            }
            else if (i === (board_row_size - 1) && cornerClass === '') {
                cornerClass += 'floorBottom';
            }
            else if (j === (board_col_size - 1) && cornerClass === '') {
                cornerClass += 'floorRight';
            }
            var floor = jQuery("<div>", {
                class: "floor " + floorClasses[randNo] + " " + cornerClass + " clsFloor_" + i + "_" + j,
                "position_row": i,
                "position_col": j
            });
            floor.data('otherDtls', {
                "position_row": i,
                "position_col": j
            });

            changeCss(".clsFloor_" + i + "_" + j, "top: " + Number(i * floor_height) + "% ; \n\
            left: " + Number(j * floor_width) + "%;");

            make_board.append(floor);

            var tile = jQuery("<div>", {
                class: "tile " + classes[randNo] + " clsTile_" + i + "_" + j,
                "position_row": i,
                "position_col": j
            });
            tile.data('otherDtls', {
                "position_row": i,
                "position_col": j
            });

            changeCss(".floor", "width:" + floor_width + "%; height:" + floor_height + "%;");
            changeCss(".tile", "width:" + tile_width + "%; height:" + tile_height + "%;");
            changeCss(".clsTile_" + i + "_" + j, "top: " + eval(Number(i * floor_height) + 2) + "% ; \n\
            left: " + eval(Number(j * floor_width) + 2) + "%;");

            if (i !== 0 && j !== 0 && i !== eval(board_row_size - 1) && j !== eval(board_col_size - 1)) {
                make_board.append(tile);
            }
        }
    }

    $('#play_area').append(make_board);

    $(".tile, .floor").on("swipeleft", function () {
        changePosition($(this), 'left', 'lr');
    });
    $(".tile, .floor").on("swiperight", function () {
        changePosition($(this), 'right', 'lr');
    });
    $(".tile, .floor").on("swipeup", function () {
        changePosition($(this), 'up', 'ud');
    });
    $(".tile, .floor").on("swipedown", function () {
        changePosition($(this), 'down', 'ud');
    });

    define_events();
    create_powerups();
}

function changePosition(objTile, direction, move) {
    var data = $(objTile).data('otherDtls');
    var floorRowLenght = eval(board_row_size - 2);
    var floorColLenght = eval(board_col_size - 2);
    $("#play_area").find(".tile").each(function () {
        var tileData = $(this).data('otherDtls');
        if (move === 'lr') {
            if (tileData.position_row === data.position_row) {
                console.log('here');
                var newColumn = '';
                if (direction === 'left') {
                    if (tileData.position_col === 1) {
                        newColumn = floorColLenght;
                    } else {
                        newColumn = eval(tileData.position_col - 1);
                    }
                } else if (direction === 'right') {
                    if (tileData.position_col === floorColLenght) {
                        newColumn = 1;
                    } else {
                        newColumn = eval(tileData.position_col + 1);
                    }
                }
                $(this).removeClass('clsTile_' + tileData.position_row + '_' + tileData.position_col);
                $(this).data('otherDtls').position_col = newColumn;
                $(this).addClass('clsTile_' + data.position_row + '_' + newColumn);
                //console.log($(this).data('otherDtls'));
            }
        }
        else if (move === 'ud') {
            if (tileData.position_col === data.position_col) {
                var newRow = '';
                if (direction === 'up') {
                    if (tileData.position_row === 1) {
                        newRow = floorRowLenght;
                    } else {
                        newRow = eval(tileData.position_row - 1);
                    }
                } else if (direction === 'down') {
                    if (tileData.position_row === floorRowLenght) {
                        newRow = 1;
                    } else {
                        newRow = eval(tileData.position_row + 1);
                    }
                }
                $(this).removeClass('clsTile_' + tileData.position_row + '_' + tileData.position_col);
                $(this).data('otherDtls').position_row = newRow;
                $(this).addClass('clsTile_' + newRow + '_' + data.position_col);
                //console.log($(this).data('otherDtls'));
            }
        }
    });
}

function create_powerups() {

    for (var i = 0; i < 4; i++) {
        var divPowerUp = jQuery("<div>", {
            class: "divPowerUp"
        });
        var iconPowerUp = jQuery("<i>", {
            class: "fa fa-bolt fa-4",
            "aria-hidden": "true"
        });
        iconPowerUp.data('otherDtls', {
            name: 'bolt'
        });
        $(iconPowerUp).click(function () {
            powerUp.selected = true;
            powerUp.name = $(this).data('otherDtls').name;
        })
        divPowerUp.append(iconPowerUp);
        $("#power_area").append(divPowerUp);
        $(divPowerUp).click(function () {
            console.log('clicked ' + powerUp.name);
        })
    }
}

function define_events() {
    $('#play_area').find('.floorLeft').click(function () {
        var position_row = $(this).attr('position_row');
        var position_col = $(this).attr('position_col');
        // Check if powerUp selected
        if (powerUp.selected) {
            var obj = {
                position: position_row,
                row_col: 'row',
                power_up: powerUp.name
            };
            var objKey = 'key_row'+position_row;
            linking[objKey] = obj;
            console.log(linking);
            // Create child powerup
            console.log($(this).attr('position_row') + " " + $(this).attr('position_col'));
        }
    })
}

function on_resize() {
//    var board_width = $(window).width();
//    CUT_ICON = board_size / 4;

    $('body').css({
        height: $(window).height(),
        width: $(window).width()
    })

    setTimeout(function () {
        // hide the address bar
        window.scrollTo(0, 1);
    }, 0);
}
