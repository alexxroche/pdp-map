var map = L.map('map').setView(se.tl.location, se.tl.zoom);

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

var q = getQueryParams(document.location.search);

if(q){
    for (var key in q) {
        console.log(q[key] + ' = ' + key);
    }
    if(q.nomarch >= 1){ se.nomarch = 1; }
    if(q.notrees >= 1){ se.notrees = 1; }
    if(q.nofields >=1){ se.nofields = 1; }
    if(q.nomarkers >=1){ Se.nomarkers = 1; }
    if(q.only_markers >=1){ 
        se.nocircles = 1; 
        se.nogrid = 1; 
        se.nomarch = 1; 
        se.nopolygon = 1; 
        se.notrees = 1; 
        se.nofields = 1; 
    }
//"undefined" === q.notrees && se.no.trees = 1;
}

loadMap(se);

function loadMap(se){ 

    // icons
    var greenIcon = L.icon({
        iconUrl: 'img/marker-icon-green.png',
        iconRetinaUrl: 'green-icon@2x.png',
        iconSize: [25, 41],
        iconAnchor: [22, 94],
        popupAnchor: [-10, -94],
        shadowUrl: 'img/marker-shadow.png',
        //shadowRetinaUrl: 'my-icon-shadow@2x.png',
        shadowSize: [25, 41],
        shadowAnchor: [18, 94]
    });

    var sycamoreIcon = L.icon({
        iconUrl: 'img/sycamore-icon.png',
        iconRetinaUrl: 'sycamore-icon@2x.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowUrl: 'img/marker-shadow.png',
        //shadowRetinaUrl: 'my-icon-shadow@2x.png',
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });

    var ashIcon = L.icon({
        iconUrl: 'img/ash-icon.png',
        iconRetinaUrl: 'ash-icon@2x.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowUrl: 'img/marker-shadow.png',
        //shadowRetinaUrl: 'my-icon-shadow@2x.png',
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });


//console.log(se.tl.url);
                
if("undefined" == se.tl.url){
    se.tl.url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
//L.tileLayer('http://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
}
function loadTileLayer(){
    L.tileLayer(se.tl.url, {
        maxZoom: se.tl.maxZoom,
        attribution: se.tl.attribution,
        id: se.tl.id
    }).addTo(map);
}

loadTileLayer();

if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };
}

// These are neive simple functions that should be combined into a single function
// that can generalise based on the type of data object; if an array then it is probably latlng else if an object then it is a collection of things
// or config options.

// march
if( "undefined" != se.map.march && "undefined" != se.nomarch){
    var newPol = [];
    for (var key in se.map.march) {
        var obj = se.map.march[key];
                var ll = obj.split(',');
                newPol.push([parseFloat(ll[0]),parseFloat(ll[1])]);
    }
    //console.log(JSON.stringify(newPol));
    var neufPol = L.polygon(newPol, { color: 'orange', fillOpacity: 0.1 }).addTo(map);
}

function fieldColour(c){
 //console.log('colour for ' + c);
   return c%10 == 0 ? '#a6cee3' :
           c%9 == 0 ? '#1f78b4' :
           c%8 == 0 ? '#b2df8a' :
           c%7 == 0 ? '#33a02c' :
           c%6 == 0 ? '#fb9a99' :
           c%5 == 0 ? '#e31a1c' :
           c%4 == 0 ? '#fdbf6f' :
           c%3 == 0 ? '#ff7f00' :
           c%2 == 0 ? '#cab2d6' :
           c%1 == 0 ? '#6a3d9a' :
                      '#fca';
}

//fields
function drawFields(){
    if( "undefined" != se.map.fields){
            var keyDex = 3;
        for (var key in se.map.fields) {
            keyDex++;
            
            var corners = se.map.fields[key];
            var first_marker = undefined;
            var newPol = [];
            //corners.forEach(function(marker, index, array) { // maybe this is better than a for loop?
            for (var c=0;c<corners.length;c++){
                var marker = corners[c];
            //   if(corners.hasOwnProperty(marker)){
                    if( "undefined" == first_marker){
                        first_marker = marker;
                    }
                    else if( marker != first_marker){
                        var ll = marker.split(',');
                        newPol.push([+ll[0],+ll[1]]);
                    }
             //  }
            }
            // need three points for a polygon in a plain
            if (newPol.length < 3){ continue; }//else{ log('drawField skipped: ',newPol); }
            // calculate the area?
            // calculate the field colour so that it does not match those touching?
            var cA = 0;
            Array.apply(null, {length: key.split(' ').join().length-1}).map(Number.call, Number).map(function(p){ cA += key.charCodeAt(p); });
            var reversed = 0;
            var Ac = cA;
            for(; Ac; Ac = Math.floor(Ac / 10)) {
                reversed *= 10;
                reversed += Ac % 10;
            }
            var fillCol = fieldColour(reversed + '' + cA);
    // NTS set the border colour to indicate the type of field
    // NTS or check to see if there are static colour options in the data.
            this.key = L.polygon(newPol, { color: '#093', fillColor: fillCol, fillOpacity: 0.5}).addTo(map).bindPopup(key);
            var geoJSON = this.key.toGeoJSON();
        /*
            geoJSON.addData( {properties": { name": key } }); 
            console.log(JSON.stringify(this.key.toGeoJSON()));
            //console.log(JSON.stringify(this.key.toGeoJSON()));
            //console.log(this.key.toGeoJSON());

            We will want the ability to export features as GeoJSON
        */
        }
    }
}

