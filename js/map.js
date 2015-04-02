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
//
//Map initialazation
//
///////////////////////////////////////////////////////////////////////////////////////////////////

//TODO: Here we can define list of position
var gh = ol.proj.transform([17.0337, 51.1908], 'EPSG:4326', 'EPSG:3857');

var ghView = new ol.View({
		center: gh, //Location of Green House
		zoom: 19});

//TODO: Here allows you to add more default layers
var layerWater = new ol.layer.Tile({
			title: 'Water color',
			name: 'water',
			type: 'base',
			visible: false,
			source: new ol.source.Stamen({
				layer: 'watercolor'
			})
		});
		
var layerOSM = new ol.layer.Tile({
			title: 'OSM',
			name: 'OSM',
			type: 'base',
			visible: true,
			source: new ol.source.OSM()
		});		
		
var layerUMP = new ol.layer.Tile({
			title: 'UMP',
			name: 'UMP',
			type: 'base',
			visible: false,
			source: new ol.source.OSM({
			url:'http://1.tiles.ump.waw.pl/ump_tiles/${z}/${x}/${y}.png'})
		});
		
var defLayers = [layerWater, layerOSM, layerUMP];

		
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
  
	layers: defLayers,
	target: 'map',	  
	view: ghView
});

map.getLayerGroup().set('name', 'Root');

///////////////////////////////////////////////////////////////////////////////////////////////////
//
//Below is for adding more controls in the map       
//
///////////////////////////////////////////////////////////////////////////////////////////////////
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
//
//Load nodes and room from geoJson data files
//
///////////////////////////////////////////////////////////////////////////////////////////////////

var roomStyle = [
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
];


// Parse features from file
var roomVector = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection : map.getView().getProjection(),
    url: 'js/room.json'
  }),
  name: 'room',
  style: roomStyle
});

map.addLayer(roomVector);



///////////////////////////////////////////////////////////////////////////////////////////////////
//
//Popup and click event
//
///////////////////////////////////////////////////////////////////////////////////////////////////
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

				
		//Rotate the map if we choose one specific room
	    var currentRotation = ghView.getRotation();
		ghView.rotate(currentRotation + 0.9656183665104893, gh); //TODO: need to figure out another approach to caculate rotation
		//change zoom level
		ghView.setZoom(20);
		
						
		//TODO: After clicking Polygon, it will show a popup which links to the specific room
		//var coord = geometry.getFirstCoordinate();		
		//popup.show(coord, '<a href="#">This is a polygon.</a> Rotation is' );		//TODO: here to put the information of the node in the popup	
		
		//imageLayer.setVisible(true);
		        
	} 
  } else {
	    //imageLayer.setVisible(false);
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

///////////////////////////////////////////////////////////////////////////////////////////////////
//
//trying to use interaction, seems easy
//Mark it now, cause I didn't figure out how to seperate node and room so far.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
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




	