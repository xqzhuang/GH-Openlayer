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
var styles = [
  //Style for Polygon
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#4682B4',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  }),
  
  //Style for marker
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: '#4682B4'
      })
    })
  })
];

// Parse features from file
var vector = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection : 'EPSG:900913',
    url: 'js/geoJson.json'
  }),
  style: styles
});

map.addLayer(vector);

//////////////////////////////////////////////////////////////////////////////
//Popup
//Use this great popup API
var popup = new ol.Overlay.Popup();
map.addOverlay(popup);

// Display popup on click
map.on('click', function(evt) {
  // get the closest feature to the event point
  var feature = map.forEachFeatureAtPixel(evt.pixel,
	  function(feature, layer) {
		return feature;
	  });

	  
  // show the popup
  if (feature) {
	var geometry = feature.getGeometry();
	
	if(geometry.getType() == 'Point') { //only popup when we click markers
			 
		var coord = geometry.getCoordinates();
		var prettyCoord = ol.coordinate.toStringHDMS(ol.proj.transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326'), 2);
		
		popup.show(coord, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');		//TODO: here to put the information of the node in the popup
	} else if(geometry.getType() == 'Polygon') {
		
		//TODO: After clicking Polygon, it will show a popup which links to the specific room
		var coord = geometry.getFirstCoordinate();		
		popup.show(coord, '<a href="#">This is a polygon</a>');		//TODO: here to put the information of the node in the popup	
	}	
  } 
});

// change mouse cursor when over marker
$(map.getViewport()).on('mousemove', function(evt) {
  var pixel = map.getEventPixel(evt.originalEvent);
  var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
	return feature;
  });

  if (feature) {
	document.getElementById('map').style.cursor = 'pointer';
	
  } else {
	document.getElementById('map').style.cursor = '';
  }     
});

///////////////////////////////////////////////////////////////////
//trying to use interaction, seems easy
// Interaction working on "pointermove"
var selectPointerMove = new ol.interaction.Select({
  condition: ol.events.condition.pointerMove
});

var changeInteraction = function() {
  if (selectPointerMove !== null) {
    map.removeInteraction(selectPointerMove);

  }
  
  	map.addInteraction(selectPointerMove);
};

//Fire interaction
changeInteraction();


	