define(['pubsub'], function (pubsub) {
    let tooltip;
    let handlerDis, handlerSection, handlerArea, handlerDig, handlerExtract, handlerClip;
    //指示是否为手动取消Extract工具
    let isInitExtractTool = false
    function initTool() {
        cancelDistanceMeasure()
        cancelAreaMeasure()
        cancelSection()
        cancelDig()
        // cancelExtract()
        cancelClipWithSeal()
        // imageryShow()
        // imageryShowForGlobe();
    }
    function distanceMeasure() {
        initTool()
        handlerDis = map.createMeasureHandler('Distance', function (result) {
            // console.log(result)
        }, function (active) {
            active ? (allowedClick = false):(allowedClick = true)
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
        }, function (active) {
            active ? (allowedClick = false):(allowedClick = true)
            // console.log(isActive)
        })
        handlerArea.activate()
    }
    function cancelAreaMeasure() {
        if (handlerArea) {
            // console.log('cancelAreaMeasure')
            handlerArea.deactivate()
            handlerArea.clear()
        }
    }
    function section() {
        initTool()
        handlerSection = map.createPolygonClipHandler(map.tile3DLayerArray, 'CLIP_OUTSIDE', function (active) {
            // !active && imageryHideForGlobe()
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
            // !active && imageryHideForGlobe()
            active ? (allowedClick = false):(allowedClick = true)
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
    function extract() {
        initTool()
        handlerExtract = map.createPolygonClipHandler(map.tile3DLayerArray, 'CLIP_OUTSIDE', function (active) {
            //右键结束区域绘制时进入
            if (!active && !isInitExtractTool && handlerExtract.polyline) {
                let { radius, center } = handlerExtract.polyline._boundingVolumeWC
                var heading = Cesium.Math.toRadians(50.0);
                var pitch = Cesium.Math.toRadians(-20.0);
                var range = radius * 3;
                map.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range))
                imageryHideForGlobe()
            }
            active ? (allowedClick = false):(allowedClick = true)
            isInitExtractTool = false
        })
        handlerExtract.activate()
    }
    function cancelExtract() {
        console.log('cancelExtract')
        if (handlerExtract) {
            isInitExtractTool = true
            //也会触发isactive = false
            handlerExtract.clear()
            map.tile3DLayerArray.map((layer) => {
                layer.clearModifyRegions();
            })
            // handlerExtract.deactivate()
            map.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
        }
    }

    //裁剪封边
    function clipWithSeal() {

        initTool();
        //tooltip = createTooltip(document.body);
        let polygonArray = [];
        let regions = [];
        handlerClip = map.createDrawHandler('Polygon', function (result) {
            let { positions } = result.object
            positions.map((item) => {
                let { B, L, H } = map.cartesianToWGS84BLH(item);
                polygonArray.push(L, B, H);
                regions.push({ x: L, y: B, z: H });
            })
            map.tile3DLayerArray.map((layer) => {
                if (layer.name.indexOf("桃源居") > -1 || layer.name.indexOf("地质体") > -1) {
                    //debugger
                    layer.clipPlaneColor = new Cesium.Color(1, 100, 0, 0.2);
                    //设置裁剪封边
                    layer.setCustomClipPlane(positions[0], positions[1], positions[2], 1);
                }
            });
            //tooltip.setVisible(false);
            handlerClip.polygon.show = false;
        }, function (active) {
            !active && imageryHideForGlobe()

            if (active == true) {
                map.viewer.enableCursorStyle = false;
                map.viewer._element.style.cursor = '';
            } else {
                map.viewer.enableCursorStyle = true;
            }
        })

        // handlerClip.movingEvt.addEventListener(function(windowPosition) {
        //     if(handlerClip.isDrawing) {
        //         tooltip.showAt(windowPosition, '<p>点击确定多边形中间点</p><p>绘制三点即可</p><p>右键单击结束绘制</p>');
        //     } else {
        //         tooltip.showAt(windowPosition, '<p>点击绘制第一个点</p>');
        //     }
        // });

        handlerClip.activate()

    }
    function cancelClipWithSeal() {

        if (handlerClip) {
            handlerClip.deactivate();
            handlerClip.clear();
            map.tile3DLayerArray.map((layer) => {
                layer.clearCustomClipBox(); //清除裁剪结果
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
    function imageryShow() {
        map.addTerrainLayer({
            url: GIS_SERVER_URL + '/3D-shenzhen-dem/rest/realspace/datas/shenzhen@dem' //高程
        })
        let layer = map.imageryLayers.get(0)
        layer && (layer.alpha = 1)
        map.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 1);
        map.scene.globe.globeAlpha = 1;

    }
    function imageryHideForGlobe() {
        map.viewer.scene.globe.show = false
        map.viewer.scene.undergroundMode = true; //设置开启地下场景
        map.viewer.scene.terrainProvider.isCreateSkirt = false; // 关闭裙边
        map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = -1000;//设置相机最小缩放距离,距离地表-1000米
        map.viewer.entities.show = false;
    }
    function imageryShowForGlobe() {
        map.viewer.scene.globe.show = true
        map.viewer.scene.undergroundMode = false; //设置开启地下场景
        map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;//设置相机最小缩放距离,距离地表-1000米
        map.viewer.entities.show = true;
    }
    function imageVisible(visible) {
        //底图开关： 0:当前为影像图; 1:当前底图为实景图
        if (currentBaseMap == 0) {
            if (visible) {
                imageryShowForGlobe();
            }
            else {
                imageryHideForGlobe();
            }
        }
        else {
            tippingModel(visible); //实景
        }
    }
    //黄木岗实体模型控制
    function tippingModel(visible) {

        if (currentMidasLayer.length > 0) {
            currentMidasLayer.forEach((lyr) => {
                lyr.visible = visible;
            });
        }
    }
    function globeOpacity(alpha) {
        map.viewer.scene.globe.globeAlpha = parseFloat(alpha)
        let layer = map.imageryLayers.get(0)
        layer && (layer.alpha = parseFloat(alpha))
    }
    function flyToXY(coordinate) {
        coordinate.z = 400
        map.flyToProjectCoordinate(coordinate, { duration: 1 });
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
    function ctrlLeft(key) {
        console.log(key)
    }
    function shiftLeft(key) {
        console.log(key)
    }


    pubsub.subscribe('distance', distanceMeasure)
    pubsub.subscribe('canceldistance', cancelDistanceMeasure)
    pubsub.subscribe('area', areaMeasure)
    pubsub.subscribe('cancelarea', cancelAreaMeasure)
    pubsub.subscribe('section', section)
    pubsub.subscribe('cancelsection', cancelSection)
    pubsub.subscribe('dig', dig)
    pubsub.subscribe('canceldig', cancelDig)
    pubsub.subscribe('extract', extract)
    pubsub.subscribe('cancelextract', cancelExtract)
    pubsub.subscribe('cancel', initTool)
    pubsub.subscribe('tag', tag)
    pubsub.subscribe('imageryhide', imageryHideForGlobe)
    pubsub.subscribe('imageryshow', imageryShowForGlobe)
    pubsub.subscribe('imageVisible', imageVisible)
    pubsub.subscribe('fly2xy', flyToXY)
    pubsub.subscribe('fly2tag', flyToTag)
    pubsub.subscribe('tile3dshow', showS3MDataSource)
    pubsub.subscribe('globeopacity', globeOpacity)

    pubsub.subscribe('ctrlhandle', ctrlLeft)
    pubsub.subscribe('shifthandle', shiftLeft)

    pubsub.subscribe('clipwithseal', clipWithSeal)


    return {
        initTool,
        imageVisible,
        flyToXY
    }

})