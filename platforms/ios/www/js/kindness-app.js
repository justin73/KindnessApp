var db = null;
function openDb() {
    if (db == null) {
        db = window.openDatabase("Database", "1.0", "Kindness", 200000);
        db.transaction(checkDatabaseExists);

        function checkDatabaseExists(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MEDITATION (id INTEGER PRIMARY KEY, startDate INTEGER, endDate INTEGER, duration INTEGER, feeling INTEGER)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS ALARM (id INTEGER PRIMARY KEY, hour INTEGER, minute INTEGER, days TEXT)');
            console.log('table created')
        }
    }
}

function initStartingTimer() {
    //var winhight = $.mobile.getScreenHeight();
    //var headhight = $('[data-role="header"]').first().outerHeight();
    //var foothight = $('[data-role="footer"]').first().outerHeight();
    //var $content=$('[data-role="content"]');
    //newhight = winhight - headhight - foothight;
    //$content.css('min-height',newhight + 'px');
    //var width = $content.width();
    //var height = $content.height();
    //var holderSize = Math.min(width - 20, height-150);
    //console.log("width:"+width+", height"+height)
    $('.holder').width($(window).width()*0.8).height($(window).width()*0.8);
    $('.holder').zenclock({onStart:function(startDate, duration) {
        console.log("store: " + startDate);
        window.localStorage.setItem("startDate", startDate.getTime());
        window.localStorage.setItem("duration", duration);
    }, onEnd: function(endDate) {
        playGong();
        $(':mobile-pagecontainer').pagecontainer("change", "endingTimer.html", { transition: "pop",
            reload: true, changeHash: false });
        window.localStorage.setItem("endDate", endDate.getTime());
    }
    });
    $('.holder').css("margin-top", (screen.height-$('.holder').height())/2-120);
}


function initEndingTimer() {


    var feeling = -1;

    function saveMeditation() {
        db.transaction(function(tx) {
            var startDate = window.localStorage.getItem("startDate");
            var duration = window.localStorage.getItem("duration");
            var endDate = window.localStorage.getItem("endDate");
            console.log(startDate);
            console.log(duration);
            console.log(endDate);

            tx.executeSql('INSERT INTO MEDITATION (startDate, endDate, duration, feeling) VALUES (?, ?, ?, ?)', [startDate, endDate, duration, feeling]);

            $(':mobile-pagecontainer').pagecontainer("change", "calendar.html", { transition: "flip",
                reload: true, changeHash: false });
        });
        console.log("insertMeditation");
    }

    //Meng: play sound here

    console.log("init ending timer");
    var d = new Date();
    var date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    $('#satisfied').on('click', function () {
        console.log('Today is ' + date + ", you seem to enjoy your meditation today");
        feeling = 2;
        saveMeditation();
    });
    $('#unsatisfied').on('click', function () {
        console.log('Today is ' + date + ", you seem to dislike your meditation today");
        feeling = 0;
        saveMeditation();
    });
    $('#ok').on('click', function () {
        console.log('Today is ' + date + ", you seem to be not sure about your meditation today");
        feeling = 1;
        saveMeditation();
    });
}
function pad(value, length) {
    return (value.toString().length < length) ? pad("0"+value, length):value;
}

