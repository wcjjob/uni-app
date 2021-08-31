'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shared = require('@vue/shared');

const BUILT_IN_TAGS = [
    'ad',
    'audio',
    'button',
    'camera',
    'canvas',
    'checkbox',
    'checkbox-group',
    'cover-image',
    'cover-view',
    'editor',
    'form',
    'functional-page-navigator',
    'icon',
    'image',
    'input',
    'label',
    'live-player',
    'live-pusher',
    'map',
    'movable-area',
    'movable-view',
    'navigator',
    'official-account',
    'open-data',
    'picker',
    'picker-view',
    'picker-view-column',
    'progress',
    'radio',
    'radio-group',
    'rich-text',
    'scroll-view',
    'slider',
    'swiper',
    'swiper-item',
    'switch',
    'text',
    'textarea',
    'video',
    'view',
    'web-view',
].map((tag) => 'uni-' + tag);
const TAGS = [
    'app',
    'layout',
    'content',
    'main',
    'top-window',
    'left-window',
    'right-window',
    'tabbar',
    'page',
    'page-head',
    'page-wrapper',
    'page-body',
    'page-refresh',
    'actionsheet',
    'modal',
    'toast',
    'resize-sensor',
    'shadow-root',
].map((tag) => 'uni-' + tag);
function isBuiltInComponent(tag) {
    return BUILT_IN_TAGS.indexOf('uni-' + tag) !== -1;
}
function isCustomElement(tag) {
    return TAGS.indexOf(tag) !== -1 || BUILT_IN_TAGS.indexOf(tag) !== -1;
}
function isNativeTag(tag) {
    return (shared.isHTMLTag(tag) || shared.isSVGTag(tag)) && !isBuiltInComponent(tag);
}
function isServiceNativeTag(tag) {
    return shared.isHTMLTag(tag) || shared.isSVGTag(tag) || isBuiltInComponent(tag);
}
function isServiceCustomElement(_tag) {
    return false;
}
const COMPONENT_SELECTOR_PREFIX = 'uni-';
const COMPONENT_PREFIX = 'v-' + COMPONENT_SELECTOR_PREFIX;

function resolveOwnerVm(vm) {
    if (!vm) {
        return;
    }
    let componentName = vm.type.name;
    while (componentName && isBuiltInComponent(shared.hyphenate(componentName))) {
        // ownerInstance 内置组件需要使用父 vm
        vm = vm.parent;
        componentName = vm.type.name;
    }
    return vm.proxy;
}
function isElement(el) {
    // Element
    return el.nodeType === 1;
}
function resolveOwnerEl(instance) {
    const { vnode } = instance;
    if (isElement(vnode.el)) {
        return vnode.el;
    }
    const { subTree } = instance;
    // ShapeFlags.ARRAY_CHILDREN = 1<<4
    if (subTree.shapeFlag & 16) {
        const elemVNode = subTree.children.find((vnode) => isElement(vnode.el));
        if (elemVNode) {
            return elemVNode.el;
        }
    }
    return vnode.el;
}

let lastLogTime = 0;
function formatLog(module, ...args) {
    const now = Date.now();
    const diff = lastLogTime ? now - lastLogTime : 0;
    lastLogTime = now;
    return `[${now}][${diff}ms][${module}]：${args
        .map((arg) => JSON.stringify(arg))
        .join(' ')}`;
}

function formatKey(key) {
    return shared.camelize(key.substring(5));
}
function initCustomDataset() {
    const prototype = HTMLElement.prototype;
    const setAttribute = prototype.setAttribute;
    prototype.setAttribute = function (key, value) {
        if (key.startsWith('data-') && this.tagName.startsWith('UNI-')) {
            const dataset = this.__uniDataset ||
                (this.__uniDataset = {});
            dataset[formatKey(key)] = value;
        }
        setAttribute.call(this, key, value);
    };
    const removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function (key) {
        if (this.__uniDataset &&
            key.startsWith('data-') &&
            this.tagName.startsWith('UNI-')) {
            delete this.__uniDataset[formatKey(key)];
        }
        removeAttribute.call(this, key);
    };
}
function getCustomDataset(el) {
    return shared.extend({}, el.dataset, el.__uniDataset);
}

const unitRE = new RegExp(`"[^"]+"|'[^']+'|url\\([^)]+\\)|(\\d*\\.?\\d+)[r|u]px`, 'g');
function toFixed(number, precision) {
    const multiplier = Math.pow(10, precision + 1);
    const wholeNumber = Math.floor(number * multiplier);
    return (Math.round(wholeNumber / 10) * 10) / multiplier;
}
const defaultRpx2Unit = {
    unit: 'rem',
    unitRatio: 10 / 320,
    unitPrecision: 5,
};
function createRpx2Unit(unit, unitRatio, unitPrecision) {
    // ignore: rpxCalcIncludeWidth
    return (val) => val.replace(unitRE, (m, $1) => {
        if (!$1) {
            return m;
        }
        const value = toFixed(parseFloat($1) * unitRatio, unitPrecision);
        return value === 0 ? '0' : `${value}${unit}`;
    });
}

