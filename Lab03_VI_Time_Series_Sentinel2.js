// โค้ดสำหรับประกอบการอบรมเชิงปฎิบัติการ:การประเมินพื้นที่เพาะปลูกและติดตามผลผลิตด้วยเทคโนโลยีอวกาศ สำหรับผู้ประกอบการอุตสาหกรรมอ้อยและน้ำตาล
// ระหว่างวันที่ 18-19 ตุลาคม 2566
// ณ.มหาวิทยาลัยนเรศวร โดย สถานภูมิภาคเทคโนโลยีอวกาศและภูมิสารสนเทศ ภาคเหนือตอนล่าง มนเรศวร (GISTNU)

//---------------------------- LAB 3: VI Time Series -------------------------------------//
//นำเข้าค่าพิกัด Latitude and Longitude จาก Google map: พื้นที่บริเวณ อ.เก้าเลี้ยว จ.นครสวรรค์
Map.setCenter(100.09379003461787, 15.821064168852198, 14);

//เรียกใช้ shapefile พื้นที่ศึกษาด้วยการกำหนดตาม AOI
var AOI = ee.FeatureCollection("FAO/GAUL/2015/level2")
                  .filterBounds(AOI);
print(AOI, 'AOI');
Map.addLayer(AOI, {},'AOI', true, 0.5);

//เรียกใช้ภาพดาวเทียม Sentinel-2 พร้อมกรองข้อมูลทั้งช่วงเวลา ขอบเขตพื้นที่ตาม AOI และกรองเมฆ
var S2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
          .filterBounds(AOI)
          .filterDate('2022-01-01', '2022-12-31') 
          .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',20); //เลือกภาพที่มีเมฆน้อยกว่า 20%

//แสดงรายละเอียดข้อมูลของภาพดาวเทียมผ่าน Console
print('Sentinel-2 ImageCollection', S2);
print('Sentinel-2 Image Size', S2.size());

/*
//การผสมสีภาพ ทั้งสีจริงและสีเท็จ เพื่อแสดงบนแผนที่
var Vis = {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000,};
Map.addLayer(S2, Vis, 'Sentinel-2 Image', false);
*/

//-------------------------------- Vegetation Index (VI) -----------------------------------//
//การคำนวณดัชนี NDVI
var getNDVI = function(image) {
  var NDVI = image.normalizedDifference(['B8', 'B4']).rename('NDVI'); //(NIR-RED)/(NIR+RED); NIR:B8 & RED:B4
  return image.addBands(NDVI);
};

var datandvi = S2.map(getNDVI);
print('Print ndvi' ,datandvi);

var ndvi_mean = datandvi.select('NDVI').reduce(ee.Reducer.mean());
print('NDVI mean', ndvi_mean);

var ndviClip = ndvi_mean.clip(AOI);
print('NDVI Clip Image', ndviClip);

var ndvi_vis = { 
  min: 0, 
  max: 1, 
  palette:[
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718','74A901', '66A000', '529400', '3E8601', 
    '207401', '056201','004C00', '023B01', '012E01', '011D01', '011301'
    ]
};

Map.addLayer(ndviClip, ndvi_vis, 'NDVI',false);

//การคำนวณดัชนี EVI
var getEVI = function(image) {
  var EVI = image.expression(
    '2.5 * (NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1)',
    {
      'NIR': image.select('B8'),  // Near-infrared band
      'RED': image.select('B4'),  // Red band
      'BLUE': image.select('B2')  // Blue band
    })
    .rename('EVI'); // Rename the band to EVI
  return image.addBands(EVI); // Add EVI as a new band to the image
};

// Map the getEVI function over the ImageCollection
var dataevi = S2.map(getEVI);
print('Print evi' ,dataevi);

var evi_mean = dataevi.select('EVI').reduce(ee.Reducer.mean());
print('EVI mean', evi_mean);

var eviClip = evi_mean.clip(AOI);
print('EVI Clip Image', eviClip);

var evi_vis = { 
  min: 0, 
  max: 5, 
  palette:[
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718','74A901', '66A000', '529400', '3E8601', 
    '207401', '056201','004C00', '023B01', '012E01', '011D01', '011301'
    ]
};
Map.addLayer(eviClip, evi_vis, 'EVI',false);

//-------------------------------- VI Time Series -----------------------------------//
//ค่าดัชนี NDVI
var chart_ndvi = ui.Chart.image
  .series({
    imageCollection: datandvi.select('NDVI'),  
    region: AOI,
    reducer: ee.Reducer.mean(),
    scale: 15,
    xProperty: 'system:time_start'
  })
  .setOptions({
    title: 'NDVI Time Series',
    vAxis: { title: 'NDVI value' },
    hAxis: { title: 'Date' },
    series: { 0: { color: '#161616' , pointSize: 2} }
  });
  
print('NDVI Chart:', chart_ndvi);

//ค่าดัชนี EVI
var chart_evi = ui.Chart.image
  .series({
    imageCollection: dataevi.select('EVI'),
    region: AOI,
    reducer: ee.Reducer.mean(),
    scale: 15,
    xProperty: 'system:time_start'
  })
  .setOptions({
    title: 'EVI Time Series',
    vAxis: { title: 'EVI value' },
    hAxis: { title: 'Date' },
    series: { 0: { color: '#161616' , pointSize: 2} }
  });
  
print('EVI Chart:', chart_evi);

//การส่งออกข้อมูลไปยัง Google Drive
Export.image.toDrive({
  image: ndviClip,
  description: 'NDVI',
  folder: 'Exported_Images',
  fileNamePrefix: 'NDVI_TimeSeries',
  scale: 20,
  region: AOI,
  crs: 'EPSG:4326'
});
