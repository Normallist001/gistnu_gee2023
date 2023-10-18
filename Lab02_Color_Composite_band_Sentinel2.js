// โค้ดสำหรับประกอบการอบรมเชิงปฎิบัติการ:การประเมินพื้นที่เพาะปลูกและติดตามผลผลิตด้วยเทคโนโลยีอวกาศ สำหรับผู้ประกอบการอุตสาหกรรมอ้อยและน้ำตาล
// ระหว่างวันที่ 18-19 ตุลาคม 2566
// ณ.มหาวิทยาลัยนเรศวร โดย สถานภูมิภาคเทคโนโลยีอวกาศและภูมิสารสนเทศ ภาคเหนือตอนล่าง มนเรศวร (GISTNU)

//------------------------ LAB 2: Color Composite band -------------------------------------//
//นำเข้าค่าพิกัด Latitude and Longitude จาก Google map: พื้นที่บริเวณ อ.เก้าเลี้ยว จ.นครสวรรค์
Map.setCenter(100.09379003461787, 15.821064168852198, 14);

//เรียกใช้ภาพดาวเทียม Sentinel-2 พร้อมกรองข้อมูลทั้งช่วงเวลา ขอบเขตพื้นที่ตาม AOI และกรองเมฆ
var S2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
          .filterBounds(AOI)
          .filterDate('2022-01-01', '2022-12-31') 
          .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',20); //เลือกภาพที่มีเมฆน้อยกว่า 20%

//แสดงรายละเอียดข้อมูลของภาพดาวเทียมผ่าน Console
print('Sentinel-2 ImageCollection', S2);
print('Sentinel-2 Image Size', S2.size());

//การเลือกภาพที่ปลอดเมฆหรือดีที่สุด
var datafirst = S2.first();
print('First Image', datafirst);

//การกำหนดแบรนด์ให้กับข้อมูล
var bandset = datafirst.select('B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A','B9', 'B11', 'B12');
print('Bandset', bandset);

//การผสมสีภาพ ทั้งสีจริงและสีเท็จ เพื่อแสดงบนแผนที่
var Vis = {bands: ['B4', 'B3', 'B2'],min: 0, max: 3000};
Map.addLayer(bandset, Vis, 'RGB Image', false);

var Vis_false = {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000};
Map.addLayer(bandset, Vis_false, 'False Color Image', false);

var Vis_false1 = {bands: ['B8A', 'B11', 'B5'], min: 0, max: 3000};
Map.addLayer(bandset, Vis_false1, 'False Color Image 8A,11,5', false);

//การตัดภาพดาวเทียมตามขอบเขต AOI
var clipImage = bandset.clip(AOI);
print('Clip Image', clipImage);
Map.addLayer(clipImage, Vis, 'Clip Image', false);

//การส่งออกข้อมูลไปยัง Google Drive
Export.image.toDrive({
    image: clipImage,
    description: 'Composite_Data',
    folder: 'Exported_Images',
    fileNamePrefix: 'Colorcomposition_Data',
    region: AOI,
    scale: 15,
    maxPixels: 1e9,
    crs: 'EPSG:4326'
});