function passive(passive) {
    return { passive };
}
function normalizeDataset(el) {
    // TODO
    return JSON.parse(JSON.stringify(el.dataset || {}));
}
function normalizeTarget(el) {
    const { id, offsetTop, offsetLeft } = el;
    return {
        id,
        dataset: getCustomDataset(el),
        offsetTop,
        offsetLeft,
    };
}
function addFont(family, source, desc) {
    const fonts = document.fonts;
    if (fonts) {
        const fontFace = new FontFace(family, source, desc);
        return fontFace.load().then(() => {
            fonts.add(fontFace);
        });
    }
    return new Promise((resolve) => {
        const style = document.createElement('style');
        const values = [];
        if (desc) {
            const { style, weight, stretch, unicodeRange, variant, featureSettings } = desc;
            style && values.push(`font-style:${style}`);
            weight && values.push(`font-weight:${weight}`);
            stretch && values.push(`font-stretch:${stretch}`);
            unicodeRange && values.push(`unicode-range:${unicodeRange}`);
            variant && values.push(`font-variant:${variant}`);
            featureSettings && values.push(`font-feature-settings:${featureSettings}`);
        }
        style.innerText = `@font-face{font-family:"${family}";src:${source};${values.join(';')}}`;
        document.head.appendChild(style);
        resolve();
    });
}
function scrollTo(scrollTop, duration) {
    if (shared.isString(scrollTop)) {
        const el = document.querySelector(scrollTop);
        if (el) {
            scrollTop = el.getBoundingClientRect().top + window.pageYOffset;
        }
    }
    if (scrollTop < 0) {
        scrollTop = 0;
    }
    const documentElement = document.documentElement;
    const { clientHeight, scrollHeight } = documentElement;
    scrollTop = Math.min(scrollTop, scrollHeight - clientHeight);
    if (duration === 0) {
        // 部分浏览器（比如微信）中 scrollTop 的值需要通过 document.body 来控制
        documentElement.scrollTop = document.body.scrollTop = scrollTop;
        return;
    }
    if (window.scrollY === scrollTop) {
        return;
    }
    const scrollTo = (duration) => {
        if (duration <= 0) {
            window.scrollTo(0, scrollTop);
            return;
        }
        const distaince = scrollTop - window.scrollY;
        requestAnimationFrame(function () {
            window.scrollTo(0, window.scrollY + (distaince / duration) * 10);
            scrollTo(duration - 10);
        });
    };
    scrollTo(duration);
}

const encode = encodeURIComponent;
function stringifyQuery(obj, encodeStr = encode) {
    const res = obj
        ? Object.keys(obj)
            .map((key) => {
            let val = obj[key];
            if (typeof val === undefined || val === null) {
                val = '';
            }
            else if (shared.isPlainObject(val)) {
                val = JSON.stringify(val);
            }
            return encodeStr(key) + '=' + encodeStr(val);
        })
            .filter((x) => x.length > 0)
            .join('&')
        : null;
    return res ? `?${res}` : '';
}
/**
 * Decode text using `decodeURIComponent`. Returns the original text if it
 * fails.
 *
 * @param text - string to decode
 * @returns decoded string
 */
function decode(text) {
    try {
        return decodeURIComponent('' + text);
    }
    catch (err) { }
    return '' + text;
}
function decodedQuery(query = {}) {
    const decodedQuery = {};
    Object.keys(query).forEach((name) => {
        try {
            decodedQuery[name] = decode(query[name]);
        }
        catch (e) {
            decodedQuery[name] = query[name];
        }
    });
    return decodedQuery;
}
const PLUS_RE = /\+/g; // %2B
/**
 * https://github.com/vuejs/vue-router-next/blob/master/src/query.ts
 * @internal
 *
 * @param search - search string to parse
 * @returns a query object
 */
function parseQuery(search) {
    const query = {};
    // avoid creating an object with an empty key and empty value
    // because of split('&')
    if (search === '' || search === '?')
        return query;
    const hasLeadingIM = search[0] === '?';
    const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&');
    for (let i = 0; i < searchParams.length; ++i) {
        // pre decode the + into space
        const searchParam = searchParams[i].replace(PLUS_RE, ' ');
        // allow the = character
        let eqPos = searchParam.indexOf('=');
        let key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
        let value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
        if (key in query) {
            // an extra variable for ts types
            let currentValue = query[key];
            if (!shared.isArray(currentValue)) {
                currentValue = query[key] = [currentValue];
            }
            currentValue.push(value);
        }
        else {
            query[key] = value;
        }
    }
    return query;
}

function parseUrl(url) {
    const [path, querystring] = url.split('?', 2);
    return {
        path,
        query: parseQuery(querystring || ''),
    };
}

