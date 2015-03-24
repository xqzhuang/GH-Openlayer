
//Mouse position 
var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  //className: 'custom-mouse-position',
  //target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});

///////////////////////////////////////////////////////////////////////////////////////////////////
//Map initialazation

var map = new ol.Map({
  //shift + drag to zoom in and rotate, so cool!
  interactions: ol.interaction.defaults().extend([
    new ol.interaction.DragRotateAndZoom()
  ]),
  
  controls: ol.control.defaults({  
    attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
      collapsible: false
    })
  }).extend([mousePositionControl]),
  

	layers: [
		new ol.layer.Tile({
			title: 'Water color',
			type: 'base',
			visible: false,
			source: new ol.source.Stamen({
				layer: 'watercolor'
			})
		}),
		
		new ol.layer.Tile({
			title: 'OSM',
			type: 'base',
			visible: true,
			source: new ol.source.OSM()
		}),
		
		new ol.layer.Tile({
			title: 'UMP',
			type: 'base',
			visible: false,
			source: new ol.source.OSM({
			url:'http://1.tiles.ump.waw.pl/ump_tiles/${z}/${x}/${y}.png'})
		})
	],

  
	  target: 'map',
	  
	  view: new ol.View({
		center: ol.proj.transform([17.03392, 51.19099], 'EPSG:4326', 'EPSG:3857'), //Location of Green House
		zoom: 19
  })
});


///////////////////////////////////////////////////////////////////////////////////////////////////

//Below is for adding more controls in the map       
     
//Zoom
var myZoom = new ol.control.Zoom();
map.addControl(myZoom);
//Zoom is a default control, but there are some parameters you could change if you wanted:
//Check them out here: http://ol3js.org/en/master/apidoc/ol.control.Zoom.html

//ZoomSlider
var myZoomSlider = new ol.control.ZoomSlider();
map.addControl(myZoomSlider);
//The zoom slider is a nice addition to your map. It is wise to have it accompany your zoom buttons.

//map layer swicher
var layerSwitcher = new ol.control.LayerSwitcher({
	tipLabel: 'Légende' // Optional label for button
});
map.addControl(layerSwitcher);

///////////////////////////////////////////////////////////////////////////////////////////////////

// assume features.json is a FeatureCollection in EPSG:4326
var vector = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection : 'EPSG:900913',
    url: 'js/geoJson.json'
  })
});

map.addLayer(vector);

//////////////////////////////////////////////////////////////////////////////
//Popup

// Get the popup div
var element = document.getElementById('popup');

// Instance the OL popup overlay
var popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false
});
map.addOverlay(popup);

 var renderContent = function(feature){
	  var entry = feature.get('entry');
	  var view = {
		//web : entry.gsx$web.$t,
		//evento: entry.gsx$nombredelevento.$t
	  };

	  var template = "<a href={{web}}>{{evento}}</a>"

	  return Mustache.render(template, view);
};


// display popup on click
map.on('click', function(evt) {
  // get the closest feature to the event point
  var feature = map.forEachFeatureAtPixel(evt.pixel,
	  function(feature, layer) {
		return feature;
	  });
	  
  // show the popup
  if (feature) {
	var geometry = feature.getGeometry();
	var coord = geometry.getCoordinates();
	popup.setPosition(coord);
	$(element).popover('destroy');
	$(element).popover({
	  'placement': 'top',
	  'html': true,
	  'content': 'I am a node! yeeeaaahhhhhh'
	});
	$(element).popover('show');
  } else {
	$(element).popover('destroy');
  }
});

// change mouse cursor when over marker
$(map.getViewport()).on('mousemove', function(e) {
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
	return true;
  });
  if (hit) {
	document.getElementById('map').style.cursor = 'pointer';
  } else {
	document.getElementById('map').style.cursor = '';
  }
});


	