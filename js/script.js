/*
ver 1.2
changelog: 
-marker images pointed to permant online repo (http://basketgreens.com/v1.0_img)
  -this is for better integration with shopify site
  -this is also applied to the css file
-ported bootstrap control-group.error to style.css file (see shopify changelog below) to control
 a non-submission (still need to change requirement to email), chose not to use html5
 required as the warning popup does not display correctly due to not knowing where leaflet tooltip is
-added move to tooltip functionality when clicking on nearest_marker link in user tooltip

found:
- map._layers reveals user icon is placed twice for some reason and this leads to two
  ajax POST requests to the google spreadsheet. Perhaps it is twice due to two seperate
  functions, one for geolocation another for the geocoder? 

- Ajax POST complete change state of button to loading state also affects the buy button
  on the shopify page. An unintended bug, this could be useful in preventing people from being
  able to buy products if their location does not support it.
  -However this also affects the 'add to cart button' for quickview related products on the same
   page
  -However this does not happen if user never clicks submit email, need to change flow

shopify changelog:
- map functions integrated
- removed bootstrap.css file (ported control-group.error over to style.css)
- added data-loading-text="We currently do not support your location :(" to 'add to cart' button in 
  product-form.liquid on line 40

found:
- bootstrap.css conflicts with css used in shopify template and is not used

TO DO:
- need to add a 'please fill out this form' popup for tooltip email form
- change prevention flow
- clean up code, need global variable for link constructor so we don't have to use it twice
  for geolocation and geocoder
- change submission requirement to email

*/

      var map = L.map('map', {minZoom: 6, maxZoom: 17, scrollWheelZoom: false}).setView([32.957129,-96.997073], 12);

      L.tileLayer('http://c.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);


      /* Old nearest Icon
      var nearestIcon = L.icon({
          iconUrl: 'marker-icon_orange.png',
          iconSize:     [25, 41], // size of the icon
          shadowSize:   [50, 64], // size of the shadow
          iconAnchor:   [13, 41], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
      });
      */

      var defaultIcon = L.icon({
          iconUrl: 'http://www.basketgreens.com/v1.0_img/icon.png',
          iconSize:     [33, 41], // size of the icon
          shadowSize:   [50, 55], // size of the shadow
          iconAnchor:   [16, 35], // point of the icon which will correspond to marker's location
          //shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.5/images/marker-shadow.png',
          shadowAnchor: [13, 50],  // the same for the shadow
          popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
      });

      var nearestIcon = L.icon({
          iconUrl: 'http://www.basketgreens.com/v1.0_img/icon_nearest_noshadow.png',
          iconSize:     [33, 41], // size of the icon
          shadowSize:   [50, 55], // size of the shadow
          iconAnchor:   [16, 35], // point of the icon which will correspond to marker's location
          //shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.5/images/marker-shadow.png',
          shadowAnchor: [13, 50],  // the same for the shadow
          popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
      });

      var userIcon = L.icon({
          iconUrl: 'http://www.basketgreens.com/v1.0_img/icon_user.png',
          iconSize:     [33, 41], // size of the icon
          shadowSize:   [50, 55], // size of the shadow
          iconAnchor:   [16, 35], // point of the icon which will correspond to marker's location
          //shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.5/images/marker-shadow.png',
          shadowAnchor: [13, 50],  // the same for the shadow
          popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
      });

      function onEachFeature(feature, layer) {
        var popupContent = "<div><b>" + feature.properties.store + "</b></div><div>" + feature.properties.address + "</div><div>" + feature.properties.city + ",\u00A0" + feature.properties.state + ",\u00A0" + feature.properties.zip + "</div>";

        if (feature.properties && feature.properties.popupContent) {
          popupContent += feature.properties.popupContent;
        }

        layer.bindPopup(popupContent);

        L.circle([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], 50000, {
          weight: 1,
          color: 'green',
          fillColor: '#04a223',
          fillOpacity: 0.1
        }).addTo(map).bindPopup("The Fresh Zone of " + feature.properties.store + " products.");

      }


      var geolocate = document.getElementById('geolocate');
      var prompt = document.getElementById('prompt');
      geolocate.onclick = function(e) {

      function onLocationFound(e) {
        //Haversine Formula for calculating distance between lat lon coordinates
        var neararray = [];
        var min = 40009.88; //Circumference of the earth
        var arraynum; // remembering which feature item

        for (var i = 0; i < freeBus.features.length; i++) {
          var lat1 = e.latlng.lat;
          var lon1 = e.latlng.lng;
          var lat2 = freeBus.features[i].geometry.coordinates[1];
          var lon2 =freeBus.features[i].geometry.coordinates[0];

            var R = 6371; // Radius of the earth in km
            var dLat = (lat2-lat1) * (Math.PI/180);  // deg2rad below
            var dLon = (lon2-lon1) * (Math.PI/180); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos((lat1) * (Math.PI/180)) * Math.cos((lat2) * (Math.PI/180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km 
            //console.log(d);

          if(d < 100) {
            neararray.push(i);
          }

          if(d < min) {
            min = d;
            arraynum = i;
          }
        };

        //console.log(neararray);

        L.geoJson(freeBus, {
          pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: defaultIcon});
          },
          onEachFeature: onEachFeature
        }).addTo(map);

        var radius = e.accuracy / 2;
        //nearest marker
        var marker_nearest= L.marker([freeBus.features[arraynum].geometry.coordinates[1], freeBus.features[arraynum].geometry.coordinates[0]], {icon: nearestIcon}).addTo(map).bindPopup("<div><b>" + freeBus.features[arraynum].properties.store + "</b></div><div>" + freeBus.features[arraynum].properties.address + "</div><div>" + freeBus.features[arraynum].properties.city + ",\u00A0" + freeBus.features[arraynum].properties.state + ",\u00A0" + freeBus.features[arraynum].properties.zip + "</div>");

        if (min > 500) {
        var marker_notfound = L.marker(e.latlng, {icon: userIcon, zIndexOffset:1000}).addTo(map);
        var link = $('<br/><br/><div id="form-layout"><form class="form-horizontal"><fieldset><div class="control-group" style="margin-bottom: 5px !important;"><div class="controls" style="margin-left: 0px !important;"><input type="text" id="entry_0" name="entry.0.single" style="width: 283px;"></div></div></fieldset><input type="submit" class="btn" data-loading-text="Thanks! We&#39ll be in touch!" name="submit" value="Submit" style="width:297px;"><input type="hidden" name="entry.1.single" id="entry_1" value=""><input type="hidden" name="entry.2.single" id="entry_2" value=""></form></div>').click(function(){
            // This link should be the link to the Google Form
            var formUrl = 'https://docs.google.com/spreadsheet/formResponse?formkey=dC1VQTFOUFlBd09WcV9rcVc0VU9FVFE6MQ';
            $('#entry_1').val(e.latlng.lng);
            $('#entry_2').val(e.latlng.lat);
            $('form').submit(function(e) {
                var button = $('input[type=submit]', this),
                    data = $(this).serialize();
                e.preventDefault();
                if (validate($(this))) {
                    button.button('loading');
                    $.ajax({
                        type: 'POST',
                        url: formUrl,
                        data: data,
                        complete: function() {
                            button.button('loading');
                            //window.location = 'report.html';
                        }
                    });
                }

                function validate(form) {
                    $('.control-group').removeClass('error');
                    $('input, textarea', form).each(function() {
                        var tag = $(this)[0].tagName.toLowerCase(),
                            type = $(this).attr('type');
                        // Validate radio buttons
                        if (tag === 'input' && type === 'radio') {
                            var name = $(this).attr('name');
                            if ($('[name="' + name + '"]:checked').length < 1) {
                                $(this).parent().parent().parent().addClass('error');
                            }
                        }
                        // Validate text fields
                        if ((tag === 'input' && type === 'text') || tag === 'textarea') {
                            if ($(this).val() === '' && !$(this).parent().hasClass('radio')) {
                                $(this).parent().parent().addClass('error');
                            }
                        }
                    });

                    if ($('.control-group.error').length < 1) return true;
                    $('.control-group.error').length
                    
                    $('html, body').animate({
                        scrollTop: $('.control-group.error').offset().top - 20
                    }, 500);

                    return false;
                }
            });

        });

        var div = $('<div />').text("Oh Noes! It seems there are no qualified growers in your area at the moment! If you would like, enter your email address below and we'll let you know when local growers become avaliable!").append(link)[0];

        marker_notfound.bindPopup(div).openPopup();

        }
        else {
          for (each in map._layers) {
            //this for loop evaluates all map elements except the upcoming L.marker user Icon
            // the latest element added is marker_nearest, (see logic above) which we want to id for
            var id = map._layers[each]._leaflet_id;
          }
          //console.log(map._layers);
          //console.log(map._layers.length);
          L.marker(e.latlng, {icon: userIcon, zIndexOffset:1000}).addTo(map)
            .bindPopup('Hey there! Based on your current location we recommend you select <b><a href="#" onclick="map._layers['+id+'].openPopup();return false;">'+ freeBus.features[arraynum].properties.store +'</a></b> <span id="underline">below</span> for the most local and fresh product.').openPopup();
        }

        L.circle(e.latlng, radius, {
          weight: 1,
          //color: 'green',
          //fillColor: '#04a223',
          fillOpacity: 0.1
        }).addTo(map);

        /*
        var recommendation = document.createElement('div');
            recommendation.setAttribute('id', 'geolocate');
        var rec_name_txtNode = document.createTextNode("Given your current location we recommend you select " + freeBus.features[arraynum].properties.store + " below for the most local and fresh product.")

        recommendation.appendChild(rec_name_txtNode);
        document.getElementById('geolocate-container').appendChild(recommendation);
        */
      }

      function onLocationError(e) {
        alert(e.message);
      }

      map.on('locationfound', onLocationFound);
      map.on('locationerror', onLocationError);

      map.locate({setView: true, maxZoom: 10});
      // And hide the geolocation button
      prompt.parentNode.removeChild(prompt);
    } 