function isDebugMode() {
    // @ts-expect-error
    return typeof __channelId__ === 'string' && __channelId__;
}
function jsonStringifyReplacer(k, p) {
    switch (shared.toRawType(p)) {
        case 'Function':
            return 'function() { [native code] }';
        default:
            return p;
    }
}
function normalizeLog(type, filename, args) {
    if (isDebugMode()) {
        args.push(filename.replace('at ', 'uni-app:///'));
        return console[type].apply(console, args);
    }
    const msgs = args.map(function (v) {
        const type = shared.toTypeString(v).toLowerCase();
        if (type === '[object object]' || type === '[object array]') {
            try {
                v =
                    '---BEGIN:JSON---' +
                        JSON.stringify(v, jsonStringifyReplacer) +
                        '---END:JSON---';
            }
            catch (e) {
                v = type;
            }
        }
        else {
            if (v === null) {
                v = '---NULL---';
            }
            else if (v === undefined) {
                v = '---UNDEFINED---';
            }
            else {
                const vType = shared.toRawType(v).toUpperCase();
                if (vType === 'NUMBER' || vType === 'BOOLEAN') {
                    v = '---BEGIN:' + vType + '---' + v + '---END:' + vType + '---';
                }
                else {
                    v = String(v);
                }
            }
        }
        return v;
    });
    return msgs.join('---COMMA---') + ' ' + filename;
}
function formatAppLog(type, filename, ...args) {
    const res = normalizeLog(type, filename, args);
    res && console[type](res);
}

function plusReady(callback) {
    if (typeof callback !== 'function') {
        return;
    }
    if (window.plus) {
        return callback();
    }
    document.addEventListener('plusready', callback);
}

class DOMException extends Error {
    constructor(message) {
        super(message);
        this.name = 'DOMException';
    }
}

function normalizeEventType(type, options) {
    if (options) {
        if (options.capture) {
            type += 'Capture';
        }
        if (options.once) {
            type += 'Once';
        }
        if (options.passive) {
            type += 'Passive';
        }
    }
    return `on${shared.capitalize(shared.camelize(type))}`;
}
class UniEvent {
    constructor(type, opts) {
        this.defaultPrevented = false;
        this.timeStamp = Date.now();
        this._stop = false;
        this._end = false;
        this.type = type;
        this.bubbles = !!opts.bubbles;
        this.cancelable = !!opts.cancelable;
    }
    preventDefault() {
        this.defaultPrevented = true;
    }
    stopImmediatePropagation() {
        this._end = this._stop = true;
    }
    stopPropagation() {
        this._stop = true;
    }
}
function createUniEvent(evt) {
    if (evt instanceof UniEvent) {
        return evt;
    }
    const [type] = parseEventName(evt.type);
    const uniEvent = new UniEvent(type, {
        bubbles: false,
        cancelable: false,
    });
    shared.extend(uniEvent, evt);
    return uniEvent;
}
class UniEventTarget {
    constructor() {
        this.listeners = Object.create(null);
    }
    dispatchEvent(evt) {
        const listeners = this.listeners[evt.type];
        if (!listeners) {
            if ((process.env.NODE_ENV !== 'production')) {
                console.error(formatLog('dispatchEvent', this.nodeId), evt.type, 'not found');
            }
            return false;
        }
        // 格式化事件类型
        const event = createUniEvent(evt);
        const len = listeners.length;
        for (let i = 0; i < len; i++) {
            listeners[i].call(this, event);
            if (event._end) {
                break;
            }
        }
        return event.cancelable && event.defaultPrevented;
    }
    addEventListener(type, listener, options) {
        type = normalizeEventType(type, options);
        (this.listeners[type] || (this.listeners[type] = [])).push(listener);
    }
    removeEventListener(type, callback, options) {
        type = normalizeEventType(type, options);
        const listeners = this.listeners[type];
        if (!listeners) {
            return;
        }
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseEventName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
        options = {};
        let m;
        while ((m = name.match(optionsModifierRE))) {
            name = name.slice(0, name.length - m[0].length);
            options[m[0].toLowerCase()] = true;
        }
    }
    return [shared.hyphenate(name.slice(2)), options];
}

const EventModifierFlags = {
    stop: 1,
    prevent: 1 << 1,
    self: 1 << 2,
};
function encodeModifier(modifiers) {
    let flag = 0;
    if (modifiers.includes('stop')) {
        flag |= EventModifierFlags.stop;
    }
    if (modifiers.includes('prevent')) {
        flag |= EventModifierFlags.prevent;
    }
    if (modifiers.includes('self')) {
        flag |= EventModifierFlags.self;
    }
    return flag;
}

