/**
 * @author: 贺翔
 * @file: 弹窗
 */
define([
    "jquery",
    "lodash",
    "doT!./dialog",
    "doT!./toast",
    "doT!./load"
], function ($,
             _,
             dialogTpl,
             toastTpl,
             loadTpl) {
    "use strict";

    var exports = {};
    var classPrefix = "";

    /**
     * 弹窗按钮点击回调
     * @callback dialogButtonCallback
     * @param {number} btnIndex 按钮的index
     * @param {number} dialogIndex 弹窗的index
     * @param {Event} event jQuery包装过的event对象
     * @desc this指向弹窗dom对象
     */

    /**
     * 弹窗类型
     * @type {number}
     */

    var zIndex = 999910;
    var maskOpacity = 0.2;
    var $window = $(window);
    var windowSize = {
        width: $window.outerWidth(),
        height: $window.outerHeight()
    };
    var dialogIndex = 0;
    var aniTime = 150;
    $window.on("resize", _.debounce(function () {
        windowSize = {
            width: $window.outerWidth(),
            height: $window.outerHeight()
        };
        $("[data-controls=" + classPrefix + "dialog]").each(function () {
            autoPos($(this));
        })
    }, 16));

    /**
     * 显示弹窗
     * @param {jQuery} $dialog 弹窗jQuery dom对象
     * @param opt
     */
    function showDialog($dialog, opt) {
        var attr = {
            "data-index": dialogIndex
        };
        attr["data-" + classPrefix + "dialog"] = "mask";
        var $mask = $("<div></div>").addClass("mask")
            .attr(attr);
        var pos;
        $dialog.css({
            "top": -99999,
            "opacity": 0,
            "z-index": zIndex
        });
        $dialog.appendTo("body");

        if (opt.area) {
            setSize($dialog, opt.area);
        }
        pos = getDialogPos($dialog);

        $dialog.css({
            "left": pos.x,
            "top": pos.y
        });

        if (opt.shade !== false) {
            $mask.css("opacity", 0);
            $mask.appendTo("body");

            if (opt.type === 3) {
                $mask.css("background", "#fff");
                $mask.fadeTo(aniTime, 0.5, "linear");
            } else {
                $mask.fadeTo(aniTime, maskOpacity, "linear");
            }
        }
        $dialog.fadeTo(aniTime, 1, "linear");
        zIndex++;
        dialogIndex++;
    }

    /**
     * 获取按钮
     * @param {Object} opt 选项
     * @return {string[]} 按钮字符串数组
     */
    function getDialogBtn(opt) {
        var buttons = [];
        var btnIndex = 0;
        if (opt.btn && opt.btn.length > 0) {
            var defaultBtn = [];
            // 第一个是确定按钮
            var $okBtn = $("<a></a>")
                .addClass("btn btn-lg btn-primary")
                .prop({
                    "href": "javascript:;"
                })
                .attr({
                    "data-action": "ok",
                    "data-index": btnIndex++
                })
                .text(opt.btn.shift());
            defaultBtn.push($okBtn.prop("outerHTML"));
            // 第二个是取消按钮
            if (opt.btn.length > 0) {
                var $cancelBtn = $("<a></a>")
                    .addClass("btn btn-lg btn-default")
                    .prop({
                        "href": "javascript:;"
                    })
                    .attr({
                        "data-action": "cancel",
                        "data-index": btnIndex++
                    })
                    .text(opt.btn.shift());
                defaultBtn.push($cancelBtn.prop("outerHTML"));
            }
            // 后面还有的话就循环
            if (opt.btn.length > 0) {
                var $otherBtn = $("<a></a>")
                    .addClass("btn btn-lg btn-default")
                    .prop({
                        "href": "javascript:;"
                    })
                    .attr({
                        "data-index": btnIndex++
                    });
                opt.btn.forEach(function (item) {
                    defaultBtn.push($otherBtn.text(item).prop("outerHTML"))
                })
            }
            buttons = buttons.concat(defaultBtn);
        }

        if (opt.customBtn && opt.customBtn.length > 0) {
            opt.customBtn.forEach(function (item) {
                buttons.push($(item).attr("data-index", btnIndex++).prop("outerHTML"));
            });
        }

        if (buttons.length > 0) {
            return buttons;
        }
    }

    // 获取弹窗位置
    function getDialogPos($dialog) {
        var pos = {
            x: 0,
            y: 0
        };

        pos.y = (windowSize.height / 2) - ($dialog.outerHeight() / 2);
        pos.x = (windowSize.width / 2) - ($dialog.outerWidth() / 2);

        return pos;
    }

    /**
     * 设置iframe地址，加载完成后显示出来
     * @param {jQuery} $dialog 弹窗的jQ对象
     * @param {string} url iframe地址
     * @param {number} index 弹窗index
     */
    function setIframeDialogOpt($dialog, url, index) {
        var $body = $dialog.find("." + classPrefix + "dialog-body");
        var $iframe = $("<iframe scrolling='auto' allowtransparency='true' frameborder='0'></iframe>");
        $iframe.prop("src", url);
        $iframe.prop("name", "dialog-" + index);
        $iframe.addClass("hidden");
        $body.prepend($iframe);
        $body.addClass("loading");
        $iframe.on("load", function () {
            $body.removeClass("loading");
            $iframe.removeClass("hidden");
        })
    }

    // 给弹窗设置大小
    function setSize($dialog, area) {
        var width, height;
        var dialogHeadHeight = $("[data-query='heading']", $dialog).outerHeight();
        if (!_.isUndefined(area[0])) {
            if (area[0] < windowSize.width) {
                width = area[0];
            } else {
                width = windowSize.width;
            }
        }
        if (!_.isUndefined(area[1])) {
            if ((area[1] + dialogHeadHeight) < windowSize.height) {
                height = area[1];
            } else {
                height = windowSize.height - dialogHeadHeight - 50;
            }
        }
        $dialog.find("[data-query='body']").css({
            width: width,
            height: height
        });
        $dialog.css("width", width);
    }

    function autoPos($dialog) {
        var pos = getDialogPos($dialog);
        $dialog.css({
            left: pos.x,
            top: pos.y
        })
    }

    /**
     * 打开一个弹窗
     * @param {Object}   opt 设置项
     * @param {number}   [opt.type=0] 层类型 0:信息框,1:iframe层,2:toast层,3:加载层,type为2时仅支持content和icon参数
     * @param {string}   [opt.title=提示信息] 标题
     * @param {string}   [opt.content=""] type为0/2:显示的内容，1是url,
     * @param {number}   [opt.icon] 图标，1:成功,2:失败，可按需在scss中定制
     * @param {number[]} [opt.area] body的大小,0是宽1是高
     * @param {number}   [opt.closeBtn=1] 右上角关闭按钮，0是不显示
     * @param {string[]} [opt.btn] 按钮
     * @param {string[]} [opt.customBtn] html字符串按钮
     * @param {dialogButtonCallback} [opt.btnCB] 按钮回调
     * @param {dialogButtonCallback} [opt.ok] 确定按钮
     * @param {dialogButtonCallback} [opt.cancel] 取消按钮
     * @param {boolean} [opt.shade=true] 是否显示遮罩,信息框和iframe层默认显示
     * @param {number}  [opt.time] 几秒后自动关闭
     * @return {number} 弹窗index
     */
    exports.open = function (opt) {
        var option = {
            type: 0,
            title: "提示信息",
            content: "",
            closeBtn: 1,
            dialogIndex: dialogIndex,
            buttons: getDialogBtn(opt)
        };
        var renderOption = _.merge(option, opt);
        var $dialog;// 弹窗窗体
        var index = dialogIndex;

        // 获取弹窗窗体
        switch (renderOption.type) {
        case 2: {
            $dialog = $(toastTpl(renderOption));
            break;
        }
        case 3: {
            $dialog = $(loadTpl(renderOption));
            break;
        }
        default: {
            $dialog = $(dialogTpl(renderOption));
        }
        }

        if (renderOption.type == 1) {
            setIframeDialogOpt($dialog, renderOption.content, index);
        }

        showDialog($dialog, opt);
        // 关闭弹窗按钮
        $dialog.on("click", "[data-action=close]", function (e) {
            exports.close($(e.currentTarget).closest("[data-controls=" + classPrefix + "dialog]").data("index"));
        });
        if (renderOption.type == 0) {
            var buttonsCB = renderOption.btnCB;
            // 按钮们
            $dialog.on("click", "[data-action=buttons]>*", function (e) {
                var $curTar = $(e.currentTarget);
                var btnAction = $curTar.data("action");
                var btnIndex = $curTar.data("index");
                var dialogIndex = $curTar.closest("[data-controls=" + classPrefix + "dialog]").data("index");
                switch (btnAction) {
                case"ok": {
                    opt.ok ? opt.ok.call($dialog[0], btnIndex, dialogIndex, e) : false;
                    break;
                }
                case"cancel": {
                    opt.cancel ? opt.cancel.call($dialog[0], btnIndex, dialogIndex, e) : false;
                    break;
                }
                }
                if (buttonsCB) {
                    var callbackReturnVal = buttonsCB.call($dialog[0], btnIndex, dialogIndex, e);
                    if (_.isUndefined(callbackReturnVal) || callbackReturnVal !== false) {
                        exports.close(dialogIndex);
                    }
                } else {
                    exports.close(dialogIndex);
                }
            });
        }

        if (_.isNumber(renderOption.time)) {
            setTimeout(function () {
                exports.close(index);
            }, renderOption.time);
        }
        return index;
    };
    /**
     * 提示窗口
     * @param {String} content="" 提示信息内容
     * @param {Object} option 参考open方法参数说明
     * @param {Function} callback 按钮回调
     * @return {Number} 弹窗index
     */
    exports.alert = function (content, option, callback) {
        var defaultOpt = {
            type: 0,
            content: content,
            btn: ["确定"],
            btnCB: callback
        };
        return exports.open(_.merge(defaultOpt, option));
    };
    /**
     * 打开带一个确定和取消按钮的弹窗
     * @param {String} content
     * @param {Object} option
     * @param {Function} ok
     * @param {Function} cancel
     * @return {Number} 弹窗index
     */
    exports.confirm = function (content, option, ok, cancel) {
        var defaultOpt = {
            type: 0,
            content: content,
            btn: ["确定", "取消"],
            ok: ok,
            cancel: cancel
        };
        return exports.open(_.merge(defaultOpt, option));
    };
    /**
     * 打开一个iframe窗口
     * @param {String} url
     * @param {String} title
     * @param {Number[]} area
     * @param {Object} option
     * @return {Number} 弹窗的index
     */
    exports.iframe = function (url, title, area, option) {
        return exports.open(_.merge({
            type: 1,
            content: url,
            title: title,
            area: area
        }, option));
    };
    /**
     * toast窗口，默认无遮罩，3秒后自动关闭
     * @param {String} msg 显示的信息
     * @param {Object} opt 设置项
     */
    exports.toast = function (msg, opt) {
        return exports.open(_.merge({
            type: 2,
            content: msg,
            shade: false,
            time: 3000
        }, opt));
    };
    /**
     * 全屏load层
     * @param {string} [msg] 显示的信息
     */
    exports.load = function (msg) {
        return exports.open({
            type: 3,
            content: msg,
            shade: true
        })
    };
    /**
     * 给弹窗设置宽高
     * @param {Number} index 弹窗index
     * @param {Number[]} area 0是宽，1是高，不设置不填
     */
    exports.setSize = function (index, area) {
        var $dialog = $("[data-controls='" + classPrefix + "dialog']").filter("[data-index='" + index + "']");
        if ($dialog.length) {
            setSize($dialog, area);
            autoPos($dialog);
        }
    };
    /**
     * 关闭当前window的弹窗
     * @param {Number} [index] 弹窗的index，如不填则关闭所有弹窗
     */
    exports.close = function (index) {
        this.closeOfWindow(window, index);
    };
    /**
     * 关闭某个 window 里的弹窗
     * @param {Window} window 要关闭的弹窗所在的Window
     * @param {number} [index] 弹窗的index，如果不传则关闭所有目标window的弹窗
     * @example
     * //从iframe弹窗中关闭自身
     * var index = dialog.getFrameIndex(window.name);
     * dialog.closeOfWindow(window.parent,index);
     */
    exports.closeOfWindow = function (window, index) {
        var $dialog = $("[data-controls=" + classPrefix + "dialog]", window.document);
        var $mask = $("[data-" + classPrefix + "dialog=mask]", window.document);
        if (_.isNumber(index)) {
            $mask.filter("[data-index=" + index + "]").fadeTo(aniTime, 0, function () {
                this.remove()
            });
            $dialog.filter("[data-index=" + index + "]").fadeTo(aniTime, 0, function () {
                this.remove()
            });
        } else {
            $mask.fadeTo(aniTime, 0, function () {
                this.remove()
            });
            $dialog.each(function () {
                $(this).fadeTo(aniTime, 0, function () {
                    this.remove()
                });
            })
        }
    };
    /**
     * 获取iframe弹窗的index，用于关闭弹窗，仅支持在子iframe中使用
     * @param {string} iframeName iframe所在window对象的name属性
     * @return {number} iframe所在弹窗的index
     * @example dialog.getFrameIndex(window.name)
     */
    exports.getFrameIndex = function (iframeName) {
        return parseInt(/\d+$/.exec(iframeName)[0]);
    };
    /**
     * 获取弹窗的内容
     * @param {number} index 弹窗的index
     * @return {jQuery} 弹窗内容
     */
    exports.getContent = function (index) {
        return $("[data-controls=" + classPrefix + "dialog][data-index='" + index + "']");
    };

    return exports;
});