function initCalendar() {


    function selectMeditationError(err) {
        console.log("Error processing SQL: "+err.code);
    }

    function selectMeditationSuccess(tx, results) {

        var eventsArray = [];
        // the number of rows returned by the select statement
        console.log('select meditation success: ' + results.rows.length);
        for (var i =0; i < results.rows.length; i++) {
            var startDate = parseInt(results.rows.item(i).startDate);
            var endDate = parseInt(results.rows.item(i).endDate);
            var duration = parseInt(results.rows.item(i).duration);
            var feeling = results.rows.item(i).feeling;
            var icon;
            if (feeling == 0) {
                icon = "sad";
            } else if (feeling == 1) {
                icon = "neutral";
            }  else if (feeling == 2) {
                icon = "happy";
            }

            var hours = Math.floor(duration / 3600);
            var minutes = Math.ceil((duration - hours * 3600)/60);
            var stringDuration = pad(hours, 2) + "h " + pad(minutes, 2) + "mn"

            console.log('startDate: ' + new Date(startDate) + ", endDate: " + new Date(endDate) + ", duration: " + duration+ ", feeling: " + feeling);
            eventsArray.push({"begin" : new Date(startDate), "end" : new Date(endDate), "summary" : "Meditation session of " + stringDuration, "icon": icon });
        }

        $("#calendar").jqmCalendar({
            events : eventsArray,
            months : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            days : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            startOfWeek : 0
        });
    }

    function selectMeditation(tx) {
        console.log('select meditation 1');
        tx.executeSql('SELECT startDate, endDate, duration, feeling FROM MEDITATION', [], selectMeditationSuccess, selectMeditationError);
        console.log('select meditation 2');
    }
    db.transaction(selectMeditation);
}


function initAlarmManager(init) {

    function selectAlarmError(err) {
        console.log("Error processing SQL: "+err.code);
    }

    function getState(index, days) {
        if (days.charAt(6-index) == "1") {
            return "active";
        }

        return "inactive";
    }

    function selectAlarmSuccess(tx, results) {
        var eventsArray = [];
        // the number of rows returned by the select statement
//        console.log('select alarms success: ' + results.rows.length);
        $("#list-alarms").empty();
        for (var i =0; i < results.rows.length; i++) {
            var id = results.rows.item(i).id;
            var hour = results.rows.item(i).hour;
            var minute = results.rows.item(i).minute;
            var days = results.rows.item(i).days;

            console.log(days);

            $("#list-alarms").append('<li class="list-alarm-item" data-id="'+id+'" data-icon="delete">' +
            '<a href="#" class="btn-delete-alarm ui-btn ui-btn-icon-right ui-icon-delete" data-id="'+id
            +'"><span class="alarm-time">'+pad(hour, 2)+':'+pad(minute, 2)+'</span>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;' +
            '<span class="alarm-'+getState(6, days)+'">Sa</span>&nbsp;' +
            '<span class="alarm-'+getState(5, days)+'">Mo</span>&nbsp;' +
            '<span class="alarm-'+getState(4, days)+'">Tu</span>&nbsp;' +
            '<span class="alarm-'+getState(3, days)+'">We</span>&nbsp;' +
            '<span class="alarm-'+getState(2, days)+'">Th</span>&nbsp;' +
            '<span class="alarm-'+getState(1, days)+'">Fr</span>&nbsp;' +
            '<span class="alarm-'+getState(0, days)+'">Su</span>&nbsp;' +
            '</a>'+
            '</li>');
        }

        $(".btn-delete-alarm").on('click', function() {
            $(this).parent(".list-alarm-item").remove();
            var dataId = $(this).attr("data-id")
            db.transaction(function(tx) {
                console.log(dataId)
                tx.executeSql('DELETE FROM ALARM WHERE ID=?', [dataId]);
                for (var i = 0; i <= 7; i++) {
                    window.plugin.notification.local.cancel(dataId+"_"+i);
                }
            });
        });
    }

    function selectAlarms(tx) {
        console.log('select meditation 1');
        tx.executeSql('SELECT id, hour, minute, days FROM ALARM', [], selectAlarmSuccess, selectAlarmError);
        console.log('select meditation 2');
    }
    if (!init) {
        db.transaction(selectAlarms);
    }
}


