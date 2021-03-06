require.config({
    paths: {
        'Cesium': '../Build/Cesium/Cesium'
    },
    shim: {
        Cesium: {
            exports: 'Cesium'
        }
    }
});
if (typeof Cesium !== 'undefined') {
    console.log('Cesium undefined')
    onload(Cesium);
}else if ( typeof require === 'function' ) {
    require(['mapApp','mapConfig'], onload)
}