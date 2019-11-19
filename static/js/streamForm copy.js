function initHandler(whichpage) {
    var date = document.getElementById("datepickerDefault").value;
    var currDay = 0;
    var datePickerStart = flatpickr(document.getElementById("datepicker"), {
        dateFormat: "d/m/Y",
        minDate: Date.now() - 24 * 60 * 60 * 1000,
        defaultDate: date,
        onChange: async function (selectedDates, dateStr, instance) {
            currDay = new Date(selectedDates).getTime();
            var streams = await postData("/getStreamsOnDay", {
                date: new Date(selectedDates).getTime()
            })
            updateStreamsOnDay(streams);
        },
        onReady: async function (selectedDates, dateStr, instance) {
           
        }
    });
    var dateSep = date.split("/")
    datePickerStart.setDate(dateSep.join("/"), true)

    document.getElementById('datepickerDefault').dispatchEvent(new Event('input'));



    function paddy(num, padlen, padchar) {
        var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
        var pad = new Array(1 + padlen).join(pad_char);
        return (pad + num).slice(-pad.length);
    }

    var dayStreamTimes = [];
    var streamListEL = document.getElementById("streamList")

    function updateStreamsOnDay(streamArray) {
        dayStreamTimes = [];
        streamListEL.innerHTML = "";

        for (var i = 0; i < streamArray.length; i++) {

            if (streamArray[i]._id != document.getElementById("streamID").value) {
                var li = document.createElement("li");
                var time = {
                    startTime: streamArray[i].startTime - new Date(datePickerStart.selectedDates).getTime(),
                    endTime: streamArray[i].endTime - new Date(datePickerStart.selectedDates).getTime()
                };
                var startTime = paddy(new Date(streamArray[i].startTime).getHours(), 2) + ":" + paddy(new Date(streamArray[i].startTime).getMinutes(), 2)
                var endTime = paddy(new Date(streamArray[i].endTime).getHours(), 2) + ":" + paddy(new Date(streamArray[i].endTime).getMinutes(), 2)
                li.innerHTML = startTime + " - " + endTime + "<br>" + streamArray[i].fullName;
                streamListEL.appendChild(li)
                dayStreamTimes.push(time)
            }
        }
        if (dayStreamTimes.length == 0) {
            streamListEL.innerHTML = "There are currently no streams on this day";
        }

        toggleErrorOnTime();
    }
    async function initStreamList() {
        //init streamList
        var streams = await postData("/getStreamsOnDay", {
            date: new Date(datePickerStart.selectedDates).getTime()
        })
        updateStreamsOnDay(streams);
    }
    initStreamList()

    function toggleErrorOnTime() {
        if (!checkTimetable()) {
            document.querySelectorAll(".problemFields").forEach((field) => {
                field.classList.add("problematic");
            });
        }
        else {
            document.querySelectorAll(".problemFields").forEach((field) => {
                field.classList.remove("problematic");
            });
        }
    }
    function checkTimetable() {
        var currStart = document.getElementById("startTimeHours").value * 60 * 60 * 1000 + document.getElementById("startTimeMinutes").value * 60 * 1000;
        var currEnd = currStart + document.getElementById("durationHours").value * 60 * 60 * 1000 + document.getElementById("durationMinutes").value * 60 * 1000;
        for (var j = 0; j < dayStreamTimes.length; j++) {
            if (
                (
                    currStart >= dayStreamTimes[j].startTime
                    && currStart <= dayStreamTimes[j].endTime
                ) ||
                (
                    currEnd >= dayStreamTimes[j].startTime
                    && currEnd <= dayStreamTimes[j].endTime
                ) ||
                (
                    currStart <= dayStreamTimes[j].startTime
                    && currEnd >= dayStreamTimes[j].endTime
                )

            ) {
                return false
            }
        }
        return true;
    }


    function initSubmitHandler(status) {
        document.getElementById('streamFormEdit').addEventListener("submit", async function (e) {
            e.preventDefault(); // prevents page reloading

            if (CKEDITOR.instances.streamDesc.getData() != "" &&
                streamTitle != "" &&
                checkTimetable()
            ) {
                var streamStart = new Date(datePickerStart.selectedDates).getTime() + document.getElementById("startTimeHours").value * 60 * 60 * 1000 + document.getElementById("startTimeMinutes").value * 60 * 1000;
                var streamEnd = streamStart + document.getElementById("durationHours").value * 60 * 60 * 1000 + document.getElementById("durationMinutes").value * 60 * 1000;
                var params = {
                    streamID: document.getElementById("streamID").value,
                    streamTitle: document.getElementById("streamTitle").value,
                    streamDesc: CKEDITOR.instances.streamDesc.getData(),
                    streamStart: streamStart,
                    streamEnd: streamEnd
                }
                console.log(new Date(datePickerStart.selectedDates).getTime())
                var success
                if (status == "addstream") success = await postData('/addStream', params);
                else success = await postData('/editStream', params);
                console.log(success)

                if (success.success == "saved") {
                    barba.go("/admin/streams");
                }
                else if (success.success == "conflict") alert("There was a conflict with an existing stream");

            }
            else {
                alert("you need to fill out the forms and make sure the timetable isnt taken")
            }

        });
    }

    initSubmitHandler(whichpage);


    if (document.getElementById('deleteStream')) {
        document.getElementById('deleteStream').addEventListener("click", async function (e) {
            if (confirm("Are you sure you want to delete this stream?")) {
                var success = await postData('/deleteStream', { id: document.getElementById("streamID").value });
                console.log(success)

                if (success.success == "saved") {
                    window.location.replace("/admin/streams");
                }
                else if (success.success == "conflict") alert("There was an error");

            }
        });
    }


    async function postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return await response.json(); // parses JSON response into native JavaScript objects
    }


    //input checker

    // Restricts input for the given textbox to the given inputFilter.
    function setInputFilter(textbox, inputFilter) {
        ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
            textbox.oldValue = "";
            textbox.addEventListener(event, function () {
                toggleErrorOnTime();
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                }
            });
        });
    }

    function setupTimeFilter(array) {
        for (i = 0; i < array.length; i++) {
            setInputFilter(array[i], function (value) {
                if (value.length > 2) return false;
                return /^\d*$/.test(value);
            });
        }
    }

    var inputs = [
        document.getElementById("startTimeHours"),
        document.getElementById("startTimeMinutes"),
        document.getElementById("durationHours"),
        document.getElementById("durationMinutes")
    ]
    setupTimeFilter(inputs)

    

    CKEDITOR.replace('streamDesc', {
        stylesSet: 'my_styles'
    });
}



