var WeatherStore = function () {
    hlstore.SimpleStore.call(this);
    var me = this;
    
    /**
     * REST API
     */
    var _api = {
        getWeather: function () {
            return $.ajax({
                context: this,
                url: 'https://api.forecast.io/forecast/dcc7bf3834b986052df65f3a6563ce65/' + lat + ',' + lng + '',
                dataType: 'jsonp'
            });
        }
    };
    
    var updateWeather = function () {
        if (lat === '' || lng === '') {
            return;
        }
        
        _api.getWeather().done(function (result) {
            me.updates.value = result;
            me.notify();
            hlio.saveLocal('hl.' + user + '.weather', result, secret);
        });
    };
    
    var setLatLng = function (nextLat, nextLng) {
        
        if (lat === String(nextLat) && lng === String(nextLng)) {
            return;   
        }
        
        lat = String(nextLat);
        lng = String(nextLng);
        
        updateWeather();
    };
    
    var user = 'my';
    var secret = 'hash';
    var lat = '';
    var lng = '';
    
    this.updateLocation = function (address) {
        $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&sensor=false', null, function (response) {
            if (response.status === 'OK') {
                setLatLng(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
            }
        });
    }
    
    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
        /**
         * Update weather every 15 minutes
         */
        this.intervalHandle = setInterval(updateWeather, 900000)
    
        /**
         * Get weather
         */
        updateWeather()

        /**
         * Use local storage to give user something to look at 
         * until the server gets back the latest data
         */
        var result = hlio.loadLocal('hl.' + user + '.weather', secret);
        if (result) {
            this.updates.value = result;
            this.notify();
        }
    };
};
WeatherStore.prototype = Object.create(hlstore.SimpleStore.prototype);
WeatherStore.prototype.constructor = WeatherStore;

weatherStore = new WeatherStore();