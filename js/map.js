
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

//Trying to add markers, will need to modify to use data file to CreatedData
//http://bl.ocks.org/jsanz/1ebcb326e6cd2ff2eac0
//http://openlayers.org/en/v3.1.1/examples/geojson.js

var iconFeatures=[];

var iconFeature = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.transform([17.0341, 51.1912], 'EPSG:4326',     
  'EPSG:3857')),
  name: 'Null Island',
  population: 4000,
  rainfall: 500
});

var iconFeature1 = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.transform([17.0336, 51.1910], 'EPSG:4326',     
  'EPSG:3857')),
  name: 'Null Island Two',
  population: 4001,
  rainfall: 501
});

iconFeatures.push(iconFeature);
iconFeatures.push(iconFeature1);

var vectorSource = new ol.source.Vector({
  features: iconFeatures //add an array of features
});

var iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'img/green.png'
  }))
});


var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: iconStyle
});

map.addLayer(vectorLayer);


///////////////////////////////////////////////////////////////////////////////
//Add polygen

var styles = [
  /* We are using two different styles for the polygons:
   *  - The first style is for the polygons themselves.
   *  - The second style is to draw the vertices of the polygons.
   *    In a custom `geometry` function the vertices of a polygon are
   *    returned as `MultiPoint` geometry, which will be used to render
   *    the style.
   */
  new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  }),
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'orange'
      })
    }),
    geometry: function(feature) {
      // return the coordinates of the first ring of the polygon
      var coordinates = feature.getGeometry().getCoordinates()[0];
      return new ol.geom.MultiPoint(coordinates);
    }
  })
];


var source = new ol.source.GeoJSON(/** @type {olx.source.GeoJSONOptions} */ ({
  object: {
    'type': 'FeatureCollection',
    'crs': {
      'type': 'name',
      'properties': {
        'name': 'EPSG:4326'
      }
    },
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [[[1896155.41448, 6655180.73139], [1896193.94227, 6655155.20719], [1896185.81033, 6655142.44515],
              [1896149.41448, 6655166.96927], [1896155.41448, 6655180.73139]]]
        }
      },

      {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [[[ 51.1909, 17.0337], [17.0336, 51.1909],
              [17.0333, 51.1911], [17.0333, 51.1910], [17.0337, 51.1909]]]
        }
      }
    ]
  }
}));

var layer = new ol.layer.Vector({
  source: source,
  style: styles
});
	
map.addLayer(layer);	

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


	