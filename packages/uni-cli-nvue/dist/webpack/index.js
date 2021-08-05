"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWebpackDev = exports.runWebpackBuild = void 0;
const webpack_1 = __importDefault(require("webpack"));
const uni_shared_1 = require("@dcloudio/uni-shared");
const config_1 = require("./config");
const alias_1 = require("./alias");
const initModuleAliasOnce = uni_shared_1.once(alias_1.initModuleAlias);
function runWebpack(mode, options) {
    initModuleAliasOnce();
    return new Promise((resolve, reject) => {
        const compiler = webpack_1.default(config_1.createConfig(mode, options), (err, stats) => {
            if (err) {
                return reject(err.stack || err);
            }
            if (stats.hasErrors()) {
                return reject(stats.toString());
            }
            if (stats.hasWarnings()) {
                const info = stats.toJson({ all: false, warnings: true });
                console.warn(info.warnings);
            }
            if (process.env.DEBUG) {
                console.log(stats.toString({
                    all: false,
                    assets: true,
                    colors: true, // 在控制台展示颜色
                    // timings: true,
                }));
            }
            resolve(compiler);
        });
    });
}
function runWebpackBuild(options = {}) {
    return runWebpack('production', options);
}
exports.runWebpackBuild = runWebpackBuild;
function runWebpackDev(options = {}) {
    return runWebpack('development', options);
}
exports.runWebpackDev = runWebpackDev;