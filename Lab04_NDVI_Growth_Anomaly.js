// โค้ดสำหรับประกอบการอบรมเชิงปฎิบัติการ:การประเมินพื้นที่เพาะปลูกและติดตามผลผลิตด้วยเทคโนโลยีอวกาศ สำหรับผู้ประกอบการอุตสาหกรรมอ้อยและน้ำตาล
// ระหว่างวันที่ 18-19 ตุลาคม 2566
// ณ.มหาวิทยาลัยนเรศวร โดย สถานภูมิภาคเทคโนโลยีอวกาศและภูมิสารสนเทศ ภาคเหนือตอนล่าง มนเรศวร (GISTNU)

//--------------------------------- LAB 4: Growth Anomaly   -------------------------------------//
// ขั้นตอนที่ 1 นำเข้าข้อมูลแปลงตัวอย่าง
Map.addLayer(crop_aoi, { color: '#2E8B57' }, 'พื้นที่แปลงตัวอย่าง',true);
Map.centerObject(crop_aoi, 13);

// ขั้นตอนที่ 2 กำหนดตัวแปรช่วงเวลาปัจจุบันที่ที่ต้องการวิเคราะห์ค่า NDVI 
var start_time = '2023-01-01';
var end_time = '2023-10-31';

// ขั้นตอนที่ 3 ดึงภาพดาวเทียมที่ต้องการพร้อมทำการสร้างฟังก์ชันคำนวณค่า NDVI
var S2_collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(crop_aoi)
  .filterDate(start_time, end_time)
  .map(function(image) {
    var ndvi = image.normalizedDifference(['B8', 'B4']); // Calculate NDVI
    return image
          .addBands(ndvi.rename('NDVI 2023'))
          .set('month', ee.Image(image).date().get('month'));
});
print('S2 Collection with NDVI', S2_collection);


var ndviCol = S2_collection.select('NDVI 2023');

// ขั้นตอนที่ 4 สร้างลิสต์ของเดือนที่จะใช้ในการวิเคราะห์
var months = ee.List.sequence(1,12)

// ขั้นตอนที่ 5 ทำการสร้างฟังก์ชันคำนวณค่าเฉลี่ยของ NDVI ในแต่ละเดือน
function calculateMonthlyNDVI(month, ndvi_col) {
  var monthName = ee.Date.fromYMD(2000, month, 1).format('MM');
  var ndvi_month = ndvi_col
    .filter(ee.Filter.calendarRange(month, month, 'month'))
    .mean()
    .set('month', monthName);

  return ndvi_month;
}

var ndvi_monthallyears = months.map(function(month) {
  return calculateMonthlyNDVI(month, ndviCol);
});

// ขั้นตอนที่ 6 สร้างตัวแปรช่วงเวลาสำหรับสร้างเส้นอ้างอิง
var referenceStartDate = '2018-01-01';
var referenceEndDate = '2023-09-30';

// ขั้นตอนที่ 7 คํานวณค่าเฉลี่ย NDVI สําหรับรอบระยะเวลาอ้างอิง
var referenceMean = S2_collection
      .filterDate(referenceStartDate, referenceEndDate)
      .select('NDVI 2023')
      .reduce(ee.Reducer.mean());
print(referenceMean,'referenceMean');

// ขั้นตอนที่ 8 ฟังก์ชันการคํานวณความผิดปกติของ NDVI
var calculateNDVIAnomaly = function(image) {
    var ndvi = image.select('NDVI 2023');
    var anomaly = ndvi.subtract(referenceMean).rename('NDVI_Anomaly 2018-2023');
    return image.addBands(anomaly);
};
// ทำการประมวลผล NDVI anomaly สำหรับทุกภาพในคอลเลกชัน S2_collection
var collectionWithAnomaly = S2_collection.map(calculateNDVIAnomaly);
print(collectionWithAnomaly,'collectionWithAnomaly')

//นำผลการวิเคราะห์แสดงบนแผนที
var medianndvi = collectionWithAnomaly.median();
var collectionWithAnomaly_crop = medianndvi.clip(crop_aoi);
var ndviPalette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
              '74A901', '66A000', '529400', '3E8601', '207401', '056201',
              '004C00', '023B01', '012E01', '011D01', '011301'];
              
var visParams = { min: -1, max: 1, palette: ndviPalette };
// Display the clipped NDVI image on the map
    Map.addLayer(collectionWithAnomaly_crop.select('NDVI 2023'),visParams, 'NDVI',true);


// ขั้นตอนที่ 9 เรียกใช้งานฟังก์ชันที่สร้างการคำนวณ NDVI รายเดือนมาใช้กับข้อมูลผลจากการวิเคราะห์ Anomaly
var ndvi_anomaly = months.map(function(month) {
  return calculateMonthlyNDVI(month, collectionWithAnomaly);
});
print('NDVI Monthly', ndvi_monthallyears);