const NODE_TYPE_PAGE = 0;
const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;
const NODE_TYPE_COMMENT = 8;
function sibling(node, type) {
    const { parentNode } = node;
    if (!parentNode) {
        return null;
    }
    const { childNodes } = parentNode;
    return childNodes[childNodes.indexOf(node) + (type === 'n' ? 1 : -1)] || null;
}
function removeNode(node) {
    const { parentNode } = node;
    if (parentNode) {
        parentNode.removeChild(node);
    }
}
function checkNodeId(node) {
    if (!node.nodeId && node.pageNode) {
        node.nodeId = node.pageNode.genId();
    }
}
// 为优化性能，各平台不使用proxy来实现node的操作拦截，而是直接通过pageNode定制
class UniNode extends UniEventTarget {
    constructor(nodeType, nodeName, container) {
        super();
        this.pageNode = null;
        this.parentNode = null;
        this._text = null;
        if (container) {
            const { pageNode } = container;
            if (pageNode) {
                this.pageNode = pageNode;
                this.nodeId = pageNode.genId();
                !pageNode.isUnmounted && pageNode.onCreate(this, nodeName);
            }
        }
        this.nodeType = nodeType;
        this.nodeName = nodeName;
        this.childNodes = [];
    }
    get firstChild() {
        return this.childNodes[0] || null;
    }
    get lastChild() {
        const { childNodes } = this;
        const length = childNodes.length;
        return length ? childNodes[length - 1] : null;
    }
    get nextSibling() {
        return sibling(this, 'n');
    }
    get nodeValue() {
        return null;
    }
    set nodeValue(_val) { }
    get textContent() {
        return this._text || '';
    }
    set textContent(text) {
        this._text = text;
        if (this.pageNode && !this.pageNode.isUnmounted) {
            this.pageNode.onTextContent(this, text);
        }
    }
    get parentElement() {
        const { parentNode } = this;
        if (parentNode && parentNode.nodeType === NODE_TYPE_ELEMENT) {
            return parentNode;
        }
        return null;
    }
    get previousSibling() {
        return sibling(this, 'p');
    }
    appendChild(newChild) {
        return this.insertBefore(newChild, null);
    }
    cloneNode(deep) {
        const cloned = shared.extend(Object.create(Object.getPrototypeOf(this)), this);
        const { attributes } = cloned;
        if (attributes) {
            cloned.attributes = shared.extend({}, attributes);
        }
        if (deep) {
            cloned.childNodes = cloned.childNodes.map((childNode) => childNode.cloneNode(true));
        }
        return cloned;
    }
    insertBefore(newChild, refChild) {
        removeNode(newChild);
        newChild.pageNode = this.pageNode;
        newChild.parentNode = this;
        checkNodeId(newChild);
        const { childNodes } = this;
        if (refChild) {
            const index = childNodes.indexOf(refChild);
            if (index === -1) {
                throw new DOMException(`Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`);
            }
            childNodes.splice(index, 0, newChild);
        }
        else {
            childNodes.push(newChild);
        }
        return this.pageNode && !this.pageNode.isUnmounted
            ? this.pageNode.onInsertBefore(this, newChild, refChild)
            : newChild;
    }
    removeChild(oldChild) {
        const { childNodes } = this;
        const index = childNodes.indexOf(oldChild);
        if (index === -1) {
            throw new DOMException(`Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`);
        }
        oldChild.parentNode = null;
        childNodes.splice(index, 1);
        return this.pageNode && !this.pageNode.isUnmounted
            ? this.pageNode.onRemoveChild(oldChild)
            : oldChild;
    }
}
const ATTR_CLASS = 'class';
const ATTR_STYLE = 'style';
const ATTR_INNER_HTML = 'innerHTML';
const ATTR_TEXT_CONTENT = 'textContent';
const ATTR_V_SHOW = '.vShow';
const ATTR_V_OWNER_ID = '.vOwnerId';
const ATTR_V_RENDERJS = '.vRenderjs';
const ATTR_CHANGE_PREFIX = 'change:';
class UniBaseNode extends UniNode {
    constructor(nodeType, nodeName, container) {
        super(nodeType, nodeName, container);
        this.attributes = Object.create(null);
        this.style = null;
        this.vShow = null;
        this._html = null;
    }
    get className() {
        return (this.attributes[ATTR_CLASS] || '');
    }
    set className(val) {
        this.setAttribute(ATTR_CLASS, val);
    }
    get innerHTML() {
        return '';
    }
    set innerHTML(html) {
        this._html = html;
    }
    addEventListener(type, listener, options) {
        super.addEventListener(type, listener, options);
        if (this.pageNode && !this.pageNode.isUnmounted) {
            if (listener.wxsEvent) {
                this.pageNode.onAddWxsEvent(this, normalizeEventType(type, options), listener.wxsEvent, encodeModifier(listener.modifiers || []));
            }
            else {
                this.pageNode.onAddEvent(this, normalizeEventType(type, options), encodeModifier(listener.modifiers || []));
            }
        }
    }
    removeEventListener(type, callback, options) {
        super.removeEventListener(type, callback, options);
        if (this.pageNode && !this.pageNode.isUnmounted) {
            this.pageNode.onRemoveEvent(this, normalizeEventType(type, options));
        }
    }
    getAttribute(qualifiedName) {
        if (qualifiedName === ATTR_STYLE) {
            return this.style;
        }
        return this.attributes[qualifiedName];
    }
    removeAttribute(qualifiedName) {
        if (qualifiedName == ATTR_STYLE) {
            this.style = null;
        }
        else {
            delete this.attributes[qualifiedName];
        }
        if (this.pageNode && !this.pageNode.isUnmounted) {
            this.pageNode.onRemoveAttribute(this, qualifiedName);
        }
    }
    setAttribute(qualifiedName, value) {
        if (qualifiedName === ATTR_STYLE) {
            this.style = value;
        }
        else {
            this.attributes[qualifiedName] = value;
        }
        if (this.pageNode && !this.pageNode.isUnmounted) {
            this.pageNode.onSetAttribute(this, qualifiedName, value);
        }
    }
    toJSON({ attr, normalize, } = {}) {
        const { attributes, style, listeners, _text } = this;
        const res = {};
        if (Object.keys(attributes).length) {
            res.a = normalize ? normalize(attributes) : attributes;
        }
        const events = Object.keys(listeners);
        if (events.length) {
            let w = undefined;
            const e = {};
            events.forEach((name) => {
                const handlers = listeners[name];
                if (handlers.length) {
                    // 可能存在多个 handler 且不同 modifiers 吗？
                    const { wxsEvent, modifiers } = handlers[0];
                    const modifier = encodeModifier(modifiers || []);
                    if (!wxsEvent) {
                        e[name] = modifier;
                    }
                    else {
                        if (!w) {
                            w = {};
                        }
                        w[name] = [normalize ? normalize(wxsEvent) : wxsEvent, modifier];
                    }
                }
            });
            res.e = normalize ? normalize(e, false) : e;
            if (w) {
                res.w = normalize ? normalize(w, false) : w;
            }
        }
        if (style !== null) {
            res.s = normalize ? normalize(style) : style;
        }
        if (!attr) {
            res.i = this.nodeId;
            res.n = this.nodeName;
        }
        if (_text !== null) {
            res.t = normalize ? normalize(_text) : _text;
        }
        return res;
    }
}

