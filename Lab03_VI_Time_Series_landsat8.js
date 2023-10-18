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
var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_RT_TOA")
              .filterBounds(AOI)
              .filterDate('2023-01-01', '2023-01-31')
              .sort('CLOUD_COVER'); //เรียงภาพจากเมฆน้อยไปหาเมฆมาก

//แสดงรายละเอียดข้อมูลของภาพดาวเทียมผ่าน Console
print("Landsat 8 data image", L8);
print("Landsat 8 size image", L8.size());

/*
//การผสมสีภาพ ทั้งสีจริงและสีเท็จ เพื่อแสดงบนแผนที่
var Vis = {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.4};
Map.addLayer(L8, Vis, 'Sentinel-2 Image', false);
*/

//-------------------------------- Vegetation Index (VI) -----------------------------------//
//การคำนวณดัชนี NDVI
var getNDVI = function(image) {
  var NDVI = image.normalizedDifference(['B5', 'B4']).rename('NDVI'); 
  return image.addBands(NDVI);
};

// Map the getNDVI function over the ImageCollection
var datandvi = L8.map(getNDVI);
print('Print ndvi' ,datandvi);

//หาค่ากลางของแต่ละ Pixel เพื่อนำไปทำ Time Series
var ndvi_mean = datandvi.select('NDVI').reduce(ee.Reducer.mean());
print('NDVI mean', ndvi_mean);

//การตัดภาพดาวเทียมตามขอบเขต AOI
var ndviClip = ndvi_mean.clip(AOI);
print('NDVI Clip Image', ndviClip);

//การกำหนดสีให้กับค่าดัชนีพืชพรรณ
var ndvi_vis = { 
  min: -1, 
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
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', 
    {
      'NIR': image.select('B5'),  // Near-infrared band
      'RED': image.select('B4'),  // Red band
      'BLUE': image.select('B2')  // Blue band
    })
    .rename('EVI'); // Rename the band to EVI
  return image.addBands(EVI); // Add EVI as a new band to the image
};

// Map the getEVI function over the ImageCollection
var dataevi = L8.map(getEVI);
print('Print evi' ,dataevi);

//หาค่ากลางของแต่ละ Pixel เพื่อนำไปทำ Time Series
var evi_mean = dataevi.select('EVI').reduce(ee.Reducer.mean());
print('EVI mean', evi_mean);

//การตัดภาพดาวเทียมตามขอบเขต AOI
var eviClip = evi_mean.clip(AOI);
print('EVI Clip Image', eviClip);

//การกำหนดสีให้กับค่าดัชนีพืชพรรณ
var evi_vis = { 
  min: -1, 
  max: 1, 
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
    scale: 30,
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
    scale: 30,
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