// ขั้นตอนที่ 10 การสร้างข้อมูลหลายช่วงเวลา
var ndvi_final = ee.ImageCollection.fromImages(ndvi_anomaly)
print('ndvi_final', ndvi_final);

// ขั้นตอนที ่11 ทำการสร้างตัวแปรสำหรับคำนวณค่า Mean max min ของ NDVI
var reducers = ee.Reducer.minMax()
  .combine({
    reducer2: ee.Reducer.mean(),
    sharedInputs: true
  });

// ขั้นตอนที่ 12 ทดลองสร้างกราฟจากข้อมูลเพื่อแสดงบน Console
var chart = ui.Chart.image.series({
    imageCollection: ndvi_final.select(['NDVI 2023','NDVI_Anomaly 2018-2023']),
    region: crop_aoi, 
    reducer: reducers, 
    scale: 500,
    xProperty: 'month'
  })
  .setChartType('LineChart')
  .setOptions({
    title: 'Phenology: Average NDVI by Month',
    vAxis: { title: 'NDVI' },
    hAxis: { title: 'Month' },
    
    series: {
    0: {lineWidth: 2, pointSize: 5, lineDashStyle: [3, 3]},  // hides the 1st series in the legend
    1: {lineWidth: 2, pointSize: 5, lineDashStyle: [3, 3]},  // hides the 3rd series in the legend
    2: {lineWidth: 2, pointSize: 5, lineDashStyle: [3, 3]},  // hides the 1st series in the legend
    3: {lineWidth: 0, visibleInLegend: false},  // hides the 3rd series in the legend
    4: {lineWidth: 2},  // hides the 1st series in the legend
    5: {lineWidth: 0, visibleInLegend: false}  // hides the 3rd series in the legend
    
  },
  
  });
  
print('chart', chart);

//--------------------------------------- ส่วนแสดงผลกราฟ ------------------------------------------//
// ขั้นตอนที่ 1 สร้างการแสดงผลโดยกำหนดแทบบาร์สำหรับแสดงข้อมูลจากการวิเคราะห์
var panel = ui.Panel();
panel.style().set('width', '400px');

// ขั้นตอนที่ 2 สร้าง Intro Label
var intro = ui.Panel([
            ui.Label({
                value: '『Growth Anomaly Information Crops』',
                style: {fontSize: '20px', fontWeight: 'bold',color: '35155D',textAlign:'center',fontFamily:'monospace'}
              }),
            ui.Label({
                value: 'กราฟแสดงข้อมูลการประเมินความอุดมสมบูรณ์ของพื้นที่ปลูกอ้อยด้วยค่าดัชนีพืชพรรณ (วิเคราะห์รายแปลง)',
                style: {fontSize: '14px',color: '512B81',textAlign:'center',fontFamily:'monospace'}
              })
]);
panel.add(intro);
ui.root.insert(0, panel);

// ขั้นตอนที่ 2 สร้างฟังก์ชันสำหรับกำหนด event เมื่อคลิกที่แปลงตัวอย่างจะแสดงข้อมูลผลการวิเคราะห์
function handleMapClick(event) {
  var plots = ee.Geometry.Point(event.lon, event.lat);
  // print(plots)
  
  var clickedFeatures = crop_aoi.filterBounds(plots);
  print('Clicked Crop AOI:', clickedFeatures);
  
  var chart = ui.Chart.image.series({
    imageCollection: ndvi_final.select(['NDVI 2023','NDVI_Anomaly 2018-2023']),
    region: clickedFeatures, 
    reducer: reducers, 
    scale: 500,
    xProperty: 'month'
  })
  .setChartType('LineChart')
  .setOptions({
    title: 'Phenology: Average NDVI by Month',
    vAxis: { title: 'NDVI' },
    hAxis: { title: 'Month' },
    
    series: {
    0: {lineWidth: 2, pointSize: 5, lineDashStyle: [3, 3]},  // hides the 1st series in the legend
    1: {lineWidth: 2, pointSize: 5, lineDashStyle: [3, 3]},  // hides the 3rd series in the legend
    2: {lineWidth: 2, pointSize: 5, lineDashStyle: [3, 3]},  // hides the 1st series in the legend
    3: {lineWidth: 0, visibleInLegend: false},  // hides the 3rd series in the legend
    4: {lineWidth: 2},  // hides the 1st series in the legend
    5: {lineWidth: 0, visibleInLegend: false}  // hides the 3rd series in the legend
    
  },
  
  });
  
  panel.widgets().set(1, chart);
  
}
Map.onClick(handleMapClick);
