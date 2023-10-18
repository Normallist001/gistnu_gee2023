// โค้ดสำหรับประกอบการอบรมเชิงปฎิบัติการ:การประเมินพื้นที่เพาะปลูกและติดตามผลผลิตด้วยเทคโนโลยีอวกาศ สำหรับผู้ประกอบการอุตสาหกรรมอ้อยและน้ำตาล
// ระหว่างวันที่ 18-19 ตุลาคม 2566
// ณ.มหาวิทยาลัยนเรศวร โดย สถานภูมิภาคเทคโนโลยีอวกาศและภูมิสารสนเทศ ภาคเหนือตอนล่าง มนเรศวร (GISTNU)

//------------------------ LAB 2: Color Composite band -------------------------------------//
//นำเข้าค่าพิกัด Latitude and Longitude จาก Google map: พื้นที่บริเวณ อ.เก้าเลี้ยว จ.นครสวรรค์
Map.setCenter(100.09379003461787, 15.821064168852198, 14);

//เรียกใช้ภาพดาวเทียม Landsat 8 พร้อมกรองข้อมูลทั้งช่วงเวลา ขอบเขตพื้นที่ตาม AOI และกรองเมฆ
var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_RT_TOA")
            .filterBounds(AOI)
            .filterDate('2022-01-01', '2022-12-31')
            .sort('CLOUD_COVERAGE'); //เรียงภาพจากเมฆน้อยไปหาเมฆมาก

//แสดงรายละเอียดข้อมูลของภาพดาวเทียมผ่าน Console
print('Landsat 8 ImageCollection', L8);
print("Landsat 8 Image Size", L8.size());

//การเลือกภาพที่ปลอดเมฆหรือดีที่สุด
var datafirst = L8.first();
print('First Image', datafirst);

//การกำหนดแบรนด์ให้กับข้อมูล
var bandset = datafirst.select('B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11');
print('Bandset', bandset);

//การผสมสีภาพ ทั้งสีจริงและสีเท็จ เพื่อแสดงบนแผนที่
var Vis = {bands: ['B4', 'B3', 'B2'], min: 0.0,max: 0.4};
Map.addLayer(bandset, Vis, 'RGB Image', false);

var Vis_false = {bands: ['B5', 'B4', 'B3'], min: 0.0, max: 0.4};
Map.addLayer(bandset, Vis_false, 'False Color Image', false);

var Vis_false = {bands: ['B5', 'B6', 'B4'], min: 0.0, max: 0.4};
Map.addLayer(bandset, Vis_false, 'False Color Image', false);

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
    scale: 30,
    maxPixels: 1e9,
    crs: 'EPSG:4326'
});
