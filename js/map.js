function onload(mapApp, mapConfig) {
    let map = new mapApp(mapConfig)
    let layer = map.addImageryLayer({
        url: 'http://172.18.230.221:8090/iserver/services/map-ugcv5-szbasemap/rest/maps/szbasemap',
    })
    layer.alpha = 0.5
    map.addScene('http://172.18.230.221:8090/iserver/services/3D-dianxin/rest/realspace').then(function (layers) {
        // let layer = map.scene.layers.find('fengguan@dianxin');
        // console.log(layer)
        // layer.setQueryParameter({
        //     url: 'http://172.18.230.221:8090/iserver/services/data-dianxin/rest/data',
        //     dataSourceName: 'dianxin',
        //     dataSetName: '风管',
        //     isMerge : false
        // })
        // layer.datasetInfo().then(function (e) {
        //     console.log('dianxin', e)
        // })
    })
    map.addTerrainLayer({
        url: 'http://172.18.230.221:8090/iserver/services/3D-shenzhen-dem/rest/realspace/datas/shenzhen@dem'
    })
    // map.addS3MTilesLayerByScp({
    //     name: 'test',
    //     url: 'http://172.18.230.221:8090/iserver/services/3D-dianxin/rest/realspace/datas/changguimoxing@dianxin/config',
    // }).then(function (layer) {
    //     console.log(layer)
    // })

    map.viewer.flyTo(layer, { duration: 0 });

    map.addMapEventListener('LEFT_CLICK', function (e) {
        console.log('position', e.position)
        console.log(map.cartesianToWGS84BLH(e.position))
    })

    // let handlerDis = map.createMeasureHandler('Area', function (result) {
    //     console.log(result)
    // }, function (isActive) {
    //     console.log(isActive)
    // })
    // handlerDis.activate()

    // let handlerDraw = map.createDrawHandler('Polygon', function (result) {
    //     console.log(result)
    // }, function (isActive) {
    //     console.log(isActive)
    // })
    // handlerDraw.activate()


    let handlerClip = map.createPolygonClipHandler(map.tile3DLayerArray)
    handlerClip.activate()

    // map.viewer.pickEvent.addEventListener(function (feature) {
    //     console.log(feature)
    // });
    console.log(map.imageryLayers)
    console.log(map.tile3DLayers)
}


// let viewer = new Cesium.Viewer('cesiumContainer'); //Viewer是用于构建应用程序的基础部件
// let { scene } = viewer
// scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
// let imageryLayers = viewer.imageryLayers; //获取将在地球上渲染的影像图层集合
// let imageryProvider = new Cesium.SuperMapImageryProvider({ //提供影像切片
//     url: "http://172.18.230.221:8090/iserver/services/map-ugcv5-szbasemap/rest/maps/szbasemap" //影像服务地址
// });
// let layer = imageryLayers.addImageryProvider(imageryProvider); //通过给定的影像服务提供者新建图层，将其添加至图层集合中。
// let promise = scene.open('http://172.18.230.221:8090/iserver/services/3D-dianxin/rest/realspace');
// Cesium.when(promise, function (layers) {
//     cosnole.log(layers)
// })
// viewer.flyTo(layer);
// //console.log(scene.camera.position);
// // scene.camera.setView({
// //   // destination: new Cesium.Cartesian3(101589.99370064773, 42541.86517832661, 2000.0)
// //   destination: new Cesium.Cartesian3(6377018.188097951,117550.78738300702,21270.649876164487)
// // });
// let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
// let result = {}
// handler.setInputAction(function (movement) {
//     let position = scene.pickPosition(movement.position);
//     console.log(movement.position)
//     console.log(position)
//     Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position, result);
//     let cartographic = Cesium.Cartographic.fromCartesian(position);
//     console.log('result', result)
//     console.log('cartographic', cartographic)
//     // Cesium.SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, movement.position, result)
// }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
// // scene.camera.changed.addEventListener(function () {
// //   console.log(scene.camera.position)
// // })
// // console.log(scene.camera.position);