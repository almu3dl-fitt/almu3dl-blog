/*!
 * accounting.js v0.4.2, copyright 2014 Open Exchange Rates, MIT license, http://openexchangerates.github.io/accounting.js
 */
(function (p, z) {
    function q(a) {
        return !!("" === a || a && a.charCodeAt && a.substr)
    }

    function m(a) {
        return u ? u(a) : "[object Array]" === v.call(a)
    }

    function r(a) {
        return "[object Object]" === v.call(a)
    }

    function s(a, b) {
        var d, a = a || {}, b = b || {};
        for (d in b) b.hasOwnProperty(d) && null == a[d] && (a[d] = b[d]);
        return a
    }

    function j(a, b, d) {
        var c = [], e, h;
        if (!a) return c;
        if (w && a.map === w) return a.map(b, d);
        for (e = 0, h = a.length; e < h; e++) c[e] = b.call(d, a[e], e, a);
        return c
    }

    function n(a, b) {
        a = Math.round(Math.abs(a));
        return isNaN(a) ? b : a
    }

    function x(a) {
        var b = c.settings.currency.format;
        "function" === typeof a && (a = a());
        return q(a) && a.match("%v") ? {
            pos: a,
            neg: a.replace("-", "").replace("%v", "-%v"),
            zero: a
        } : !a || !a.pos || !a.pos.match("%v") ? !q(b) ? b : c.settings.currency.format = {
            pos: b,
            neg: b.replace("%v", "-%v"),
            zero: b
        } : a
    }

    var c = {
            version: "0.4.1",
            settings: {
                currency: {symbol: "$", format: "%s%v", decimal: ".", thousand: ",", precision: 2, grouping: 3},
                number: {precision: 0, grouping: 3, thousand: ",", decimal: "."}
            }
        }, w = Array.prototype.map, u = Array.isArray, v = Object.prototype.toString,
        o = c.unformat = c.parse = function (a, b) {
            if (m(a)) return j(a, function (a) {
                return o(a, b)
            });
            a = a || 0;
            if ("number" === typeof a) return a;
            var b = b || ".", c = RegExp("[^0-9-" + b + "]", ["g"]),
                c = parseFloat(("" + a).replace(/\((.*)\)/, "-$1").replace(c, "").replace(b, "."));
            return !isNaN(c) ? c : 0
        }, y = c.toFixed = function (a, b) {
            var b = n(b, c.settings.number.precision), d = Math.pow(10, b);
            return (Math.round(c.unformat(a) * d) / d).toFixed(b)
        }, t = c.formatNumber = c.format = function (a, b, d, i) {
            if (m(a)) return j(a, function (a) {
                return t(a, b, d, i)
            });
            var a = o(a), e = s(r(b) ? b : {precision: b, thousand: d, decimal: i}, c.settings.number), h = n(e.precision),
                f = 0 > a ? "-" : "", g = parseInt(y(Math.abs(a || 0), h), 10) + "", l = 3 < g.length ? g.length % 3 : 0;
            return f + (l ? g.substr(0, l) + e.thousand : "") + g.substr(l).replace(/(\d{3})(?=\d)/g, "$1" + e.thousand) + (h ? e.decimal + y(Math.abs(a), h).split(".")[1] : "")
        }, A = c.formatMoney = function (a, b, d, i, e, h) {
            if (m(a)) return j(a, function (a) {
                return A(a, b, d, i, e, h)
            });
            var a = o(a),
                f = s(r(b) ? b : {symbol: b, precision: d, thousand: i, decimal: e, format: h}, c.settings.currency),
                g = x(f.format);
            return (0 < a ? g.pos : 0 > a ? g.neg : g.zero).replace("%s", f.symbol).replace("%v", t(Math.abs(a), n(f.precision), f.thousand, f.decimal))
        };
    c.formatColumn = function (a, b, d, i, e, h) {
        if (!a) return [];
        var f = s(r(b) ? b : {symbol: b, precision: d, thousand: i, decimal: e, format: h}, c.settings.currency),
            g = x(f.format), l = g.pos.indexOf("%s") < g.pos.indexOf("%v") ? !0 : !1, k = 0, a = j(a, function (a) {
                if (m(a)) return c.formatColumn(a, f);
                a = o(a);
                a = (0 < a ? g.pos : 0 > a ? g.neg : g.zero).replace("%s", f.symbol).replace("%v", t(Math.abs(a), n(f.precision), f.thousand, f.decimal));
                if (a.length > k) k = a.length;
                return a
            });
        return j(a, function (a) {
            return q(a) && a.length < k ? l ? a.replace(f.symbol, f.symbol + Array(k - a.length + 1).join(" ")) : Array(k - a.length + 1).join(" ") + a : a
        })
    };
    if ("undefined" !== typeof exports) {
        if ("undefined" !== typeof module && module.exports) exports = module.exports = c;
        exports.accounting = c
    } else "function" === typeof define && define.amd ? define([], function () {
        return c
    }) : (c.noConflict = function (a) {
        return function () {
            p.accounting = a;
            c.noConflict = z;
            return c
        }
    }(p.accounting), p.accounting = c)
})(this);


// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

    Array.prototype.map = function (callback/*, thisArg*/) {

        var T, A, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this|
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let A be a new array created as if by the expression new Array(len)
        //    where Array is the standard built-in constructor with that name and
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal
                //     method of callback with T as the this value and argument
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}


/*!
 * BS Financial Pack
 */
jQuery(function ($) {

    "use strict";

    $('.bsfp-widgets-list.bsfp-align-marquee').marquee({
        allowCss3Support: true,
        delayBeforeStart: 0,
        duplicated: true,
        startVisible: true
    });

    $('.bs-fp-chart-list.ct-chart, .bs-fpt-chart-list.ct-chart').each(function () {
        var $this = $(this),
            data = {},
            config = {
                chartPadding: 0,
                stretch: true,
                grid: false,
                showArea: true,
                showPoint: false,
                fullWidth: true,
                axisX: {
                    showLabel: false,
                    showGrid: false,
                    offset: 0
                },
                axisY: {
                    showLabel: false,
                    showGrid: false,
                    offset: 0
                },
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 1e2
                })
            };

        if ($this.data('series')) {
            data.series = [
                $this.data('series').split(',').map(Number)
            ];
        }

        if ($this.data('width')) {
            config.width = $this.data('width');
        }

        if ($this.data('height')) {
            config.height = $this.data('height');
        }

        new Chartist.Line(this, data, config);

        $this.removeAttr('data-series');
    });

    if (typeof bs_financial_loc !== 'object' || typeof bs_financial_loc.converter !== 'object' || typeof bs_financial_loc.converter.rates !== 'object') {
        return;
    }

    var util = {

        convert: function (value, from_currency, to_currency) {

            from_currency = from_currency.toUpperCase();
            to_currency = to_currency.toUpperCase();

            if (bs_financial_loc.converter.base_currency !== from_currency) {

                if (bs_financial_loc.converter.currencies && bs_financial_loc.converter.currencies[from_currency]) {

                    value = value * bs_financial_loc.converter.currencies[from_currency];

                } else if (bs_financial_loc.converter.rates && bs_financial_loc.converter.rates[from_currency]) {

                    value = value / bs_financial_loc.converter.rates[from_currency];

                } else {

                    return false;
                }
            }

            var result;

            if (bs_financial_loc.converter.base_currency !== to_currency) {

                if (bs_financial_loc.converter.rates && bs_financial_loc.converter.rates[to_currency]) {

                    result = value * bs_financial_loc.converter.rates[to_currency];
                } else if (bs_financial_loc.converter.currencies && bs_financial_loc.converter.currencies[to_currency]) {

                    result = value / bs_financial_loc.converter.currencies[to_currency];
                }
            } else {

                result = value;
            }

            return result;
        },

        CommaSeparate: function (nStr) {

            if (isNaN(nStr)) {
                0
            }

            nStr += '';
            var x = nStr.split('.'),
                x1 = x[0],
                x2 = x.length > 1 ? '.' + x[1] : '',
                rgx = /(\d+)(\d{3})/;

            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }

            return x1 + x2;
        },

        formatMoney: function (value, currency) {

            var decimal = 2, value = parseFloat(value);

            if (0 === value) {

                return '0';
            }

            if (value < 1) { // For tiny numbers

                var log10 = function (val) {
                    return Math.log(val) / Math.LN10;
                };

                // Determine appropriate decimal value
                decimal = Math.ceil(log10(1 / value) + 2);
            }

            return accounting.formatMoney(value, currency, decimal);
        },

        dropDownItems: function (element) {

            if (!element || element.tagName !== 'SELECT') {
                return {};
            }

            var items = [];

            Array.prototype.forEach.call(element.options, function (option) {

                items.push({key: option.value, value: option.innerText});
            });

            return items;
        },

        updateDropDown: function (element, list, selectedIndex) {

            if (!element || element.tagName !== 'SELECT') {
                return false;
            }

            element.innerHTML = '';

            list.forEach(function (item, index) {

                var option = document.createElement('option');

                option.value = item.key;
                option.innerText = item.value;

                element.options.add(option, index);
            });

            element.options.selectedIndex = selectedIndex || 0;

            return true;
        }
    };

    function handleConvertCurrencyReverse(value, from_currency, to_currency) {

        var from = from_currency;

        from_currency = to_currency;
        to_currency = from;

        return {
            from: util.convert(value, from_currency, to_currency),
            to: value
        };

    }

    function handleConvertCurrency(value, from_currency, to_currency) {

        return {
            from: value,
            to: util.convert(value, from_currency, to_currency),
        };
    }

    function get_currency_logo(currency) {

        if (currency === '') {
            return;
        }

        currency = currency.replace('*', '');

        var logo = bs_financial_loc.converter.currencies_logo;

        if (logo && logo['list'] && logo['list'][currency]) {

            logo = logo['list'][currency];

        } else if (logo && logo['pattern'] && logo['pattern']['cc'] && logo['pattern']['cc']['list'][currency]) {

            logo = logo['pattern']['cc']['url'].replace('%code%', currency.toLowerCase()).replace('%id%', logo['pattern']['cc']['list'][currency]);

        } else if (logo && logo['pattern'] && logo['pattern']['local'] && logo['pattern']['local']['list'].indexOf(currency.toUpperCase()) > -1) {

            logo = logo['pattern']['local']['url'].replace('%code%', currency.toLowerCase());


        } else {

            logo = bs_financial_loc.converter.cash_logo_url.replace('%code%', currency.toLowerCase());
        }

        return logo;
    }


    var $document = $(document);

    $document.on('keyup', ".bs-fpc .fpc-convert-from", function (e) {

        var $el = $(this),
            value = $el.val().replace(/,/g, ''),
            $wrapper = $el.closest('.fpc-wrapper-body'),
            to_currency = $(".fpc-to-unit :selected", $wrapper).val(),
            from_currency = $(".fpc-from-unit :selected", $wrapper).val();


        var isReverse = $el.hasClass('fpc-convert-to'),
            convertedValues = isReverse ?
                handleConvertCurrencyReverse(value, from_currency, to_currency) :
                handleConvertCurrency(value, from_currency, to_currency);

        $(".fpc-to-currency-label .value", $wrapper).html(
            util.formatMoney(convertedValues.to, '')
        );

        if (isReverse) {

            $(".fpc-input.fpc-convert-from", $wrapper).val(util.CommaSeparate(convertedValues.from));

        } else {

            $(".fpc-input.fpc-convert-to", $wrapper).val(util.CommaSeparate(convertedValues.to));
        }

        $el.val(util.CommaSeparate(value));

        $(".fpc-from-currency-label .value", $wrapper).html(util.formatMoney(convertedValues.from, ''));

    });

    $document.on('change', '.fpc-from-unit,.fpc-to-unit', function () {

        var $this = $(this),
            $wrapper = $this.closest('.fpc-wrapper-body'),
            currency = $(':selected', $this).val().toUpperCase();

        var logo = get_currency_logo(currency);

        $((function () {

            return $this.hasClass('fpc-from-unit') ? '.fpc-from-currency-icon' : '.fpc-to-currency-icon';

        })(), $wrapper).attr('src', logo);


        var unite_selector = $this.hasClass('fpc-from-unit') ? '.fpc-from-currency-label .unit' : '.fpc-to-currency-label .unit';

        if (!$(unite_selector, $wrapper.closest('.fpc-wrapper-body')).hasClass('keep-empty')) {
            $(unite_selector, $wrapper.closest('.fpc-wrapper-body')).html(currency);
        }


        $(".fpc-convert-from", $wrapper).keyup();

    });

    $document.on('click', '.fpc-switch-arrow', function (e) {

        e.preventDefault();

        //
        // Update DropDown Menu
        //
        var $context = $(this).closest('.bs-fpc'),
            fromDropDown = $(".fpc-from-unit", $context)[0],
            toDropDown = $(".fpc-to-unit", $context)[0];

        var toUnits = util.dropDownItems(toDropDown),
            fromUnits = util.dropDownItems(fromDropDown);

        var fromSelectedIndex = fromDropDown.selectedIndex,
            toSelectedIndex = toDropDown.selectedIndex;

        util.updateDropDown(fromDropDown, toUnits, toSelectedIndex);
        util.updateDropDown(toDropDown, fromUnits, fromSelectedIndex);

        var $fromIcon = $(".fpc-from-currency-icon", $context),
            $toIcon = $(".fpc-to-currency-icon", $context),
            fromIconUrl = $fromIcon.attr('src'),
            toIconUrl = $toIcon.attr('src');

        //
        // Update labels
        //
        if (!$(".fpc-from-currency-label .unit", $context).hasClass('keep-empty')) {
            if ($(".fpc-from-currency-label .unit", $context).hasClass('bsf-currency-code')) {
                $(".fpc-from-currency-label .unit", $context).html($(fromDropDown.options.item(toSelectedIndex)).attr('value'));
            } else {
                $(".fpc-from-currency-label .unit", $context).html(fromDropDown.options.item(toSelectedIndex).innerText);
            }
        }
        if (!$(".fpc-to-currency-label .unit", $context).hasClass('keep-empty')) {
            if ($(".fpc-to-currency-label .unit", $context).hasClass('bsf-currency-code')) {
                $(".fpc-to-currency-label .unit", $context).html($(fromDropDown.options.item(fromSelectedIndex)).attr('value'));
            } else {
                $(".fpc-to-currency-label .unit", $context).html(toDropDown.options.item(fromSelectedIndex).innerText);
            }
        }


        //
        // Update Currency Icons
        //
        $fromIcon.attr('src', toIconUrl);
        $toIcon.attr('src', fromIconUrl);
        // Update Results
        $(".fpc-convert-from", $context).keyup();

    });


    // init
    $document.find(".fpc-convert-from").keyup();
    $document.find(".fpc-from-unit,.fpc-to-unit").change();
});


