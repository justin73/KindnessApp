(function ($) {

    $.fn.zenclock = function (options) {
        var settings = $.extend({
            onStart: function() {},
            onEnd: function() {}
        }, options);

        var onStart = settings.onStart;
        var onEnd = settings.onEnd;
        var startDate;
        var currentState = -1;//-1: init //0: stop, 1: start, 2: pause
        var timeElapsed = 0;

        function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        var $holder = $(this);
        var width = $holder.width();
        var height = $holder.height();
        var clockWidth = width - 60;
        var clockHeight = height - 50;

        var r = Raphael($holder.get(0), width, height);
        var R = Math.min(clockWidth, clockHeight) / 2;
        var totalDuration = 0;
        var timeElapsed = 0;
        var centerX = (clockWidth + (width - clockWidth)) / 2;
        var centerY = (clockHeight + (height - clockHeight)) / 2;
        var timePreviouslyElapsed = 0;

// Custom Attribute
        r.customAttributes.arc = function (value, total, R) {
            var alpha;
            if (value == 0 || total == 0) {
                alpha = 0;
            } else {
                alpha = 360 / total * value;
            }
            var a = (90 - alpha) * Math.PI / 180,
                x = centerX + R * Math.cos(a),
                y = centerY - R * Math.sin(a),
                path;
            path = [
                ["M", centerX, centerY - R],
                ["A", R, R, 0, +(alpha > 180), 1, x, y]
            ];

            return {path: path};
        };
        r.customAttributes.dot = function (value, total, R) {
            var alpha;
            if (value == 0 || total == 0) {
                alpha = 0;
            } else {
                alpha = 360 / total * value;
            }
            var a = (90 - alpha) * Math.PI / 180,
                x = centerX + R * Math.cos(a),
                y = centerY - R * Math.sin(a),
                color = "#ffc35c";
            return {cx: x, cy: y, r: 15, stroke: color, fill: color};
        };
        r.customAttributes.duration = function (seconds) {
            var hours = Math.floor(seconds / 60);
            var seconds = Math.ceil(seconds - hours * 60);

            return {text: pad(hours, 2) + ":" + pad(seconds, 2), "font-size": clockWidth / 3};
        };

        function updateVal(timeElapsed, totalDuration, R, hand, circle, duration, state) {
            hand.attr({arc: [timeElapsed, totalDuration, R]});
            circle.attr({dot: [timeElapsed, totalDuration, R]});
            duration.attr({duration: totalDuration - timeElapsed});

            if (currentState == 0) {
                state.attr({text: 'Tap to start'});
                duration.attr({fill: "#405559"});
            } else if (currentState == 1) {
                state.attr({text: 'Tap to pause'});
                duration.attr({fill: "#ffc35c"});
            } else if (currentState == 2) {
                state.attr({text: 'Tap to resume'});
                duration.attr({fill: "#405559"});
            }
        }

        var backarc = r.path().attr({fill: "#0fff", stroke: "#405559", "stroke-width": 10}).attr({arc: [59.999, 60, R]});
        var sec = r.path().attr({fill: "#0fff", stroke: "#ffc35c", "stroke-width": 10}).attr({arc: [0, 59.999, R]});
        var circle = r.circle().attr({dot: [0, 59.999, R]});
        var duration = r.text(centerX, centerY).attr({duration: [0], "fill": "#405559"});
        var state = r.text(centerY, centerY + centerY / 3, "Tap to start").attr({"font-size": centerY / 10, "fill": "#405559"});
//            var c = r.circle(250, 250, 40);
        (function () {
            if (currentState == 1) {
                timeElapsed = (Date.now() - startDate.getTime()) / 1000;
                var totalTimeElapsed = timePreviouslyElapsed + timeElapsed;
                if (totalTimeElapsed < totalDuration) {
                    updateVal(totalTimeElapsed, totalDuration, R, sec, circle, duration, state);
                } else {
                    //reached the end
                    currentState = 0;
                    updateVal(totalDuration, totalDuration, R, sec, circle, duration, state);
                    $(".btn-stop").css("display", "none");
                    $(".btn-time-update, .btn-reset").css("display", "inline-block");
                    onEnd(new Date());
                }
            }
            setTimeout(arguments.callee, 1000 * 1 / 24);
        })();

        $(".btn-time-update").click(function () {
            var val = parseInt($(this).attr('value'));
            totalDuration += val;
            if (totalDuration < 0) {
                totalDuration = 0;
            }
            totalDuration += val;
            duration.attr({duration: totalDuration});
        });

        $(".btn-reset").click(function () {
            var val = 0;
            totalDuration += 0;
        });

        $(".btn-stop").click(function () {
            currentState = 0;
            $(".btn-stop").css("display", "none");
            $(".btn-time-update, .btn-reset").css("display", "inline-block");
            updateVal(0, 0, R, sec, circle, duration, state);
        });

        function updateState() {

            if (totalDuration > 0) {
                var val = 0;
                if (currentState == -1) {
                    onStart(new Date(), totalDuration);
                    currentState = 0;
                }
                if (currentState == 0) { //stop
                    console.log("currentState" + currentState);
                    startDate = new Date();
                    currentState = 1;
                    timePreviouslyElapsed = 0;
                    timeElapsed = 0;
                    $(".btn-stop").css("display", "inline-block");
                    $(".btn-time-update, .btn-reset").css("display", "none");
                } else if (currentState == 1) { // pause
                    timePreviouslyElapsed += timeElapsed;
                    currentState = 2;
                    state.attr({text: 'Tap to resume'});
                    $(".btn-stop").css("display", "none");
                    $(".btn-time-update, .btn-reset").css("display", "inline-block");
                } else if (currentState == 2) { //playing
                    startDate = new Date();
                    currentState = 1;
                    $(".btn-stop").css("display", "none");
                    $(".btn-time-update, .btn-reset").css("display", "inline-block");
                }
            }
        }

        $holder.click(function () {
            updateState();
        });
    };
}(jQuery));
