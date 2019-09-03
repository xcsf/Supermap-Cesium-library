define(['pubsub'], function (pubsub) {
    console.log('Handler')
    let handlerDis, handlerSection, handlerArea, handlerDig;
    function initTool() {
        cancelDistanceMeasure()
        cancelAreaMeasure()
        cancelSection()
        cancelDig()
        imageryShow()
    }
    function distanceMeasure() {
        initTool()
        handlerDis = map.createMeasureHandler('Distance', function (result) {
            // console.log(result)
        }, function (isActive) {
            if (!isActive) {
            }
            // console.log(isActive)
        })
        handlerDis.activate()
    }
    function cancelDistanceMeasure() {
        if (handlerDis) {
            handlerDis.deactivate()
            handlerDis.clear()
        }
    }
    function areaMeasure() {
        initTool()
        handlerArea = map.createMeasureHandler('Area', function (result) {
            // console.log(result)
        }, function (isActive) {
            if (!isActive) {
            }
            // console.log(isActive)
        })
        handlerArea.activate()
    }
    function cancelAreaMeasure() {
        if (handlerArea) {
            console.log('cancelAreaMeasure')
            handlerArea.deactivate()
            handlerArea.clear()
        }
    }
    function section() {
        initTool()
        handlerSection = map.createPolygonClipHandler(map.tile3DLayerArray, 'CLIP_OUTSIDE', function (active) {
            !active && imageryHide()
        })
        handlerSection.activate()
    }
    function cancelSection() {
        if (handlerSection) {
            handlerSection.deactivate()
            handlerSection.clear()
            map.tile3DLayerArray.map((layer) => {
                layer.clearModifyRegions();
            })
        }
    }
    function dig() {
        initTool()
        handlerDig = map.createPolygonClipHandler(map.tile3DLayerArray, 'CLIP_INSIDE', function (active) {
            !active && imageryHide()
        })
        handlerDig.activate()
    }
    function cancelDig() {
        if (handlerDig) {
            handlerDig.deactivate()
            handlerDig.clear()
            map.tile3DLayerArray.map((layer) => {
                layer.clearModifyRegions();
            })
        }
    }
    function tag() {
        initTool()
        let o = map.getCameraView()
        pubsub.postMessage('tag', o);
    }
    /**
     * 相机不能去地下。。迷之bug
     * 所以不能globe=false 
     * 隐藏 哥伦布视图下 globe 
     * map.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 0);
     * map.scene.globe.globeAlpha = 0;
     */
    function imageryHide() {
        console.log('imageryHide')
        //移除地形
        let layer = map.imageryLayers.get(0)
        layer && (layer.alpha = 0)
        map.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
        map.scene.terrainProvider.isCreateSkirt = false; // 关闭裙边
        map.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 0);
        map.scene.globe.globeAlpha = 0;
    }
    function imageryHideForGlobe() {
        map.viewer.scene.globe.show = false
        map.viewer.scene.undergroundMode = true; //设置开启地下场景
        map.viewer.scene.terrainProvider.isCreateSkirt = false; // 关闭裙边
        map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = -1000;//设置相机最小缩放距离,距离地表-1000米
    }
    function imageryShowForGlobe() {
        map.viewer.scene.globe.show = true
        map.viewer.scene.undergroundMode = false; //设置开启地下场景
        map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;//设置相机最小缩放距离,距离地表-1000米
    }
    function imageryShow() {
        map.addTerrainLayer({
            url: GIS_SERVER_URL + '/3D-shenzhen-dem/rest/realspace/datas/shenzhen@dem' //高程
        })
        let layer = map.imageryLayers.get(0)
        layer && (layer.alpha = 1)
        map.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 1);
        map.scene.globe.globeAlpha = 1;

    }
    function globeOpacity(alpha) {
        map.viewer.scene.globe.globeAlpha = parseFloat(alpha)
        let layer = map.imageryLayers.get(0)
        layer && (layer.alpha = parseFloat(alpha))
    }
    function flyToXY(coordinate) {
        coordinate.z = 400
        map.flyToProjectCoordinate(coordinate);
    }
    let lastDatasources = []
    function showS3MDataSource(datasources) {
        lastDatasources.forEach((item) => {
            if (!datasources.includes(item)) {
                map.hideTile3DLayers(map.findLayersBydatasource(item))
            }
        })
        datasources.map(function (datasource) {
            map.showTile3DLayers(map.findLayersBydatasource(datasource))
        })
        lastDatasources = datasources;
    }
    function flyToTag(o) {
        map.camera.setView(o)
    }
    pubsub.subscribe('distance', distanceMeasure)
    pubsub.subscribe('canceldistance', cancelDistanceMeasure)
    pubsub.subscribe('area', areaMeasure)
    pubsub.subscribe('cancelarea', cancelAreaMeasure)
    pubsub.subscribe('section', section)
    pubsub.subscribe('cancelsection', cancelSection)
    pubsub.subscribe('dig', dig)
    pubsub.subscribe('canceldig', cancelDig)
    pubsub.subscribe('cancel', initTool)
    pubsub.subscribe('tag', tag)
    pubsub.subscribe('imageryhide', imageryHide)
    pubsub.subscribe('imageryshow', imageryShow)
    pubsub.subscribe('fly2xy', flyToXY)
    pubsub.subscribe('fly2tag', flyToTag)
    pubsub.subscribe('tile3dshow', showS3MDataSource)
})