class UniCommentNode extends UniNode {
    constructor(text, container) {
        super(NODE_TYPE_COMMENT, '#comment', container);
        this._text = (process.env.NODE_ENV !== 'production') ? text : '';
    }
    toJSON(opts = {}) {
        // 暂时不传递 text 到 view 层，没啥意义，节省点数据量
        return opts.attr
            ? {}
            : {
                i: this.nodeId,
            };
        // return opts.attr
        //   ? { t: this._text as string }
        //   : {
        //       i: this.nodeId!,
        //       t: this._text as string,
        //     }
    }
}

class UniElement extends UniBaseNode {
    constructor(nodeName, container) {
        super(NODE_TYPE_ELEMENT, nodeName.toUpperCase(), container);
        this.tagName = this.nodeName;
    }
}
class UniInputElement extends UniElement {
    get value() {
        return this.getAttribute('value');
    }
    set value(val) {
        this.setAttribute('value', val);
    }
}
class UniTextAreaElement extends UniInputElement {
}

class UniTextNode extends UniBaseNode {
    constructor(text, container) {
        super(NODE_TYPE_TEXT, '#text', container);
        this._text = text;
    }
    get nodeValue() {
        return this._text || '';
    }
    set nodeValue(text) {
        this._text = text;
        if (this.pageNode && !this.pageNode.isUnmounted) {
            this.pageNode.onNodeValue(this, text);
        }
    }
}

const ACTION_TYPE_PAGE_CREATE = 1;
const ACTION_TYPE_PAGE_CREATED = 2;
const ACTION_TYPE_CREATE = 3;
const ACTION_TYPE_INSERT = 4;
const ACTION_TYPE_REMOVE = 5;
const ACTION_TYPE_SET_ATTRIBUTE = 6;
const ACTION_TYPE_REMOVE_ATTRIBUTE = 7;
const ACTION_TYPE_ADD_EVENT = 8;
const ACTION_TYPE_REMOVE_EVENT = 9;
const ACTION_TYPE_SET_TEXT = 10;
const ACTION_TYPE_ADD_WXS_EVENT = 12;
const ACTION_TYPE_PAGE_SCROLL = 15;
const ACTION_TYPE_EVENT = 20;

