var db;
function openDb() {

    db = window.openDatabase("Database", "1.0", "KindnessApp", 200000);
    db.transaction(checkDatabaseExists);

    function checkDatabaseExists(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS MEDITATION (id unique, startDate, endDate, duration, feeling)');
        console.log('table created')
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
    $('.holder').width(290).height(290);
    $('.holder').zenclock({onStart:function(startDate, duration) {
        console.log("store: " + startDate);
        window.localStorage.setItem("startDate", startDate.getTime());
        window.localStorage.setItem("duration", duration);
    }, onEnd: function(endDate) {
        $(':mobile-pagecontainer').pagecontainer("change", "endingTimer.html", { transition: "pop",
            reload: true, changeHash: false });
        window.localStorage.setItem("endDate", endDate.getTime());
    }
    });
}


function initEndingTimer() {


    function insertMeditation(tx) {
        var startDate = window.localStorage.getItem("startDate");
        var duration = window.localStorage.getItem("duration");
        var endDate = window.localStorage.getItem("endDate");
        console.log(startDate);
        console.log(duration);
        console.log(endDate);

        tx.executeSql('INSERT INTO MEDITATION (startDate, endDate, duration, feeling) VALUES (?, ?, ?, ?)', [startDate, endDate, duration, feeling]);

        $(':mobile-pagecontainer').pagecontainer("change", "dailyQuote.html", { transition: "flip",
            reload: true, changeHash: false });
        console.log('3');
    }
    function saveMeditation() {
        db.transaction(insertMeditation);
        console.log("insertMeditation");
    }

    //Meng: play sound here

    console.log("init ending timer");
    var d = new Date();
    var date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    var feeling = -1;
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


    function errorCB(err) {
        console.log("Error processing SQL: "+err.code);
    }

    function querySuccess(tx, results) {

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
        tx.executeSql('SELECT startDate, endDate, duration, feeling FROM MEDITATION', [], querySuccess, errorCB);
        console.log('select meditation 2');
    }
    db.transaction(selectMeditation);
}


function initAlarmManager() {

}


function initSetAlarm() {

    $('#datetimepicker3').datetimepicker({
        datepicker:false,
        format:'H:i',
        step:5,
        inline:true
    });

    $(".btn-day").on("click", function() {
        $(this).toggleClass("btn-day-selected");
    });
}


$(document).on('pagecontainershow', function (e, ui) {

    var ThisPage = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');

    switch (ThisPage) {
        case 'starting-timer':
            initStartingTimer();
            break;

        case 'ending-timer':
            initEndingTimer();
            break;

        case 'daily-quote':
            initCalendar();
            break;

        case 'alarm-manager':
            initAlarmManager();
            break;

        case 'dialog-set-alarm':
            initSetAlarm();
            break;
    }
});


$(document).on('dialogcreate', function (e, ui) {

    initSetAlarm();
});


function onDeviceReady() {
    console.log('device ready');
    openDb();
}

function onLoad() {
    console.log('onload');
    document.addEventListener("deviceready", onDeviceReady, false);
    openDb();
}