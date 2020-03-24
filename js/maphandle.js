define(['pubsub'], function (pubsub) {
    let measureMouseMoveHandle, handlerDis, handlerSection, handlerArea, handlerDig, handlerExtract, handlerClip;
    //指示是否为手动(cancelExtract)取消Extract工具
    let isInitExtractTool = false
    function initTool() {
        cancelDistanceMeasure()
        cancelAreaMeasure()
        // cancelSection()
        // cancelDig()
        // cancelExtract()
        // cancelClipWithSeal()
        // imageryShow()
        // imageryShowForGlobe();
    }
    function distanceMeasure() {
        // initTool()
        let tempPtNum = 1
        let tempEntity
        handlerDis = map.createMeasureHandler('Distance', function (result, handler) {
            let { distance, positions } = result
            let dis = Number(distance);
            let res = '距离:' + (dis > 1000 ? (dis / 1000).toFixed(2) + 'km' : dis.toFixed(2) + 'm');
            handler.disLabel.text = res;
            //正在测量
            if (tempPtNum < positions.length) {
                console.log("记录", result)
                tempEntity = new Cesium.Entity({
                    id: "measureLabel" + tempPtNum,
                    position: positions[tempPtNum],
                    label: { //文字标签
                        text: tempPtNum === 1 ? "起点" : res,
                        font: '100 20px SimSun',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: new Cesium.Color(1, 1, 1, 1),
                        showBackground: true,
                        backgroundColor: new Cesium.Color(0.14901960784313725, 0.14901960784313725, 0.14901960784313725, 0.85),
                        backgroundPadding: new Cesium.Cartesian2(7, 5),
                        //outlineWidth: 1,
                        outlineColor: new Cesium.Color(0, 0, 1, 1),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                        pixelOffset: new Cesium.Cartesian2(15, 0),   //偏移量
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        heightReference: Cesium.HeightReference.NONE
                    }
                })
                map.addEntityToDataSource("measureLabel", tempEntity)
                tempPtNum++
            }
            //右键结束
            if (tempPtNum > positions.length) {
                map.addEntityToDataSource("measureLabel", new Cesium.Entity({
                    id: "measureLabel_end",
                    position: positions[tempPtNum - 2],
                    label: { //文字标签
                        text: "X",
                        font: '100 25px SimSun',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.RED,
                        showBackground: true,
                        backgroundColor: Cesium.Color.AQUA,
                        // backgroundPadding: new Cesium.Cartesian2(7, 5),
                        outlineWidth: 2,
                        outlineColor: new Cesium.Color(1, 1, 1, 1),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                        pixelOffset: new Cesium.Cartesian2(0, -25),   //偏移量
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        heightReference: Cesium.HeightReference.NONE
                    }
                }))
                handler.disLabel.text = "";
                map.addClickEventToDataSource("measureLabel", function (e) {
                    if (e.id.id === "measureLabel_end") {
                        pubsub.postMessage('cancelDistanceMeasure');
                    }
                })
            }
            // console.log(result)
        }, function (active) {
            // active ? (allowedClick = false) : (allowedClick = true)
            if (!active) {
                allowedClick = true
                map.viewer._element.style.cursor = 'default'
                if (measureMouseMoveHandle) {
                    measureMouseMoveHandle.destroy()
                    measureMouseMoveHandle = null
                }
                map.tooltip.setVisible(false);
            } else {
                map.viewer._element.style.cursor = 'crosshair'
                allowedClick = false
            }
        })

        measureMouseMoveHandle = map.addCanvasEventListener('MOUSE_MOVE', onMeasureMouseMove)
        handlerDis.activate()
        function onMeasureMouseMove(e) {
            if (handlerDis.isDrawing) {
                map.tooltip.showAt(e.startPosition, '<p>右键单击结束绘制</p>');
            } else {
                map.tooltip.showAt(e.startPosition, '<p>点击开始测量</p>');
            }
        }
    }
    function cancelDistanceMeasure() {
        console.log("cancelDistanceMeasure")
        if (handlerDis) {
            handlerDis.deactivate()
            handlerDis.clear()
            setTimeout(() => {
                map.viewer.dataSources.remove(map.getDataSourcesByName("measureLabel")[0], true)
            }, 0);
        }
    }
    function areaMeasure() {
        // initTool()
        let tempPtNum = 2
        handlerArea = map.createMeasureHandler('Area', function (result) {
            let { area, positions } = result
            if (tempPtNum < positions.length) {
                tempPtNum++
            }
            //右键结束
            if (tempPtNum > positions.length) {
                console.log(tempPtNum)
                map.addEntityToDataSource("areaLabel", new Cesium.Entity({
                    id: "areaLabel_end",
                    position: positions[tempPtNum - 2],
                    label: { //文字标签
                        text: "X",
                        font: '100 25px SimSun',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.RED,
                        showBackground: true,
                        backgroundColor: Cesium.Color.AQUA,
                        // backgroundPadding: new Cesium.Cartesian2(7, 5),
                        outlineWidth: 2,
                        outlineColor: new Cesium.Color(1, 1, 1, 1),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
                        pixelOffset: new Cesium.Cartesian2(0, -25),   //偏移量
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        heightReference: Cesium.HeightReference.NONE
                    }
                }))
                map.addClickEventToDataSource("areaLabel", function (e) {
                    if (e.id.id === "areaLabel_end") {
                        pubsub.postMessage('cancelAreaMeasure');
                    }
                })
            }
            // console.log(result)
        }, function (active) {
            // active ? (allowedClick = false) : (allowedClick = true)
            // console.log(isActive)
            if (!active) {
                allowedClick = true
                map.viewer._element.style.cursor = 'default'
            } else {
                map.viewer._element.style.cursor = 'crosshair'
                allowedClick = false
            }
        })
        handlerArea.activate()
    }
    function cancelAreaMeasure() {
        if (handlerArea) {
            // console.log('cancelAreaMeasure')
            handlerArea.deactivate()
            handlerArea.clear()
            setTimeout(() => {
                map.viewer.dataSources.remove(map.getDataSourcesByName("areaLabel")[0], true)
            }, 0);
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
            if (!active) {
                allowedClick = true
                map.viewer._element.style.cursor = 'default'
                map.tooltip.setVisible(false);
            } else {
                map.viewer._element.style.cursor = 'crosshair'
                allowedClick = false
            }
            // active ? (allowedClick = false) : (allowedClick = true)
        })
        handlerDig.movingEvt.addEventListener(function (windowPosition) {
            if (handlerDig.isDrawing) {
                map.tooltip.showAt(windowPosition, '<p>右键单击结束绘制</p>');
            } else {
                map.tooltip.showAt(windowPosition, '<p>点击绘制第一个点</p>');
            }
        });
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
            if (!active) {
                if (!isInitExtractTool && handlerExtract.polyline) {
                    //右键结束区域绘制时进入
                    let { radius, center } = handlerExtract.polyline._boundingVolumeWC
                    var heading = Cesium.Math.toRadians(50.0);
                    var pitch = Cesium.Math.toRadians(-20.0);
                    var range = radius * 3;
                    map.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range))
                    imageryHideForGlobe()
                }
                allowedClick = true
                map.tooltip.setVisible(false);
                map.viewer._element.style.cursor = 'default'
            } else {
                map.viewer._element.style.cursor = 'crosshair'
                allowedClick = false
            }
            // active ? (allowedClick = false) : (allowedClick = true)
            isInitExtractTool = false
        })
        handlerExtract.movingEvt.addEventListener(function (windowPosition) {
            if (handlerExtract.isDrawing) {
                map.tooltip.showAt(windowPosition, '<p>右键单击结束绘制</p>');
            } else {
                map.tooltip.showAt(windowPosition, '<p>点击绘制第一个点</p>');
            }
        });
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
            imageryShowForGlobe()
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
        console.log('imageryHideForGlobe')
        map.viewer.scene.globe.show = false
        map.viewer.scene.undergroundMode = true; //设置开启地下场景
        map.viewer.scene.terrainProvider.isCreateSkirt = false; // 关闭裙边
        map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = -1000;//设置相机最小缩放距离,距离地表-1000米
        map.viewer.entities.show = false;
    }
    function imageryShowForGlobe() {
        //当透明度为0时不要show  globe  防止点击不到地下
        if (map.scene.globe.globeAlpha != 0) {
            map.viewer.scene.globe.show = true
        }
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
        map.scene.globe.globeAlpha = 1 - parseFloat(alpha);
        map.scene.globe.startAlpha = 1 - parseFloat(alpha);
        if (alpha === 1) {
            map.viewer.scene.globe.show = false
            map.viewer.scene.undergroundMode = true; //设置开启地下场景
            map.viewer.scene.terrainProvider.isCreateSkirt = false; // 关闭裙边
            map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = -1000;//设置相机最小缩放距离,距离地表-1000米
            // map.viewer.entities.show = false;
        } else {
            map.viewer.scene.globe.show = true
            map.viewer.scene.undergroundMode = false; //设置开启地下场景
            map.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;//设置相机最小缩放距离,距离地表-1000米
            map.viewer.entities.show = true;
        }
        //let layer = map.imageryLayers.get(0)
        //layer && (layer.alpha = parseFloat(alpha))
    }
    function sceneryOpacity(alpha) {
        let a = map.tile3DLayerArray.map(layer => {
            if (layer.groupname == "midas") {
                layer.style3D.fillForeColor.alpha = 1 - alpha;
            }
        })
    }
    function geobodyOpacity(alpha) {
        map.tile3DLayerArray.map(layer => {
            if (layer.groupname == "geobody") {
                layer.style3D.fillForeColor.alpha = 1 - alpha;
            }
        })
    }
    function flyToXY(coordinate) {
        coordinate.z = 400
        map.flyToProjectCoordinate(coordinate, { duration: 1 });
    }
    function flyToPoints(coordinates) {
        let cartesians = coordinates.map(coordinate => {
            coordinate.z = 400
            return map.projectCoordinateToCartesian(coordinate)
        })
        rectangle = Cesium.Rectangle.fromCartesianArray(cartesians)
        map.camera.flyTo({ destination: rectangle, duration: 1 })
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

    //设整高度
    let lastH = 0
    function modelHeight(h) {
        //调整场布或站点整体高度
        let height = h - lastH
        map.tile3DLayerArray.forEach(lyrItem => {
            let cartographic = Cesium.Cartographic.fromCartesian(lyrItem._position);
            let p = map.scene.mapProjection.project(cartographic);
            lyrItem.style3D.bottomAltitude = p.z + height;
            lyrItem.refresh();
        });
        lastH = h
    }
    function hawkeyeVisable(visible) {
        let hawkeyeMapDOM = document.getElementById('hawkeyeMap')
        if (!visible) {
            hawkeyeMapDOM.style.display = "none"
        } else {
            hawkeyeMapDOM.style.display = ""
        }

        // hawkeyeMapDOM.parentNode.removeChild(hawkeyeMapDOM);
    }
    //pubsub.subscribe('modelheight', modelHeight);
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
    pubsub.subscribe('sceneryopacity', sceneryOpacity)
    pubsub.subscribe('geobodyopacity', geobodyOpacity)
    pubsub.subscribe('hawkeyeVisable', hawkeyeVisable)
    pubsub.subscribe('ctrlhandle', ctrlLeft)
    pubsub.subscribe('shifthandle', shiftLeft)
    pubsub.subscribe('fly2points', flyToPoints)
    pubsub.subscribe('clipwithseal', clipWithSeal)


    return {
        initTool,
        imageVisible,
        flyToXY,
        hawkeyeVisable
    }

})