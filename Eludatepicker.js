
var EluDatePicker = (function () {

    var defaultOptions = {
        daySize: {
            width: 40,
            height: 40
        },
        minYear: 2010,
        maxYear: 2015,
        selectedDate: null,
        includeTime:true

    };

    var isAMPM = moment.localeData().longDateFormat("LT").toLowerCase().indexOf("a") >= 0;


    var my = function (parent_div, options) {

        this.listeners = [];
        this.options = options != null ? options : {};
        Object.keys(defaultOptions).forEach(function (key) {
            if(!this.options.hasOwnProperty(key))
            {
                this.options[key] = defaultOptions[key];
            }
        }.bind(this));


        this.currentDate =this.selectedDate != null ? this.selectedDate : moment();
        this.currentDate.second(0);
        this.currentDate.millisecond(0);
        this.parent_div=parent_div;
        parent_div.classList.add("dt");
        this.dropdown = document.createElement("div");
        this.dropdown.id = "dropdown";
        this.dropdown.style.height = "100%";
        this.dropdown.style.fontFamily = "Arial";
        this.dropdown.style.padding = "4px";

       

        this.dropdownSpan = document.createElement("span");
       
        
        this.dropdown.appendChild(this.dropdownSpan); 

        this.addListener(this.dropdown, "mouseup", this.dropdownMouseUp.bind(this));

        parent_div.appendChild(this.dropdown);     	


       	this.resize();       
        

        this.createConfig();

        this.addListener(document, "mousedown", this.bodyClicked.bind(this));


    }

    my.prototype.setIncludeTime = function(value)
    {
    	this.options.includeTime = value;
    	if(this.options.includeTime)
    	{
    		this.config_container.classList.remove("notime");
    	}
    	else if(!this.config_container.classList.contains("notime"))
    	{
    		this.config_container.classList.add("notime");	
    	}

    	this.refreshDate();
    }

    my.prototype.resize =  function(){
    	this.hideConfig();
    	this.offsetCoordinates = this.getOffsetCoordinates(this.dropdown);


    }

    my.prototype.getValue = function () {
        return this.selectedDate;
    }

    my.prototype.setValue = function(value){
    	if(value != null)
    	{
    		this.currentDate = value;
    	}
    	this.selectedDate = value != null ? moment(value) : value;
    	this.refreshDate();    	
    }

    my.prototype.onValueChanged = function () {

        if (this.options.onValueChanged) {
            this.options.onValueChanged(this.selectedDate);
        }
    }

    my.prototype.doneButtonClicked = function (e) {
        if (this.options.onClosing) {
            this.options.onClosing(this.currentDate);
        }

        this.hideConfig();
    }

    my.prototype.nowButtonClicked = function(e){
    	this.currentDate = moment();
    	this.selectedDate = moment();
    	this.refreshDate(); 
    	this.onValueChanged();
    }

    my.prototype.dropdownMouseUp = function (e) {
        this.toggleConfig();

    }

    my.prototype.dayClicked = function (e) {
        var target = e.currentTarget;
        var dayNumber = target.dataset.day;

        this.currentDate.date(dayNumber);
        if(this.selectedDate == null)
        {
        	this.selectedDate = moment(this.currentDate);
        }
        this.refreshDate();
        this.onValueChanged();

    }



    my.prototype.bodyClicked = function (e) {
        this.hideConfig();
    }

    my.prototype.eventShield = function (e) {
        e.stopPropagation();
    }

    my.prototype.placeConfig = function(e){

    	var dropdown_bottom = this.offsetCoordinates.y + this.dropdown.offsetHeight;    	
    	var dropdown_right = this.offsetCoordinates.x + this.dropdown.offsetWidth;


    	
    	this.config_container.classList.remove("top");
    	this.config_container.classList.remove("bottom");


    	if(dropdown_right > window.innerWidth/2)
    	{
    		this.config_container.style.right = (window.innerWidth - (this.offsetCoordinates.x + this.dropdown.offsetWidth)) + "px";
    		this.config_container.classList.add("right");    		
    	}
    	else
    	{
    		this.config_container.style.left = this.offsetCoordinates.x + "px";
    		this.config_container.classList.add("left");

    	}

    	if(dropdown_bottom >  window.innerHeight /2)
    	{
    		this.config_container.style.top = (this.offsetCoordinates.y) + "px";
    		this.config_container.classList.add("top");
    	}
    	else
    	{
    		
    		this.config_container.style.top = (this.offsetCoordinates.y + this.dropdown.offsetHeight) + "px";
    		this.config_container.classList.add("bottom");
    	}

    	

    	
    }

 

    my.prototype.toggleConfig = function () {
        if (!this.config_container.classList.contains("visible")) {
        	this.placeConfig();
            this.config_container.classList.add("visible");
        } else {
        	
            this.config_container.classList.remove("visible");
        }
    }
    my.prototype.showConfig = function () {
    	this.placeConfig();
        this.config_container.classList.add("visible");

    }

    my.prototype.hideConfig = function () {


        if (this.config_container && this.config_container.classList.contains("visible")) {
        
            this.config_container.classList.remove("visible");
        }


    }

    my.prototype.drawCalendar = function (month, year) {
    	if(this.calendarDayListeners != null)
    	{
    		this.calendarDayListeners.forEach(function(l){
    			l.elem.removeEventListener(l.eventName, l.callback);
    		});
    	}
        this.calendarContainer.innerHTML = "";

        this.calendarDayListeners = [];
        var dt = moment([year, month, 1]).startOf("week");
        
        var startOfWeekDay = dt.day();


        var now = moment();

        var weekDayRow = document.createElement("div");
        weekDayRow.classList.add("week-day-row");

        var dtCursor = moment().startOf("week");
        for (var i = 0; i < 7; i++) {

            var weekDay = document.createElement("div");
            weekDay.classList.add("week-day");
            weekDay.innerHTML = dtCursor.format("ddd");
            weekDayRow.appendChild(weekDay);

            dtCursor.add(1,"day");
        }
        this.calendarContainer.appendChild(weekDayRow);



        var currentWeek = null;

        var dayDivList = {};

        while (dt.month() != ((this.currentDate.month() + 1) % 12)) {
            if (dt.day() == startOfWeekDay) {
                if (currentWeek != null) {
                    this.calendarContainer.appendChild(currentWeek);
                }

                currentWeek = document.createElement("div");
                currentWeek.classList.add("week");
            }

            var date = dt.date();
            var day = document.createElement("div");
            day.classList.add("day");
            
            day.style.width = this.options.daySize.width +"px";
            day.style.height = this.options.daySize.height +"px";
            day.dataset.day = date;
            day.innerHTML = date;
            if (dt.isSame(now, "day")) {
                day.classList.add("highlighted");
            }

  
            if (this.selectedDate != null && dt.isSame(this.selectedDate, "day")) {
                day.classList.add("selected");
            }
            if (dt.month() != this.currentDate.month()) {
                day.classList.add("invisible");
                day.innerHTML = "";
            }
            else
            {
            	day.classList.add("day_"+date);
            	dayDivList[dt.date()] = day;
            }

            var dayClicked = this.dayClicked.bind(this);

	        this.calendarDayListeners.push({
	            elem: day,
	            eventName: "mouseup",
	            callback: dayClicked
	        });

            this.addListener(day, "mouseup", dayClicked);

            

            currentWeek.appendChild(day);

            dt.add(1, "day");
        }

        if(this.options.onDrawMonth != null)
        {
        	this.options.onDrawMonth(month, year, dayDivList);
        }

        if (currentWeek != null) {
            this.calendarContainer.appendChild(currentWeek);
        }

    }

    my.prototype.refreshDate = function () {
    	
    	if(!this.options.includeTime && this.currentDate != null)
    	{
    		this.currentDate.hours(0).minutes(0).seconds(0);
    	}

    	if(this.selectedDate != null)
    	{
    		this.selectedDate = moment(this.currentDate);
    	}
    	


        this.monthList.setValue({
            label: this.currentDate.format("MMM"),
            value: this.currentDate.month()
        });

        this.yearList.setValue({
            label: this.currentDate.format("YYYY"),
            value: this.currentDate.year()
        });

        this.hourList.setValue({
            label: this.currentDate.format(isAMPM ? "hh" : "HH"),
            value: isAMPM ? this.currentDate.hours() % 12 : this.currentDate.hours()
        });

        this.minutesList.setValue({
            label: this.currentDate.format("mm"),
            value: this.currentDate.minutes()
        });

        if (this.AMPMList != null) {
            this.AMPMList.setValue({
                label: this.currentDate.format("A"),
                value: this.currentDate.hours() < 12 ? "AM" : "PM"
            });
        }
	
	    var dateFormat = "L";
	    if(this.options.includeTime)
	    {
	    	dateFormat +=" LT";
	    }
        this.dropdownSpan.innerHTML = this.selectedDate != null ?  this.selectedDate.format(dateFormat) : "";

        if(this.lastDrawnDate.month() != this.currentDate.month() || this.lastDrawnDate.year() != this.currentDate.year())
        {
        	this.drawCalendar(this.currentDate.month(), this.currentDate.year());
        	this.lastDrawnDate = moment(this.currentDate);
        }
        else{
        	this.selectDate(this.selectedDate);
        }        
    }

    my.prototype.selectDate = function(dt){
    	var currentSelected = this.calendarContainer.querySelector(".selected");
    	if(currentSelected != null)
    	{
    		currentSelected.classList.remove("selected");
    	}

    	if(dt != null)
    	{
	    	var toSelect = this.calendarContainer.querySelector(".day.day_"+dt.date());
	    	toSelect.classList.add("selected");
    	}

    }

    my.prototype.createConfig = function () {
        var config_container_id = "config_container"; //TODO : add CreateGuid
        this.config_container = document.createElement("div");
        this.config_container.id = config_container_id;

        if(!this.options.includeTime)
        {
        	this.config_container.classList.add("notime");
        }

        addStylesheetRules([
            "#" + config_container_id + " .day{width:" + this.options.daySize.width + "px;height:" + this.options.daySize.height + "px}",
            "#" + config_container_id + " .week{height:" + this.options.daySize.height + "px}",
            "#" + config_container_id + " .week-day{width:" + this.options.daySize.width + "px}"]);
        //
        //monthYearRow
        //
        var monthYearRow = document.createElement("div");
        monthYearRow.classList.add("month-year-row");

        var monthsValues = [];
        for (var i = 0; i < 12; i++) {
            monthsValues.push({
                label: moment().month(i).format("MMM"),
                value: i
            });
        }

        var monthListSpan = document.createElement("span");

        this.monthList = new LeftRightList(monthListSpan, {
            values: monthsValues,
            onPreviousClicked: function () {
                this.currentDate.subtract(1, "month");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onNextClicked: function () {
                this.currentDate.add(1, "month");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onValueChanged: function (value) {
                this.currentDate.month(value);
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this)

        });


        monthYearRow.appendChild(monthListSpan);

        var yearsValues = [];
        for (var i = this.options.minYear; i <= this.options.maxYear; i++) {
            yearsValues.push({
                value: i,
                label: moment().year(i).format("YYYY")

            });
        }

        var yearListSpan = document.createElement("span");
        this.yearList = new LeftRightList(yearListSpan, {
            values: yearsValues,
            onPreviousClicked: function () {
                this.currentDate.subtract(1, "year");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onNextClicked: function () {
                this.currentDate.add(1, "year");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onValueChanged: function (value) {
                this.currentDate.year(value);
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this)
        });

        monthYearRow.appendChild(yearListSpan);


        this.config_container.appendChild(monthYearRow);

        this.config_container.appendChild(document.createElement("br"));

        this.calendarContainer = document.createElement("div");
        this.calendarContainer.classList.add("calendar-container");

       
        this.drawCalendar(this.currentDate.month(),this.currentDate.year());
         this.lastDrawnDate = moment(this.currentDate);
        this.config_container.appendChild(this.calendarContainer);

       
        var timeRow = document.createElement("div");
        timeRow.classList.add("time-row");

        var clockSpan = document.createElement("span");
        clockSpan.classList.add("clock");
        timeRow.appendChild(clockSpan);

        var hoursValues = [];
        if (isAMPM) {
            for (var i = 1; i <= 12; i++) {
                hoursValues.push({
                    value: i,
                    label: moment().hours(i).format("hh")
                });
            }
        } else {
            for (var i = 0; i < 24; i++) {
                hoursValues.push({
                    value: i,
                    label: moment().hours(i).format("HH")
                });
            }
        }



        var hourSpan = document.createElement("span");
        this.hourList = new LeftRightList(hourSpan, {
            values: hoursValues,
            onPreviousClicked: function () {
                this.currentDate.subtract(1, "hours");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onNextClicked: function () {
                this.currentDate.add(1, "hours");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onValueChanged: function (value) {
                this.currentDate.hours(value);
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this)
        });

        timeRow.appendChild(hourSpan);

        var separatorSpan = document.createElement("span");
        separatorSpan.innerHTML = ":";
        timeRow.appendChild(separatorSpan);

        var minutesValues = [];
        for (var i = 0; i < 60; i++) {
            minutesValues.push({
                value: i,
                label: moment().minute(i).format("mm")
            });
        }

        var minutesSpan = document.createElement("span");
        this.minutesList = new LeftRightList(minutesSpan, {
            values: minutesValues,
            onPreviousClicked: function () {
                this.currentDate.subtract(1, "minutes");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onNextClicked: function () {
                this.currentDate.add(1, "minutes");
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this),
            onValueChanged: function (value) {
                this.currentDate.minutes(value);
                this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
            }.bind(this)
        });
        timeRow.appendChild(minutesSpan);

        if (isAMPM) {
            var AMPMValues = [];
            AMPMValues.push({
                value: "AM",
                label: moment().hours(1).format("A")
            });
            AMPMValues.push({
                value: "PM",
                label: moment().hours(13).format("A")
            });

            var AMPMSpan = document.createElement("span");
            this.AMPMList = new LeftRightList(AMPMSpan, {
                values: AMPMValues,
                onPreviousClicked: function () {
                    var currentHour = this.currentDate.hours();
                    this.currentDate.hours(currentHour < 12 ? 12 + currentHour : currentHour - 12);
                    this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
                }.bind(this),
                onNextClicked: function () {
                    var currentHour = this.currentDate.hours();
                    this.currentDate.hours(currentHour < 12 ? 12 + currentHour : currentHour - 12);
                    this.refreshDate();
                if (this.selectedDate != null) {
                    this.onValueChanged();
                }
                }.bind(this),
                onValueChanged: function (value) {
                    var currentHour = this.currentDate.hours();
                    if (value == "AM") {
                        if (currentHour >= 12) {
                            this.currentDate.hours(currentHour - 12);
                        }
                    } else if (value == "PM") {
                        if (currentHour < 12) {
                            this.currentDate.hours(currentHour + 12);
                        }
                    }

                    this.refreshDate();
                    if (this.selectedDate != null) {
                        this.onValueChanged();
                    }
                }.bind(this)
            });

            timeRow.appendChild(AMPMSpan);
        }



        this.config_container.appendChild(timeRow);

        var buttonsRow = document.createElement("div");
        
        var doneBtn = document.createElement("span");
        doneBtn.classList.add("button");
        doneBtn.classList.add("done-btn");
        doneBtn.innerHTML = "Done";
        this.addListener(doneBtn, "mouseup", this.doneButtonClicked.bind(this));
        buttonsRow.appendChild(doneBtn);

        var nowBtn = document.createElement("span");
        nowBtn.classList.add("button");
        nowBtn.classList.add("now-btn");
        nowBtn.innerHTML = "Now"
        this.addListener(nowBtn,"mouseup", this.nowButtonClicked.bind(this));

        buttonsRow.appendChild(nowBtn);

        this.config_container.appendChild(buttonsRow);

        this.config_container.classList.add("config_container");
        this.config_container.classList.add("dt");
        


       	this.refreshDate();

        this.addListener(this.config_container, "mousedown", this.eventShield.bind(this));
       
        document.body.appendChild(this.config_container);
    }

    my.prototype.addListener = function (elem, eventName, callback) {

        elem.addEventListener(eventName, callback);
        this.listeners.push({
            elem: elem,
            eventName: eventName,
            callback: callback
        });
    }

    my.prototype.getOffsetCoordinates = function (elem) {
        var offsetLeft = 0;
        var offsetTop = 0;
        do {
            if (!isNaN(elem.offsetLeft)) {
                offsetLeft += elem.offsetLeft;
            }
            if (!isNaN(elem.offsetTop)) {
                offsetTop += elem.offsetTop;
            }

        } while (elem = elem.offsetParent);
        return {
            x: offsetLeft,
            y: offsetTop
        };
    }

    my.prototype.Destroy = function () {
        this.listeners.forEach(function (l) {
            l.elem.removeEventListener(l.eventName, l.callback);
        });

        this.yearList.Destroy();
        this.monthList.Destroy();

        this.config_container.parentNode.removeChild(this.config_container);
        this.config_container = null;

    }

    return my;
})();

var LeftRightList = (function () {

    var my = function (parent_div, options) {
        this.listeners = [];
        this.container = parent_div;
        this.options = options;
        this.currentValue = options.currentValue;
        parent_div.classList.add("lrl");
        this.currentIndex = null;
        this.currentId = "list_" + CreateGuid();

        this.addListener(document, "mouseup", this.bodyMouseUp.bind(this));

        this.refresh();
    }


    my.prototype.eventShield = function(e){
    	e.stopPropagation();
    }
    my.prototype.bodyMouseUp = function (e) {

        var target = e.target || e.srcElement;
        if (target.id != this.currentId) {

            this.current.classList.remove("expanded");
        }
    };
    my.prototype.labelClicked = function (e) {
        var bodyHeight = window.innerHeight;

        if (this.current.classList.contains("expanded")) {
            this.current.classList.remove("expanded");
        } else {
            this.current.classList.add("expanded");
        }


    }

    my.prototype.listItemClicked = function (e) {
        var li = e.target || e.srcElement;

        this.options.values.some(function (v) {
            if (v.value == li.dataset.value) {
                this.currentValue = v;
                return true;
            }

        }.bind(this));

        this.refresh();

        if (this.options.onValueChanged) {
            this.options.onValueChanged(this.currentValue.value);
        }

    }

    my.prototype.refresh = function () {
        this.container.innerHTML = "";



        var previous = document.createElement("span");
        previous.innerHTML = String.fromCharCode(parseInt("25C0", 16));
        previous.classList.add("arrow");
        this.addListener(previous, "mouseup", this.previousClicked.bind(this));
        this.container.appendChild(previous);

        this.current = document.createElement("span");
        this.current.classList.add("current");

       
        var label = document.createElement("label");
    
        label.id = this.currentId;
        label.classList.add("label");
        label.innerHTML = this.currentValue != null ? this.currentValue.label : "";

        this.addListener(label, "mouseup", this.labelClicked.bind(this));
        this.current.appendChild(label);




        var picker = document.createElement("div");
        picker.classList.add("picker");

        var pickerContent = document.createElement("ul")
        pickerContent.classList.add("picker-content");

        this.addListener(picker,"mouseup", this.eventShield.bind(this));


        this.options.values.forEach(function (v) {
            var li = document.createElement("li");
            li.innerHTML = v.label;
            li.dataset.value = v.value;
            this.addListener(li, "mouseup", this.listItemClicked.bind(this));

            pickerContent.appendChild(li);
        }.bind(this));
        if (this.currentValue != null) {

            pickerContent.value = this.currentValue.value;
        }


        picker.appendChild(pickerContent);
        this.current.appendChild(picker);

        this.container.appendChild(this.current);


        var next = document.createElement("span");
        next.innerHTML = String.fromCharCode(parseInt("25B6", 16));
        next.classList.add("arrow");
        this.addListener(next, "mouseup", this.nextClicked.bind(this));
        this.container.appendChild(next);
    }

    my.prototype.setValue = function (value) {
        this.currentValue = value;
        this.refresh();
    }
    my.prototype.getCurrentValueIndex = function () {
        var currentIndex = null;
        this.options.values.some(function (v, index) {
            if (v.value == this.currentValue.value) {
                currentIndex = index;
                return true;
            }
        }.bind(this));
        return currentIndex;
    }

    my.prototype.previousClicked = function () {
        if (this.options.onPreviousClicked) {
            this.options.onPreviousClicked();
        }

    }

    my.prototype.nextClicked = function () {
        if (this.options.onNextClicked) {
            this.options.onNextClicked();
        }
    }

    my.prototype.addListener = function (elem, eventName, callback) {

        elem.addEventListener(eventName, callback);
        this.listeners.push({
            elem: elem,
            eventName: eventName,
            callback: callback
        });
    }

    my.prototype.Destroy = function () {
        this.listeners.forEach(function (l) {
            l.elem.removeEventListener(l.eventName, l.callback);
        });

    }

    return my;

})();