function initSetAlarm(init) {
    if (init) {


        $(".btn-day").on("click", function() {
            $(this).toggleClass("btn-day-selected");
        });

        function insertAlarm(tx) {
            console.log("insert alarm")
            var time = $('.clockpicker .form-control').val().split(":");
            var hour = parseInt(time[0]);
            var minute = parseInt(time[1]);

            var days = "";
            for (var i = 0; i < 7; i++) {
                days += $("#btn-day-"+i).hasClass("btn-day-selected") ? "1" : "0";
            }

            tx.executeSql('INSERT INTO ALARM (hour, minute, days) VALUES (?, ?, ?)', [hour, minute, days], function(txt, results) {
                var currentDate = new Date();

                console.log(hour)
                console.log(minute)

                var i = 0;
                while (i <= 7) {
                    var date = currentDate.getDay()+i;
                    if (days.charAt(date) == '1') {
                        var dayAfter = new Date();
                        dayAfter.setDate(currentDate.getDate()+i);
                        dayAfter.setHours(hour);
                        dayAfter.setMinutes(minute);
                        dayAfter.setSeconds(0);
                        console.log('ok --> expectedDate' + dayAfter);
                        if (dayAfter > currentDate) {
                            console.log('okok' + dayAfter);

                            window.plugin.notification.local.add({
                                id:         results.insertId+"_"+i,
                                date:       dayAfter,
                                title:    "Meditation Reminder",
                                sound: "/www/audio/beep.mp3",
                                message:      "Don't forget to meditate today!",
                                repeat:     'weekly'
                            });
                        }
                    }
                    i++;
                }
            }, function(err) {
                console.log("Error processing SQL: "+err.code);
            });
        }
        $("#btn-dialog-add-alarm").on("click", function() {
            db.transaction(insertAlarm);
        });
//        var dateTimePicker = $('#datetimepicker3').datetimepicker({
//            datepicker:false,
//            format:'H:i',
//            step:5,
//            inline:true
//        });
        $('.clockpicker').clockpicker({
            placement: 'bottom',
            align: 'left',
            donetext: 'Done'
        });
        $('.clockpicker .form-control').prop('readonly', true);
    }
}

function playGong() {
    src = 'audio/gong.wav';
    if (window.device.platform == 'Android') {
        src = '/android_asset/www/' + src;
    }

    var media = new Media(src,
        // success callback
        function () { console.log("playAudio():Audio Success"); },
        // error callback
        function (err) {
            console.log("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    media.play();
}

function initQuote() {
    var start = new Date(window.localStorage.getItem("startDate"));
//    alert(start);
    var end = new Date();
//    alert(end);
    var diff = new Date(end - start);

    var days = Math.floor(diff/1000/60/60/24);
//    alert(days);
//    $("#quote").html(jsonObject.Quote[days].Content);
//    $("#author").html(jsonObject.Quote[days].Writer);
}
$( document ).on( "pagecontainerbeforehide", function ( event, ui ) {

    if (typeof ui.toPage !== 'undefined') {
        document.webL10n.translate(ui.toPage[0]);
    }
});

$(document).on('pagecontainershow', function (e, ui) {

    openDb();
    var ThisPage = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');

    switch (ThisPage) {
        case 'starting-timer':
            initStartingTimer();
            break;

        case 'ending-timer':
            initEndingTimer();
            break;

        case 'view-calendar':
            initCalendar();
            break;

        case 'daily-quote':
            initQuote();
            break;

        case 'alarm-manager':
            initAlarmManager(false);
            break;
        case 'dialog-set-alarm':
            initSetAlarm(false);
            break;
    }

    $('.content').css("opacity", 1);
});

$(document).on('pagecontainercreate', function (e, ui) {

    var ThisPage = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');

    switch (ThisPage) {

        case 'alarm-manager':
            initAlarmManager(true);
            break;
    }
});

$(document).on('dialogcreate', function (e, ui) {

    initSetAlarm(true);
});


function onDeviceReady() {
    console.log('device ready');
    navigator.globalization.getPreferredLanguage(
        function (language) {
            document.documentElement.lang = language.value;
        },
        function () {
            alert('Error getting language\n');
        }
    );
    openDb();
}

function onLoad() {
    console.log('onload');
    document.addEventListener("deviceready", onDeviceReady, false);
    openDb();
}