//==================Geocoder ===============//

!function($) {

    $.fn.geocode = geocode;

    function geocode(e) {

        e.preventDefault();
        var $this = $(this),
            query = encodeURIComponent($this.find('input[type=text]').val());

        $this.addClass('loading');

        reqwest({
            url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&&limit=1&q=' + query,
            type: 'jsonp',
            jsonpCallback: 'callback',
            jsonpCallbackName: 'callback',
            success: success
        });

        function success(resp) {
            resp = resp[0];
            //console.log(resp);
            $this.removeClass('loading');

            if (!resp) {
                $this.find('#geocode-error').text('This address cannot be found.').fadeIn('fast');
                return;
            }
            else {
//==================Leaflet Specific Functions ===============//

        //Haversine Formula for calculating distance between lat lon coordinates
        var neararray = [];
        var min = 40009.88; //Circumference of the earth
        var arraynum; // remembering which feature item

        for (var i = 0; i < freeBus.features.length; i++) {
          var lat1 = resp.lat;
          var lon1 = resp.lon;
          var lat2 = freeBus.features[i].geometry.coordinates[1];
          var lon2 =freeBus.features[i].geometry.coordinates[0];

            var R = 6371; // Radius of the earth in km
            var dLat = (lat2-lat1) * (Math.PI/180);  // deg2rad below
            var dLon = (lon2-lon1) * (Math.PI/180); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos((lat1) * (Math.PI/180)) * Math.cos((lat2) * (Math.PI/180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km 
            //console.log(d);

          if(d < 100) {
            neararray.push(i);
          }

          if(d < min) {
            min = d;
            arraynum = i;
          }
        };

        //console.log(neararray);
        L.geoJson(freeBus, {
          pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: defaultIcon});
          },
          onEachFeature: onEachFeature
        }).addTo(map);
        

        var radius = e.accuracy / 2;
        //nearest marker
        var marker_nearest = L.marker([freeBus.features[arraynum].geometry.coordinates[1], freeBus.features[arraynum].geometry.coordinates[0]], {icon: nearestIcon}).addTo(map).bindPopup("<div><b>" + freeBus.features[arraynum].properties.store + "</b></div><div>" + freeBus.features[arraynum].properties.address + "</div><div>" + freeBus.features[arraynum].properties.city + ",\u00A0" + freeBus.features[arraynum].properties.state + ",\u00A0" + freeBus.features[arraynum].properties.zip + "</div>");

        if (min > 500) {
        var marker_notfound = L.marker([resp.lat, resp.lon], {icon: userIcon, zIndexOffset:1000}).addTo(map);
        var link = $('<br/><br/><div id="form-layout"><form class="form-horizontal"><fieldset><div class="control-group" style="margin-bottom: 5px !important;"><div class="controls" style="margin-left: 0px !important;"><input type="text" id="entry_0" name="entry.0.single" style="width: 283px;"></div></div></fieldset><input type="submit" class="btn" data-loading-text="Thanks! We&#39ll be in touch!" name="submit" value="Submit" style="width:297px;"><input type="hidden" name="entry.1.single" id="entry_1" value=""><input type="hidden" name="entry.2.single" id="entry_2" value=""></form></div>').click(function(){
            // This link should be the link to the Google Form
            var formUrl = 'https://docs.google.com/spreadsheet/formResponse?formkey=dC1VQTFOUFlBd09WcV9rcVc0VU9FVFE6MQ';
            //input lat lon with relevant variables here
            $('#entry_1').val(resp.lon);
            $('#entry_2').val(resp.lat);
            $('form').submit(function(e) {
                var button = $('input[type=submit]', this),
                    data = $(this).serialize();
                e.preventDefault();
                if (validate($(this))) {
                    button.button('loading');
                    $.ajax({
                        type: 'POST',
                        url: formUrl,
                        data: data,
                        complete: function() {
                            button.button('loading');
                            //window.location = 'report.html';
                        }
                    });
                }

                function validate(form) {
                    $('.control-group').removeClass('error');
                    $('input, textarea', form).each(function() {
                        var tag = $(this)[0].tagName.toLowerCase(),
                            type = $(this).attr('type');
                        // Validate radio buttons
                        if (tag === 'input' && type === 'radio') {
                            var name = $(this).attr('name');
                            if ($('[name="' + name + '"]:checked').length < 1) {
                                $(this).parent().parent().parent().addClass('error');
                            }
                        }
                        // Validate text fields
                        if ((tag === 'input' && type === 'text') || tag === 'textarea') {
                            if ($(this).val() === '' && !$(this).parent().hasClass('radio')) {
                                $(this).parent().parent().addClass('error');
                            }
                        }
                    });

                    if ($('.control-group.error').length < 1) return true;
                    $('.control-group.error').length
                    
                    $('html, body').animate({
                        scrollTop: $('.control-group.error').offset().top - 20
                    }, 500);

                    return false;
                }
            });
        });

        var div = $('<div />').text("There are no local growers in your area :(.If you would like, enter your email address below and we'll let you know when local growers become avaliable!").append(link)[0];

        marker_notfound.bindPopup(div).openPopup();

        }
        else {
          for (each in map._layers) {
            //this for loop evaluates all map elements except the upcoming L.marker user Icon
            // the latest element added is marker_nearest, (see logic above) which we want to id for
            var id = map._layers[each]._leaflet_id;
          }
          //console.log(map._layers);
          //console.log(map._layers.length);
          L.marker([resp.lat, resp.lon], {icon: userIcon, zIndexOffset:1000}).addTo(map)
            .bindPopup('Hey there! Based on your current location we recommend you select <b><a href="#" onclick="map._layers['+id+'].openPopup();return false;">'+ freeBus.features[arraynum].properties.store +'</a></b> <span id="underline">below</span> for the most local and fresh product.').openPopup();
        }

        map.setView([resp.lat, resp.lon], 10);
        prompt.parentNode.removeChild(prompt);


    //==================Leaflet Specific Functions End ===============//
            }

            $this.find('#geocode-error').hide();
        }
    }

    $(function() {
        $('[data-control="geocode"] form').submit(geocode);
    });

}(window.jQuery);