//log('GotHere',3);
//"undefined" == se.nofields || drawFields();
se.nofields != 1 ? drawFields() : console.log("Fields disabled");

// http://stackoverflow.com/a/2975934/1153645
function sigFigs(n, sig) {
    if ( n === 0 )
        return 0
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n < 0 ? -n: n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
}


// trees
function markTrees(){
    if ( "undefined" != se.map.trees.mature){
        for (var tree in se.map.trees.mature){
            var t = se.map.trees.mature[tree];
            //console.log(t.data.name + ' is at ' + t.data.latlng);
            var tHeight = sigFigs(parseFloat(t.data.height) * 3, 3) + ' meters';
            var tPop = t.data.date + '<br>' + t.species + ' - "' + t.data.name + '"<br>2&#960;r@1meter: ' + t.data.circumferenceAt1meter + '<br>Height: ' + tHeight;
            var ll = t.data.latlng.split(',');
            // it would be nice to change the icon size to match the tree height! NTS
            if(t.species && t.species == 'Ash'){
                L.marker([+ll[0],+ll[1]], { icon: ashIcon, opacity: 0.7, alt: 'Ash'}).addTo(map).bindPopup(tPop);
            }else if(t.species && t.species == 'Sycamore'){
                L.marker([+ll[0],+ll[1]], { icon: sycamoreIcon, opacity: 0.8, alt: 'Sycamore'}).addTo(map).bindPopup(tPop);
            }else if(t.icon && typeof(t.icon) != "undefined"){
                L.marker([+ll[0],+ll[1]], { icon: t.icon, opacity: 0.8, alt: 'tree'}).addTo(map).bindPopup(tPop);
            }else{
                L.marker([+ll[0],+ll[1]]).addTo(map).bindPopup(tPop);
            }
        }
    }
}

se.notrees != 1 ? markTrees() : console.log("Trees disabled");

//polylines (map grid-lines / map grid-squares
function addGrid(){
    if ( "undefined" != se.map.polyline){
        for (var line in se.map.polyline){
            var l = se.map.polyline[line];
            //console.log(l.points + " : " + l.options);
            var this_line = line;
            this_line = L.polyline(l.points, l.options).addTo(map);
            if(l.bindPopup){
                this_line.bindPopup(l.bindPopup);
            }
            // openPopup must be AFTER bindPopup
            if("undefined" != l.openPopup && l.openPopup == 1){
                this_line.openPopup();
            }
        }
    }
}

se.nogrid != 1 ? addGrid() : console.log("Grid disabled");

//markers
function addMarkers(){
    if ( "undefined" != se.map.markers){
        for (var mk in se.map.markers){
            var m = se.map.markers[mk];
            var this_mk = mk;
          if (m.latlng.length == 2){
            this_mk = L.marker(m.latlng, m.options).addTo(map);
            if(m.bindPopup){
                this_mk.bindPopup(m.bindPopup);
            }
            if("undefined" != m.openPopup && m.openPopup == 1){
                this_mk.openPopup();
            }
          }
        }
    }
}

se.nomarkers != 1 ? addMarkers() : console.log("Markers disabled");

function log(e,m){
    console.log(e + ': ' + m);
}

//circles (we should be able to generalise/abstract this to cover markers and circles!)
function addCircles(){

    if ( "undefined" != se.map.circles){
        for (var ck in se.map.circles){
            var c = se.map.circles[ck];
            var this_ck = ck;
            this_ck = L.circle(c.latlng, c.size, c.options).addTo(map);
            if(c.bindPopup){
                this_ck.bindPopup(c.bindPopup);
            }
            // openPopup must be AFTER bindPopup
            if("undefined" != c.openPopup && c.openPopup == 1){
                this_ck.openPopup();
            }
        }
    }
}

se.nocircles != 1 ? addCircles() : console.log("Circles disabled");

//water lakes (anything biggen than a line)
function addWater(){
    log('info', 'adding water');

    if ( "undefined" != se.map.water){
        for (var wk in se.map.water){
            var w = se.map.water[wk];
            var this_wk = wk;
            var popupName = wk;
            this_wk = L.polygon(w, {color: 'blue', fillOpacity: 0.6}).addTo(map);
            if(this_wk){
                this_wk.bindPopup(popupName);
            }
            // openPopup must be AFTER bindPopup
            if("undefined" != popupName && popupName.length >= 20){
                this_wk.openPopup();
            }
        }
    }
}

se.nowater != 1 ? addWater() : console.log("Water disabled");


//simple buildsings
function addBuildings(){
    // later this will check for options and points, rather than just a simple shape

    if ( "undefined" != se.map.buildings){
        for (var bk in se.map.buildings){
            var b = se.map.buildings[bk];
            var this_bk = bk;
            var popupName = bk;
            this_bk = L.polygon(b, {color: 'grey', fillOpacity: 0.9}).addTo(map);
            if(this_bk){
                this_bk.bindPopup(popupName);
            }
            // openPopup must be AFTER bindPopup
            if("undefined" != popupName && popupName.length >= 20){
                this_bk.openPopup();
            }
        }
    }
}

se.nobuildings != 1 ? addBuildings() : console.log("Buildings  disabled");






var popup = L.popup();
function onMapClick(e) {
  //  alert("You clicked the map at " + e.latlng);
    // we want this to be a function to add a marker or an additional point to a polygon
    // unless this is on an existing marker, then we offer to edit, (or add an additional one.)
 popup
    .setLatLng(e.latlng)
    .setContent("This location is at " + e.latlng.toString())
    .openOn(map);

}
map.on('click', onMapClick);

};
