
var pixelProjection = new ol.proj.Projection({
  code: 'pixel',
  units: 'pixels',
  extent: [0, 0, 958, 1688] //[minX, minY, maxX, maxY]
});



//Style for marker with node is in low battery
var redNodeStyle = [
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: '#FF0000'
      })
    })
  })
];

//Style for marker with node is not in low battery
var greenNodeStyle = [
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: '#3CB371'
      })
    })
  })
];


//GPS location nodes work here
var nodeVector = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection : map.getView().getProjection(),
    url: 'js/node.json'
  }),
  name: 'node',
  style: greenNodeStyle
});

//We add GPS location nodes by default, since default view is map.
map.addLayer(nodeVector);


//Pixel location nodes work here, these nodes will be added when we switch to image view.
// Parse features from file
var nodePxVector = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    url: 'js/node-px.json'
  }),
  projection : map.getView().getProjection(),
  name: 'nodePx'
});
