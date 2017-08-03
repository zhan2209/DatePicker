var EluPeriodPicker = function () {
    var defaultOptions = {
        periods: {
            "Today": function() {
                return {
                    from: moment().startOf("day"),
                    to: moment().endOf("day")
                };
            },
            "Yesterday": function() {
                return {
                    from: moment().subtract(1, "day").startOf("day"),
                    to: moment().subtract(1, "day").endOf("day")
                };
            },
            "Week to date": function() {
                return {

                    from: moment().startOf("week"),
                    to: moment()
                };
            },
            "Last week": function() {
                return {
                    from: moment().subtract(1, "week").startOf("week"),
                    to: moment().subtract(1, "week").endOf("week")
                };
            },
            "Last 7 days": function() {
                return {
                    from: moment().subtract(1, "week").startOf("day"),
                    to: moment()
                };
            },
            "Month to date": function() {
                return {
                    from: moment().startOf("month"),
                    to: moment()
                };
            },
            "Last month": function() {
                return {
                    from: moment().subtract(1, "month").startOf("month"),
                    to: moment().subtract(1, "month").endOf("month")
                };
            }
        },
        selectedPeriod: null,
        includeTime: true,
        minYear:2010,
        maxYear:new Date().getFullYear()

    };
    var my = function (parent_div, options) {
        this.listeners = [];
        this.options = options != null ? options : {};
        Object.keys(defaultOptions).forEach(function (key) {
            if (!this.options.hasOwnProperty(key)) {
                this.options[key] = defaultOptions[key];
            }
        }.bind(this));

        this.currentPeriod = this.options.selectedPeriod;
        this.parent_div = parent_div;
        parent_div.classList.add("ppicker");
        this.dropdown = document.createElement("div");
        this.dropdown.id = "dropdown";
        this.dropdown.style.height = "100%";
        this.dropdown.style.fontFamily = "Arial";
        this.dropdown.style.padding = "4px";

        this.dropdownSpan = document.createElement("span");
        this.dropdown.appendChild(this.dropdownSpan);

        this.addListener(this.dropdown, "mouseup", this.dropdownMouseUp.bind(this));

        parent_div.appendChild(this.dropdown);

        //Wait for css to be applied to trigger resize
        setTimeout(function(){
        	this.resize();

        	//As a security we trigger another resize after one second
        	setTimeout(function(){
        		this.resize();
        	}.bind(this),1000);

        }.bind(this),100);
     


        this.createConfig();

        this.refreshDate(true);

        this.addListener(document, "mousedown", this.bodyClicked.bind(this));

    }

    my.prototype.setIncludeTime = function(value){
	    this.options.includeTime = value;
    	this.from_picker.setIncludeTime(value);
    	this.to_picker.setIncludeTime(value);

    	this.refreshDate();
    }

    my.prototype.setValue = function(period){
    	this.currentPeriod = period;
    	this.refreshDate(true);
    }
    my.prototype.getValue = function()
    {
    	return this.currentPeriod;
    }

    my.prototype.refreshDate = function (refreshPickers) {

    	if(!this.options.includeTime && this.currentPeriod != null)
    	{
    		if(this.currentPeriod.from != null)
    		{
    			this.currentPeriod.from.hours(0).minutes(0).seconds(0);    			
    		}
    		if(this.currentPeriod.to != null)
    		{
    			this.currentPeriod.to.hours(0).minutes(0).seconds(0);    			
    		}

    	}

        if (this.currentPeriod != null && this.currentPeriod.from != null && this.currentPeriod.to != null) {
        	var dateFormat = "L";
		    if(this.options.includeTime)
		    {
		    	dateFormat +=" LT";
		    }
            this.dropdownSpan.innerHTML = this.currentPeriod.from.format(dateFormat) + " - " + this.currentPeriod.to.format(dateFormat);
        } else {
            this.dropdownSpan.innerHTML = "";
        }

        if (refreshPickers) {
            var from = this.currentPeriod != null ? this.currentPeriod.from : null;
            var to = this.currentPeriod != null ? this.currentPeriod.to : null;

            this.from_picker.setValue(from);
            this.to_picker.setValue(to);
        }
    }

    my.prototype.resize = function () {
        this.hideConfig();
        this.offsetCoordinates = this.getOffsetCoordinates(this.dropdown);
    }

    my.prototype.getOffsetCoordinates = function (elem) {
        var rect = elem.getBoundingClientRect();


        return {x:rect.left, y:rect.top, width:rect.width,height:rect.height};
        
    }

    my.prototype.createConfig = function () {
        this.config_container = document.createElement("div");

        this.config_container.classList.add("config_container");
        this.config_container.classList.add("ppicker");


        //
        //Periods container
        //
        var periodsContainer = document.createElement("div");
        periodsContainer.classList.add("periods-container");

        var periodsContainerTitle = document.createElement("div");
        periodsContainerTitle.classList.add("title");
        periodsContainerTitle.innerHTML = "Shortcuts";

        periodsContainer.appendChild(periodsContainerTitle);

        Object.keys(this.options.periods).forEach(function (p) {
            var period = document.createElement("div");
            period.classList.add("period");
            period.innerHTML = p;
            period.dataset.period = p;
            this.addListener(period, "mouseup", this.periodClicked.bind(this));
            periodsContainer.appendChild(period);
        }.bind(this));


        this.config_container.appendChild(periodsContainer);
        //
        //Pickers container
        //
        this.pickersContainer = document.createElement("div");

        this.pickersContainer.classList.add("pickers-container");

        //From

        var fromContainer = document.createElement("div");
        fromContainer.classList.add("picker-container");

        var fromContainerTitle = document.createElement("div");
        fromContainerTitle.classList.add("title");
        fromContainerTitle.innerHTML = "From";
        fromContainer.appendChild(fromContainerTitle);

        var fromPickerContainer = document.createElement("div");

        this.from_picker = new EluInlineDatePicker(fromPickerContainer, {
        	minYear:this.options.minYear,
        	maxYear:this.options.maxYear,
            onValueChanged: function (value) {
                if (this.currentPeriod == null) {
                    this.currentPeriod = {};
                }
                this.currentPeriod.from = value;
                this.refreshDate();
                if(this.options.onValueChanged)
                {
                	this.options.onValueChanged(this.currentPeriod);
                }
            }.bind(this),
             includeTime:this.options.includeTime
        });
        fromContainer.appendChild(fromPickerContainer);
        this.pickersContainer.appendChild(fromContainer);
        //To

        var toContainer = document.createElement("div");
        toContainer.classList.add("picker-container");

        var toContainerTitle = document.createElement("div");
        toContainerTitle.classList.add("title");
        toContainerTitle.innerHTML = "To";
        toContainer.appendChild(toContainerTitle);

        var toPickerContainer = document.createElement("div");
        this.to_picker = new EluInlineDatePicker(toPickerContainer, {
        	minYear:this.options.minYear,
        	maxYear:this.options.maxYear,
            onValueChanged: function (value) {
                if (this.currentPeriod == null) {
                    this.currentPeriod = {};
                }
                this.currentPeriod.to = value;
                this.refreshDate();
                if(this.options.onValueChanged)
                {
                	this.options.onValueChanged(this.currentPeriod);
                }
            }.bind(this),
            includeTime:this.options.includeTime
        });
        toContainer.appendChild(toPickerContainer);

        this.pickersContainer.appendChild(toContainer);

        this.config_container.appendChild(this.pickersContainer);



        var buttonsRow = document.createElement("div");
        
        var doneBtn = document.createElement("span");
        doneBtn.classList.add("button");
        doneBtn.classList.add("done-btn");
        doneBtn.innerHTML = "Done";
        this.addListener(doneBtn, "mouseup", this.doneButtonClicked.bind(this));
        buttonsRow.appendChild(doneBtn);

        this.config_container.appendChild(buttonsRow);

        this.addListener(this.config_container, "mousedown", this.eventShield.bind(this));

        document.body.appendChild(this.config_container);

    }

     my.prototype.doneButtonClicked = function (e) {
        

        this.hideConfig();
    }

    my.prototype.periodClicked = function (e) {
        var period = e.target || e.srcElement;
        var periodName = period.dataset.period;



        this.currentPeriod =this.options.periods[periodName]();
        this.refreshDate(true);
        if(this.options.onValueChanged)
        {
        	this.options.onValueChanged(this.currentPeriod);
        }
    }
    my.prototype.customPeriodClicked = function (e) {
        this.pickersContainer.classList.remove("hidden");
        this.customPeriod.classList.add("selected");
    }

    my.prototype.eventShield = function (e) {
        e.stopPropagation();
    }

    my.prototype.placeConfig = function (e) {

        var dropdown_bottom = this.offsetCoordinates.y + this.offsetCoordinates.height;
        var dropdown_right = this.offsetCoordinates.x + this.offsetCoordinates.width;



        this.config_container.classList.remove("top");
        this.config_container.classList.remove("bottom");
        this.config_container.classList.remove("right");
        this.config_container.classList.remove("left");
        this.config_container.style.right="";
        this.config_container.style.left="";
        this.config_container.style.top="";
        this.config_container.style.bottom="";


        if (this.offsetCoordinates.x > window.innerWidth / 2) {
            this.config_container.style.right = (window.innerWidth - (this.offsetCoordinates.x + this.offsetCoordinates.width)) + "px";
            this.config_container.classList.add("right");
        } else {
            this.config_container.style.left = this.offsetCoordinates.x + "px";
            this.config_container.classList.add("left");

        }

        if (dropdown_bottom > window.innerHeight / 2) {
            this.config_container.style.top = (this.offsetCoordinates.y) + "px";
            this.config_container.classList.add("top");
        } else {

            this.config_container.style.top = (this.offsetCoordinates.y + this.offsetCoordinates.height) + "px";
            this.config_container.classList.add("bottom");
        }
    }


    my.prototype.dropdownMouseUp = function (e) {
        this.toggleConfig();
    }

    my.prototype.bodyClicked = function (e) {

        this.hideConfig();
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


        this.config_container.parentNode.removeChild(this.config_container);
        this.config_container = null;

    }


    return my;

}();