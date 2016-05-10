/*
 * 2016 04 18
 *熊川宇
 * */
(function (window, undefined) {
    var select = (function () {
        //模拟jquery搜索引擎sizzle的基本选择器和后代选择器功能
        //首先准备好要用到的工具方法
        //1.能力检测方法(可以防止恶意代码嵌入)
        var hasClass = (function () {
            var isBlean = !!document.getElementsByClassName;
            if (isBlean && typeof document.getElementsByClassName === 'function') {
                var div1 = document.createElement('div');
                var div2 = document.createElement('div');
                div2.className = 'c';
                div1.appendChild(div2);
                return div1.getElementsByClassName('c')[0] === div2;
            }
            return false;
        })();
        //    一旦有恶意代码嵌入比如：
        //    document.getElementsByClassName = 123;
        //    测试代码区
        //    if (isClass) {
        //        alert(1);
        //    } else {
        //        alert(2);
        //    }
        //浏览器就会告诉你不支持document.getClassName

        //2.书写自己的myPush功能(用于解决IE不兼容apply方法时候用到)
        var myPush = function (arr1, arr2) {
            var i = arr1.length;
            var j = 0;
            while (arr1[i++] = arr2[j++]);
            arr1.length = i - 1;
        }
        //代码测试区
        //a1 = [1, 2, 3, 4];
        //    a2 = [5, 6, 7, 8];
        //    myPush(a1, a2);
        //    console.log(a1);

        //3.myTrim方法(用于去掉字符串两端的空格)
        var myTrim = function (str) {
            if (typeof str == 'string') {
                if (String.prototype.trim) {
                    return str.trim();
                } else {
                    return str.replace(/^\s+|\s+$/g, '');
                }
            } else {
                return str;
            }
        }
        //代码测试
        //    var str = '    s    ';
        //    var str = myTrim(str);
        //    console.log('|' + str + '|');

        //4.each方法(用于处理循环得.也是jquery里隐式迭代的核心代码)
        var each = function (arr, fn) {
            for (var i = 0; i < arr.length; i++) {
                if (fn.call(arr[i], i, arr[i]) === false) {
                    break;
                }
            }
        }
        //代码测试
        //    var arr = [1, 5, 8, 10];
        //    each(arr, function (i, v) {//这里的i和v对应的就是each里的i和arr[i];
        //        console.log(v);
        //    })

        //第二步写基本选择器功能.(带上下文context参数)
        var getId = function (id, results) {//由于要达到统一，所以每一个都用results
            results = results || [];
            var node = document.getElementById(id);
            if (node) {
                results.push(node);
                return results;
            } else {
                return null;
            }
        }
        var getTag = function (tag, context, results) {
            //context用于实现上下文中找元素。比如：$('div','.c'),这个选择器就是在找到所有.c下面的所有div
            results = results || [];
            context = context || document;
            try {
                results.push.apply(results, context.getElementsByTagName(tag));
            } catch (e) {
                myPush(results, context.getElementsByTagName(tag));
            }
            return results;
        }
        var getClass = function (className, context, results) {
            results = results || [];
            context = context || document;
            if (hasClass) {
                results.push.apply(results, context.getElementsByClassName(className));
            } else {
                var all = getTag('*');
                each(all, function (i, v) {
                    if ((' ' + v.className + ' ').indexOf(' ' + className + ' ') != -1) {
                        results.push(v);
                    }
                })
            }
            return results;
        }

        //第三步实现对第二步方法的整合处理
        var get = function (selector, context, results) {
            results = results || [];
            context = context || document;
            var r = /^(?:#([\w-]+)|\.([\w-]+)|([\w]+)|(\*))$/;
            var m = r.exec(selector);
            if (m) {
                if (context.nodeType) {
                    context = [context];
                }
                if (typeof context === 'string') {
                    context = get(context);
                }
                each(context, function (i, v) {
                    if (m[1]) {
                        results = getId(m[1], results);
                    } else if (m[2]) {
                        results = getClass(m[2], v, results);
                    } else if (m[3]) {
                        results = getTag(m[3], v, results);
                    } else {
                        results = getTag(m[4], v, results);
                    }
                })
            }
            return results;
        }

        //第四步实现混合选择器功能select
        var select = function (selector, context, results) {
            results = results || [];
            selector = myTrim(selector);
            var newselector = selector.split(',');
            each(newselector, function (i1, v1) {
                v1 = myTrim(v1);
                var list = v1.split(' ');
                var c = context;//必须写在这里,因为一旦出现多个数组context就会发生改变
                for (var j = 0; j < list.length; j++) {
                    if (list[j] === '') {
                        continue;
                    }
                    c = get(list[j], c);
                }
                results.push.apply(results, c);
            })
            return results;
        }

        return select;
    })();
//实现buildNode功能($('<div></div>')这种情况);
    var buildNode = function (str) {
        var div = document.createElement('div');
        if (typeof str == 'string') {
            div.innerHTML = str;
            var arr = [];
            for (var i = 0; i < div.childNodes.length; i++) {
                arr.push(div.childNodes[i]);
            }
        }
        return arr;
    }
//用于兼容IE获取样式的方法
    var getAtrr = function (obj, atrr) {
        if (obj.currentStyle) {
            return obj.currentStyle[atrr];
        } else {
            return window.getComputedStyle(obj, null)[atrr];
        }
    }
//用于处理处理前后空格的trim方法
    var myTrim = function (str) {
        if (typeof str == 'string') {
            if (String.prototype.trim) {
                return str.trim();
            } else {
                return str.replace(/^\s+|\s+$/g, '');
            }
        } else {
            return str;
        }
    }

//框架的搭建
//用于优化框架的一些代码
    var arr = [];
    push = arr.push;
    slice = arr.slice;
    concat = arr.concat;

//框架雏形的搭建
    var Xcy = function (selector) {
        return new Xcy.prototype.frame(selector);
    }
    Xcy.fn = Xcy.prototype = {
        constructor: Xcy,
        selector: null,
        length: 0,
        frame: function (selector) {
            //排除undifide null...
            if (!selector) return this;
            //string类型的时候
            if (Xcy.isString(selector)) {
                if (selector.charAt(0) == '<') {
                    Xcy.push.apply(this, Xcy.buildNode(selector));
                } else {
                    Xcy.push.apply(this, Xcy.select(selector));
                    this.selector = selector;
                }
                return this;
            }
            //如果是dom对象
            else if (Xcy.isDom(selector)) {
                this[0] = selector;
                this.length = 0;
                return this;
            }
            //如果是Xcy对象
            else if (Xcy.isXcy(selector)) {
                return selector;
            }
            //如果是dom数组
            else if (Xcy.isLikeArray(selector)) {
                Xcy.push.apply(this, selector);
                return this;
            }
            //如果是Function
            else if (Xcy.isFunction(selector)) {
                //用于处理window.onload多种情况
                var oldFunc = window.onload;
                if (typeof oldFunc === 'function') {
                    window.onload = function m() {
                        oldFunc();
                        selector();
                    };
                } else {
                    window.onload = selector;
                }
            }
        }
    }
    Xcy.prototype.frame.prototype = Xcy.fn;
//实现extend方法，用于代码的维护管理
    Xcy.extend = Xcy.fn.extend = function (obj) {
        for (var i in obj) {
            this[i] = obj[i];
        }
    }

//静态方法区
//1.工具方法名字管理区
    Xcy.extend({
        push: push,
        select: select,
        buildNode: buildNode,
        trim: myTrim,
        getAtrr: getAtrr
    });
//2.类型判断区
    Xcy.extend({
        isLikeArray: function (obj) {
            return obj && obj.length && obj.length >= 0;
        },
        isString: function (obj) {
            return typeof obj === 'string';
        },
        isFunction: function (obj) {
            return typeof obj === 'function';
        },
        isDom: function (obj) {
            return !!obj.nodeType;
        },
        isXcy: function (obj) {
            return 'selector' in obj;
        }
    });
//3.实现常用的工具区
    Xcy.extend({
        each: function (arr, fn) {
            var isArr = Xcy.isLikeArray(arr);
            var i;
            if (isArr) {
                for (i = 0; i < arr.length; i++) {
                    if (fn.call(arr[i], i, arr[i]) === false) {
                        return false;
                    }
                }
            } else {
                for (i in arr) {
                    if (fn.call(arr[i], i, arr[i]) === false) {
                        return false;
                    }
                }
            }
        }
    });
//4.用于优化dom超作的一些静态方法
    Xcy.extend({
        firstChild: function (dom) {
            for (var i = 0; i < dom.childNodes.length; i++) {
                if (dom.childNodes[i].nodeType == 1) {
                    return dom.childNodes[i];
                }
            }
        },
        nextSibling: function (dom) {
            var newDom = dom;
            while (newDom = newDom.nextSibling) {
                if (newDom.nodeType == 1) {
                    return newDom;
                }
            }
        },
        nextAll: function (dom) {
            var newDom = dom;
            var arr = [];
            while (newDom = newDom.nextSibling) {
                if (newDom.nodeType == 1) {
                    arr.push(newDom);
                }
            }
            return arr;
        }

    });
//5.事件操控区块
    Xcy.extend({
        Event: function (e) {
            this.event = e;
        },
    });
    Xcy.Event.prototype = {
        constructor: Xcy.Event,
        stopPropagation: function () {
            this.Event.stopPropagation();
            this.Event.cancelBubble = true;
        }
    };
//6.属性内容处理模块
    Xcy.extend({
        getInnerText: function (dom) {
            var arr = [];
            if (dom.innerText !== undefined) {
                return dom.innerText;
            } else {
                getTextNode(dom, arr);
                return arr.join('');
            }
            //处理兼容IE获取innerText的方法
            function getTextNode(dom, arr) {
                var i;
                var l = dom.childNodes.length;
                var node;
                for (i = 0; i < l; i++) {
                    node = dom.childNodes[i];
                    if (node.nodeType === 3) {
                        arr.push(node.nodeValue);
                    } else {
                        getTextNode(node, arr);
                    }
                }
            }
        },
        setInnerText: function (dom, str) {
            if ('innerText' in dom) {
                dom.innerText = str;
            } else {
                dom.innerHTML = '';//先清除,再填入。要不然以前的也会存在
                dom.appendChild(document.createTextNode(str));
            }
        }
    });
//7.动画区块
    Xcy.extend({
        move: {
            linear: function (x, t, b, c, d) {

                return t * (c - b) / d;
            },
            easing: function (x, t, b, c, d) {

                //加速度
                var a = 2 * (c - b) / (d * d);//(通过高中公式X = v0*t + 1/2*a*t*t 推导来的 )
                var v_0 = a * d;
                return v_0 * t - a * t * t / 2;
            },
            easeInQuad: function (x, t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOutQuad: function (x, t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOutQuad: function (x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            },
            easeInCubic: function (x, t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOutCubic: function (x, t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOutCubic: function (x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            },
            easeInQuart: function (x, t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOutQuart: function (x, t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOutQuart: function (x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            },
            easeInQuint: function (x, t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOutQuint: function (x, t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOutQuint: function (x, t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            },
            easeInSine: function (x, t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOutSine: function (x, t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOutSine: function (x, t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            },
            easeInExpo: function (x, t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOutExpo: function (x, t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOutExpo: function (x, t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            },
            easeInCirc: function (x, t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOutCirc: function (x, t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOutCirc: function (x, t, b, c, d) {
                if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            },
            easeInElastic: function (x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOutElastic: function (x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
            },
            easeInOutElastic: function (x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            },
            easeInBack: function (x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOutBack: function (x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOutBack: function (x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },

            easeOutBounce: function (x, t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            }
        },    //这一块的公式都是用的老外研究好的公式
        kv: {
            'top': 'offsetTop',
            'left': 'offsetLeft',
            'width': 'offsetWidth',
            'height': 'offsetHeight',
        },   //用于统一k值
        getLocTarget: function (obj, target) {
            var o = {};
            for (var k in target) {
                o[k] = obj[Xcy.kv[k]];
            }
            return o;
        },   //用于获得当前的位置
        getallTarget: function (obj, target) {
            var o = {};
            for (var k in target) {
                //刚开始的位置 dom[kv[k]]
                //target[k]代表目标地
                o[k] = parseInt(target[k]) - obj[Xcy.kv[k]];
            }
            return o;
        },    //用于得到要走的距离
        moveTo: function (x, time, locTarget, target, dur, type) {
            var o = {};
            for (var k in target) {
                o[k] = Xcy.move[type](x, time, locTarget[k], parseInt(target[k]), dur);
            }
            return o;
        },    //移动的距离
        setStyle: function (obj, locTarget, leave, target) {
            for (var k in target) {
                obj.style[k] = leave[k] + locTarget[k] + 'px';
            }
        }    //让每一个物体移动到相应的位置
    });

//实例方法区
//1.影视迭代区块
    Xcy.fn.extend({
        each: function (callback) {
            Xcy.each(this, callback);
            return this;
        }
    });
//2.对dom操作的区块
    Xcy.fn.extend({
        appendTo: function (selector) {
            var self = this;
            var objs = Xcy(selector);
            var arr = [];
            var node;
            Xcy.each(objs, function (i1, v1) {
                var that = this;
                Xcy.each(self, function (i2, v2) {
                    node = i1 == objs.length - 1 ? this : this.cloneNode(true);
                    arr.push(node);
                    that.appendChild(node);
                });
            });
            return Xcy(arr);
        },
        append: function (selector) {
            Xcy(selector).appendTo(this);
            return this;
        },
        prependTo: function (selector) {
            var objs = Xcy(selector);
            var self = this;
            var node;
            var arr = [];
            for (var i = 0; i < objs.length; i++) {
                for (var j = self.length - 1; j >= 0; j--) {
                    node = i == objs.length - 1 ? self[j] : self[j].cloneNode(true);
                    arr.push(node)
                    objs[i].insertBefore(node, Xcy.firstChild(objs[i]));
                }
            }
            return Xcy(arr);
        },
        prepend: function (selector) {
            Xcy(selector).prependTo(this);
            return this;
        },
        prependToS: function (selector) {
            var objs = Xcy(selector);
            var self = this;
            var node;
            var arr = [];
            Xcy.each(objs, function (i1, v1) {
                var that = this;
                Xcy.each(self, function (i2, v2) {
                    node = i1 == objs.length - 1 ? this : this.cloneNode(true);
                    arr.push(node);
                    that.insertBefore(node, Xcy.firstChild(that));
                });
            });
            return Xcy(arr);
        },
        remove: function () {
            var arr = [];
            this.each(function (i, v) {
                arr.push.apply(this, this.parentNode.removeChild(this));
            })
            return Xcy(arr);
        },
        next: function () {
            var arr = [];
            Xcy.each(this, function (i, v) {
                arr.push(Xcy.nextSibling(v));
            });
            return Xcy(arr);
        },
        nextAll: function () {
            var arr = [];
            Xcy.each(this, function (i, v) {
                arr.push(Xcy.nextAll(v));
            });
            return Xcy(arr);
        }
    });
//3.关键事件区块
    Xcy.fn.extend({
        on: function (type, callback) {
            Xcy.each(this, function () {
                if (this.addEventListener) {
                    this.addEventListener(type, function (e) {
                        e = e || window.event;
                        callback.call(this, new Xcy.Event(e));
                    })
                } else {
                    this.attachEvent('on' + type, function (e) {
                        e = e || window.event;
                        callback.call(this, new Xcy.Event(e));
                    })
                }
            });
            return this;
        },
        off: function (type, callback) {
            Xcy.each(this, function () {
                if (this.removeEventListener) {
                    this.removeEventListener(type, function (e) {
                        e = e || window.event;
                        callback.call(this, new Xcy.Event(e));
                    })
                } else {
                    this.detachEvent('on' + type, function (e) {
                        e = e || window.event;
                        callback.call(this, new Xcy.Event(e));
                    })
                }
            });
            return this;
        }
    });
//通过on事件遍历其他事件
    Xcy.each(("click,mouseover,mouseout," +
    "mousemove,mousedown," +
    "mouseup,keydown,keyup" ).split(','), function (i, v) {
        Xcy.fn[v] = function (callback) {
            return this.on(v, callback);
        }
    });
//专有的事件toggle,hover
    Xcy.fn.extend({
        toggle: function () {
            var i = 0;
            var args = arguments;
            return this.click(function (e) {
                args[i++ % args.length].call(this, e);
            });
        },
        hover: function (fn1, fn2) {
            if (fn2) {
                return this.mouseover(fn1).mouseout(fn2);
            } else {
                return this.mouseover(fn1);
            }
        }
    });
//4.样式区块区
    Xcy.fn.extend({
        css: function (className, classValue) {
            // 如果传入对象，获取多个样式的情况
            if (typeof className === 'object') {
                this.each(function () {
                    for (var k in className) {
                        this.style[k] = className[k];
                    }
                })
                return this;
            }
            //设置一种样式，和获取样式的情况
            else if (classValue === undefined) {
//                return window.getComputedStyle(this[0], null)[className];
                return Xcy.getAtrr(this[0], className);
            } else {
                return this.each(function () {
                    this.style[className] = classValue;
                });
            }
        }
    });
//5.class区块
    Xcy.fn.extend({
        hasClass: function (cName) {
            var has = false;
            var list = Xcy(this[0].className.split(' '))
            list.each(function (i, v) {
                if (v == cName) {
                    has = true;
                    return false;
                }
            });
            return has;
        },
        hasClassJQ: function (cName) {//自己改进版的和JQ功能相似的hasclass功能
            var has = false;

            this.each(function (i, v) {
                var list = v.className.split(' ');
                var i;
                for (i = 0; i < list.length; i++) {
                    if (list[i] == cName) {
                        has = true;
                    }
                }
            });
            return has;
        },
        addClass: function (cName) {
            this.each(function () {
                className = this.className;
                className += ' ' + cName;
                this.className = Xcy.trim(className);
                return this;
            })
        },
        removeClass: function (cName) {
            return this.each(function (i, v) {
//                1.第一种方法
                var list = v.className.split(' ');
                var className;
                var arr = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == cName) {
                        continue;
                    }
                    arr.push(list[i]);
                }
                className = arr.join(' ');
                this.className = className;
//                2.第二种方法
//                var className = ' ' + this.className + ' ';
//                this.className = Xcy.trim(className.replace(' ' + cName + ' ', ' '));
            });
        },
        toggleClassT: function (cName) {//老师的,有问题
            if (this.hasClass(cName)) {
                return this.removeClass(cName);
            } else {
                return this.addClass(cName);
            }
        },
        toggleClass: function (cName) {//自己的改进
            var str;
            var arr = [];
            this.each(function (i, v) {
                var arr = [];
                var flag = false;
                var list = v.className.split(' ');
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == '') {
                        continue;
                    }
                    if (list[i] == cName) {
                        flag = true;
                        continue;
                    }
                    arr.push(list[i]);
                }
                if (flag) {
                    str = arr.join(' ');
                    v.className = Xcy.trim(str);
                } else {
                    this.className += ' ' + cName;
                }
            })
        }
    });
//6.属性模块
    Xcy.fn.extend({
        attr: function (attName, attValue) {
            if (attValue) {
                this.each(function () {
                    return this[attName] = attValue;
                });
            } else {
                return this[0][attName];
            }
        },
        val: function (value) {
            if (value == undefined) {
                return this[0].value;
            } else {
                this.each(function () {
                    return this.value = value;
                })
            }
        },
        html: function (html) {
            if (html) {
                this.each(function () {
                    this.innerHTML = html;
                });
            } else {
                return this[0].innerHTML
            }
            return this;
        },
        text: function (text) {
            if (text == undefined) {
                return Xcy.getInnerText(this[0]);
            } else {
                return this.each(function () {
                    Xcy.setInnerText(this, text);
                })
            }
        }
    });
//7.动画区块
    Xcy.fn.extend({
        animate: function (obj, target, dur, type, callBack) {
            //自己加了一块区域
            if (arguments.length == 2 && typeof target != 'object') {
                play = function () {
                    var step = 5;
                    var leader = obj.offsetLeft;
                    if (Math.abs(target - leader) >= Math.abs(step)) {
                        obj.style.left = leader + step + 'px';
                    } else {
                        clearInterval(timer);
                    }
                }
            }
            else {
                //获取初始位置
                var locTarget = Xcy.getLocTarget(obj, target);
                //总位置
                var allTarget = Xcy.getallTarget(obj, target);
                //刚开始的时间
                var locTime = +new Date;
                //定时器的名字
                var timer;
                //定义定时器每秒的速度
                var step = 25;
                var play = function () {
                    var leave;
                    //当前的时间
                    var currentTime = +new Date;
                    //时间差
                    var time = currentTime - locTime;
                    //判断跳出条件
                    if (time >= dur) {
                        leave = allTarget;
                        clearInterval(timer);
                        if (callBack) {
                            callBack();
                        }
                    } else {
                        leave = Xcy.moveTo(null, time, locTarget, target, dur, type);
                    }
                    Xcy.setStyle(obj, locTarget, leave, target);
                }
            }

            play();
            timer = setInterval(play, step);
            return this;
        }
    });

    window.X = window.Xcy = Xcy;
})(window)
