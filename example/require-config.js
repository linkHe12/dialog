(function (global, require) {
    require.config({
        baseUrl: "/",
        paths:{
            text: "vendor/text",
            doT: "vendor/doT",
            // libs
            jquery: "http://cdn.staticfile.org/jquery/2.2.4/jquery.min",
            doTCompiler: "http://cdn.staticfile.org/dot/1.1.0/doT.min",
            lodash: "http://cdn.staticfile.org/lodash.js/3.10.1/lodash.min",
        }
    });
})(window, requirejs);