function cache(fn) {
    const cache = Object.create(null);
    return (str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}
function cacheStringFunction(fn) {
    return cache(fn);
}
function getLen(str = '') {
    return ('' + str).replace(/[^\x00-\xff]/g, '**').length;
}
function removeLeadingSlash(str) {
    return str.indexOf('/') === 0 ? str.substr(1) : str;
}
const invokeArrayFns = (fns, arg) => {
    let ret;
    for (let i = 0; i < fns.length; i++) {
        ret = fns[i](arg);
    }
    return ret;
};
function updateElementStyle(element, styles) {
    for (const attrName in styles) {
        element.style[attrName] = styles[attrName];
    }
}
function once(fn, ctx = null) {
    let res;
    return ((...args) => {
        if (fn) {
            res = fn.apply(ctx, args);
            fn = null;
        }
        return res;
    });
}
const sanitise = (val) => (val && JSON.parse(JSON.stringify(val))) || val;
const _completeValue = (value) => (value > 9 ? value : '0' + value);
function formatDateTime({ date = new Date(), mode = 'date' }) {
    if (mode === 'time') {
        return (_completeValue(date.getHours()) + ':' + _completeValue(date.getMinutes()));
    }
    else {
        return (date.getFullYear() +
            '-' +
            _completeValue(date.getMonth() + 1) +
            '-' +
            _completeValue(date.getDate()));
    }
}
function callOptions(options, data) {
    options = options || {};
    if (typeof data === 'string') {
        data = {
            errMsg: data,
        };
    }
    if (/:ok$/.test(data.errMsg)) {
        if (typeof options.success === 'function') {
            options.success(data);
        }
    }
    else {
        if (typeof options.fail === 'function') {
            options.fail(data);
        }
    }
    if (typeof options.complete === 'function') {
        options.complete(data);
    }
}
function getValueByDataPath(obj, path) {
    const parts = path.split('.');
    let key = parts[0];
    if (!obj) {
        obj = {};
    }
    if (parts.length === 1) {
        return obj[key];
    }
    return getValueByDataPath(obj[key], parts.slice(1).join('.'));
}

function debounce(fn, delay) {
    let timeout;
    const newFn = function () {
        clearTimeout(timeout);
        const timerFn = () => fn.apply(this, arguments);
        timeout = setTimeout(timerFn, delay);
    };
    newFn.cancel = function () {
        clearTimeout(timeout);
    };
    return newFn;
}

const NAVBAR_HEIGHT = 44;
const TABBAR_HEIGHT = 50;
const ON_REACH_BOTTOM_DISTANCE = 50;
const RESPONSIVE_MIN_WIDTH = 768;
const COMPONENT_NAME_PREFIX = 'VUni';
const I18N_JSON_DELIMITERS = ['%', '%'];
const PRIMARY_COLOR = '#007aff';
const SELECTED_COLOR = '#0062cc'; // 选中的颜色，如选项卡默认的选中颜色
const BACKGROUND_COLOR = '#f7f7f7'; // 背景色，如标题栏默认背景色
const UNI_SSR = '__uniSSR';
const UNI_SSR_TITLE = 'title';
const UNI_SSR_STORE = 'store';
const UNI_SSR_DATA = 'data';
const UNI_SSR_GLOBAL_DATA = 'globalData';
const SCHEME_RE = /^([a-z-]+:)?\/\//i;
const DATA_RE = /^data:.*,.*/;
const WEB_INVOKE_APPSERVICE = 'WEB_INVOKE_APPSERVICE';
const WXS_PROTOCOL = 'wxs://';
const JSON_PROTOCOL = 'json://';
const WXS_MODULES = 'wxsModules';
const RENDERJS_MODULES = 'renderjsModules';
// lifecycle
// App and Page
const ON_SHOW = 'onShow';
const ON_HIDE = 'onHide';
//App
const ON_LAUNCH = 'onLaunch';
const ON_ERROR = 'onError';
const ON_THEME_CHANGE = 'onThemeChange';
const ON_KEYBOARD_HEIGHT_CHANGE = 'onKeyboardHeightChange';
const ON_PAGE_NOT_FOUND = 'onPageNotFound';
const ON_UNHANDLE_REJECTION = 'onUnhandledRejection';
//Page
const ON_LOAD = 'onLoad';
const ON_READY = 'onReady';
const ON_UNLOAD = 'onUnload';
const ON_RESIZE = 'onResize';
const ON_BACK_PRESS = 'onBackPress';
const ON_PAGE_SCROLL = 'onPageScroll';
const ON_TAB_ITEM_TAP = 'onTabItemTap';
const ON_REACH_BOTTOM = 'onReachBottom';
const ON_PULL_DOWN_REFRESH = 'onPullDownRefresh';
const ON_SHARE_TIMELINE = 'onShareTimeline';
const ON_ADD_TO_FAVORITES = 'onAddToFavorites';
const ON_SHARE_APP_MESSAGE = 'onShareAppMessage';
// navigationBar
const ON_NAVIGATION_BAR_BUTTON_TAP = 'onNavigationBarButtonTap';
const ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED = 'onNavigationBarSearchInputClicked';
const ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED = 'onNavigationBarSearchInputChanged';
const ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED = 'onNavigationBarSearchInputConfirmed';
const ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED = 'onNavigationBarSearchInputFocusChanged';
// framework
const ON_APP_ENTER_FOREGROUND = 'onAppEnterForeground';
const ON_APP_ENTER_BACKGROUND = 'onAppEnterBackground';
const ON_WEB_INVOKE_APP_SERVICE = 'onWebInvokeAppService';
const ON_WXS_INVOKE_CALL_METHOD = 'onWxsInvokeCallMethod';

class EventChannel {
    constructor(id, events) {
        this.id = id;
        this.listener = {};
        this.emitCache = {};
        if (events) {
            Object.keys(events).forEach((name) => {
                this.on(name, events[name]);
            });
        }
    }
    emit(eventName, ...args) {
        const fns = this.listener[eventName];
        if (!fns) {
            return (this.emitCache[eventName] || (this.emitCache[eventName] = [])).push(args);
        }
        fns.forEach((opt) => {
            opt.fn.apply(opt.fn, args);
        });
        this.listener[eventName] = fns.filter((opt) => opt.type !== 'once');
    }
    on(eventName, fn) {
        this._addListener(eventName, 'on', fn);
        this._clearCache(eventName);
    }
    once(eventName, fn) {
        this._addListener(eventName, 'once', fn);
        this._clearCache(eventName);
    }
    off(eventName, fn) {
        const fns = this.listener[eventName];
        if (!fns) {
            return;
        }
        if (fn) {
            for (let i = 0; i < fns.length;) {
                if (fns[i].fn === fn) {
                    fns.splice(i, 1);
                    i--;
                }
                i++;
            }
        }
        else {
            delete this.listener[eventName];
        }
    }
    _clearCache(eventName) {
        const cacheArgs = this.emitCache[eventName];
        if (cacheArgs) {
            for (; cacheArgs.length > 0;) {
                this.emit.apply(this, [eventName, ...cacheArgs.shift()]);
            }
        }
    }
    _addListener(eventName, type, fn) {
        (this.listener[eventName] || (this.listener[eventName] = [])).push({
            fn,
            type,
        });
    }
}

const PAGE_HOOKS = [
    ON_BACK_PRESS,
    ON_PAGE_SCROLL,
    ON_TAB_ITEM_TAP,
    ON_REACH_BOTTOM,
    ON_PULL_DOWN_REFRESH,
];
function isRootHook(name) {
    return PAGE_HOOKS.indexOf(name) > -1;
}
const UniLifecycleHooks = [
    ON_SHOW,
    ON_HIDE,
    ON_LAUNCH,
    ON_ERROR,
    ON_THEME_CHANGE,
    ON_PAGE_NOT_FOUND,
    ON_UNHANDLE_REJECTION,
    ON_LOAD,
    ON_READY,
    ON_UNLOAD,
    ON_RESIZE,
    ON_BACK_PRESS,
    ON_PAGE_SCROLL,
    ON_TAB_ITEM_TAP,
    ON_REACH_BOTTOM,
    ON_PULL_DOWN_REFRESH,
    ON_SHARE_TIMELINE,
    ON_ADD_TO_FAVORITES,
    ON_SHARE_APP_MESSAGE,
    ON_NAVIGATION_BAR_BUTTON_TAP,
    ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED,
    ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED,
    ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED,
    ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED,
];

function getEnvLocale() {
    const { env } = process;
    const lang = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
    return (lang && lang.replace(/[.:].*/, '')) || 'en';
}

exports.ACTION_TYPE_ADD_EVENT = ACTION_TYPE_ADD_EVENT;
exports.ACTION_TYPE_ADD_WXS_EVENT = ACTION_TYPE_ADD_WXS_EVENT;
exports.ACTION_TYPE_CREATE = ACTION_TYPE_CREATE;
exports.ACTION_TYPE_EVENT = ACTION_TYPE_EVENT;
exports.ACTION_TYPE_INSERT = ACTION_TYPE_INSERT;
exports.ACTION_TYPE_PAGE_CREATE = ACTION_TYPE_PAGE_CREATE;
exports.ACTION_TYPE_PAGE_CREATED = ACTION_TYPE_PAGE_CREATED;
exports.ACTION_TYPE_PAGE_SCROLL = ACTION_TYPE_PAGE_SCROLL;
exports.ACTION_TYPE_REMOVE = ACTION_TYPE_REMOVE;
exports.ACTION_TYPE_REMOVE_ATTRIBUTE = ACTION_TYPE_REMOVE_ATTRIBUTE;
exports.ACTION_TYPE_REMOVE_EVENT = ACTION_TYPE_REMOVE_EVENT;
exports.ACTION_TYPE_SET_ATTRIBUTE = ACTION_TYPE_SET_ATTRIBUTE;
exports.ACTION_TYPE_SET_TEXT = ACTION_TYPE_SET_TEXT;
exports.ATTR_CHANGE_PREFIX = ATTR_CHANGE_PREFIX;
exports.ATTR_CLASS = ATTR_CLASS;
exports.ATTR_INNER_HTML = ATTR_INNER_HTML;
exports.ATTR_STYLE = ATTR_STYLE;
exports.ATTR_TEXT_CONTENT = ATTR_TEXT_CONTENT;
exports.ATTR_V_OWNER_ID = ATTR_V_OWNER_ID;
exports.ATTR_V_RENDERJS = ATTR_V_RENDERJS;
exports.ATTR_V_SHOW = ATTR_V_SHOW;
exports.BACKGROUND_COLOR = BACKGROUND_COLOR;
exports.BUILT_IN_TAGS = BUILT_IN_TAGS;
exports.COMPONENT_NAME_PREFIX = COMPONENT_NAME_PREFIX;
exports.COMPONENT_PREFIX = COMPONENT_PREFIX;
exports.COMPONENT_SELECTOR_PREFIX = COMPONENT_SELECTOR_PREFIX;
exports.DATA_RE = DATA_RE;
exports.EventChannel = EventChannel;
exports.EventModifierFlags = EventModifierFlags;
exports.I18N_JSON_DELIMITERS = I18N_JSON_DELIMITERS;
exports.JSON_PROTOCOL = JSON_PROTOCOL;
exports.NAVBAR_HEIGHT = NAVBAR_HEIGHT;
exports.NODE_TYPE_COMMENT = NODE_TYPE_COMMENT;
exports.NODE_TYPE_ELEMENT = NODE_TYPE_ELEMENT;
exports.NODE_TYPE_PAGE = NODE_TYPE_PAGE;
exports.NODE_TYPE_TEXT = NODE_TYPE_TEXT;
exports.ON_ADD_TO_FAVORITES = ON_ADD_TO_FAVORITES;
exports.ON_APP_ENTER_BACKGROUND = ON_APP_ENTER_BACKGROUND;
exports.ON_APP_ENTER_FOREGROUND = ON_APP_ENTER_FOREGROUND;
exports.ON_BACK_PRESS = ON_BACK_PRESS;
exports.ON_ERROR = ON_ERROR;
exports.ON_HIDE = ON_HIDE;
exports.ON_KEYBOARD_HEIGHT_CHANGE = ON_KEYBOARD_HEIGHT_CHANGE;
exports.ON_LAUNCH = ON_LAUNCH;
exports.ON_LOAD = ON_LOAD;
exports.ON_NAVIGATION_BAR_BUTTON_TAP = ON_NAVIGATION_BAR_BUTTON_TAP;
exports.ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED = ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED;
exports.ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED = ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED;
exports.ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED = ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED;
exports.ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED = ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED;
exports.ON_PAGE_NOT_FOUND = ON_PAGE_NOT_FOUND;
exports.ON_PAGE_SCROLL = ON_PAGE_SCROLL;
exports.ON_PULL_DOWN_REFRESH = ON_PULL_DOWN_REFRESH;
exports.ON_REACH_BOTTOM = ON_REACH_BOTTOM;
exports.ON_REACH_BOTTOM_DISTANCE = ON_REACH_BOTTOM_DISTANCE;
exports.ON_READY = ON_READY;
exports.ON_RESIZE = ON_RESIZE;
exports.ON_SHARE_APP_MESSAGE = ON_SHARE_APP_MESSAGE;
exports.ON_SHARE_TIMELINE = ON_SHARE_TIMELINE;
exports.ON_SHOW = ON_SHOW;
exports.ON_TAB_ITEM_TAP = ON_TAB_ITEM_TAP;
exports.ON_THEME_CHANGE = ON_THEME_CHANGE;
exports.ON_UNHANDLE_REJECTION = ON_UNHANDLE_REJECTION;
exports.ON_UNLOAD = ON_UNLOAD;
exports.ON_WEB_INVOKE_APP_SERVICE = ON_WEB_INVOKE_APP_SERVICE;
exports.ON_WXS_INVOKE_CALL_METHOD = ON_WXS_INVOKE_CALL_METHOD;
exports.PLUS_RE = PLUS_RE;
exports.PRIMARY_COLOR = PRIMARY_COLOR;
exports.RENDERJS_MODULES = RENDERJS_MODULES;
exports.RESPONSIVE_MIN_WIDTH = RESPONSIVE_MIN_WIDTH;
exports.SCHEME_RE = SCHEME_RE;
exports.SELECTED_COLOR = SELECTED_COLOR;
exports.TABBAR_HEIGHT = TABBAR_HEIGHT;
exports.TAGS = TAGS;
exports.UNI_SSR = UNI_SSR;
exports.UNI_SSR_DATA = UNI_SSR_DATA;
exports.UNI_SSR_GLOBAL_DATA = UNI_SSR_GLOBAL_DATA;
exports.UNI_SSR_STORE = UNI_SSR_STORE;
exports.UNI_SSR_TITLE = UNI_SSR_TITLE;
exports.UniBaseNode = UniBaseNode;
exports.UniCommentNode = UniCommentNode;
exports.UniElement = UniElement;
exports.UniEvent = UniEvent;
exports.UniInputElement = UniInputElement;
exports.UniLifecycleHooks = UniLifecycleHooks;
exports.UniNode = UniNode;
exports.UniTextAreaElement = UniTextAreaElement;
exports.UniTextNode = UniTextNode;
exports.WEB_INVOKE_APPSERVICE = WEB_INVOKE_APPSERVICE;
exports.WXS_MODULES = WXS_MODULES;
exports.WXS_PROTOCOL = WXS_PROTOCOL;
exports.addFont = addFont;
exports.cache = cache;
exports.cacheStringFunction = cacheStringFunction;
exports.callOptions = callOptions;
exports.createRpx2Unit = createRpx2Unit;
exports.createUniEvent = createUniEvent;
exports.debounce = debounce;
exports.decode = decode;
exports.decodedQuery = decodedQuery;
exports.defaultRpx2Unit = defaultRpx2Unit;
exports.formatAppLog = formatAppLog;
exports.formatDateTime = formatDateTime;
exports.formatLog = formatLog;
exports.getCustomDataset = getCustomDataset;
exports.getEnvLocale = getEnvLocale;
exports.getLen = getLen;
exports.getValueByDataPath = getValueByDataPath;
exports.initCustomDataset = initCustomDataset;
exports.invokeArrayFns = invokeArrayFns;
exports.isBuiltInComponent = isBuiltInComponent;
exports.isCustomElement = isCustomElement;
exports.isNativeTag = isNativeTag;
exports.isRootHook = isRootHook;
exports.isServiceCustomElement = isServiceCustomElement;
exports.isServiceNativeTag = isServiceNativeTag;
exports.normalizeDataset = normalizeDataset;
exports.normalizeEventType = normalizeEventType;
exports.normalizeTarget = normalizeTarget;
exports.once = once;
exports.parseEventName = parseEventName;
exports.parseQuery = parseQuery;
exports.parseUrl = parseUrl;
exports.passive = passive;
exports.plusReady = plusReady;
exports.removeLeadingSlash = removeLeadingSlash;
exports.resolveOwnerEl = resolveOwnerEl;
exports.resolveOwnerVm = resolveOwnerVm;
exports.sanitise = sanitise;
exports.scrollTo = scrollTo;
exports.stringifyQuery = stringifyQuery;
exports.updateElementStyle = updateElementStyle;
