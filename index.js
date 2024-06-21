"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinuetCommand = exports.MinuetCLI = exports.McliColor = void 0;
/**
 * MIT License
 *
 * Copyright (c) 2024 Masato Nakatsuji
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
const readLine = require("readline");
const fs = require("fs");
const minuet_server_1 = require("minuet-server");
var McliColor;
(function (McliColor) {
    McliColor["RED"] = "\u001B[31m";
    McliColor["GREEN"] = "\u001B[32m";
    McliColor["BLUE"] = "\u001B[34m";
    McliColor["RESET"] = "\u001B[0m";
})(McliColor || (exports.McliColor = McliColor = {}));
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});
process.stdin.setEncoding('utf-8');
class MinuetCLI {
    out(text) {
        process.stdout.write(text);
        return this;
    }
    outn(text) {
        process.stdout.write(text + "\n");
        return this;
    }
    br() {
        this.outn("");
        return this;
    }
    in(text, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tag) {
                tag = ":";
            }
            if (text)
                this.out(text + " " + tag);
            return new Promise((resolve) => {
                rl.on('line', (input) => {
                    input = input.trim();
                    resolve(input);
                });
            });
        });
    }
    exit() {
        rl.close();
        rl.on('close', () => {
            process.exit(0);
        });
    }
}
exports.MinuetCLI = MinuetCLI;
class MinuetCommand {
    constructor() {
        this.mcli = new MinuetCLI();
        (() => __awaiter(this, void 0, void 0, function* () {
            this.mcli.outn("--- Minuet Ver 1.0.0 -------------------")
                .br();
            this.startCheck();
            yield this.menu();
            this.mcli.exit();
        }))();
    }
    startCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            const rootPath = minuet_server_1.Core.rootDir;
            this.mcli.outn("# root = " + rootPath);
            let existDirectory = false;
            if (fs.existsSync(rootPath)) {
                if (fs.statSync(rootPath).isDirectory()) {
                    this.mcli.outn("# already OK.");
                    existDirectory = true;
                }
            }
            if (!existDirectory) {
                this.mcli.outn("# RootDirectory not found, mkdir " + rootPath);
                fs.mkdirSync(rootPath);
            }
            let existsInitDir = false;
            const initDir = minuet_server_1.Core.initDir;
            if (fs.existsSync(initDir)) {
                if (fs.statSync(initDir).isDirectory()) {
                    existsInitDir = true;
                }
            }
            if (!existsInitDir) {
                this.mcli.outn("# Conf Directory not found, mkdir " + initDir);
                fs.mkdirSync(initDir);
            }
            let existsInitFile = false;
            const initFile = minuet_server_1.Core.initPath;
            if (fs.existsSync(initFile)) {
                if (fs.statSync(initFile).isFile()) {
                    existsInitFile = true;
                }
            }
            if (!existsInitFile) {
                this.mcli.outn("# init.yaml File not found, create " + initFile);
                let content = fs.readFileSync(__dirname + "/template/init.yaml").toString();
                content = content.split("{processTitle}").join("minuet-server");
                content = content.split("{loadBalancer-type}").join("RoundRobin");
                content = content.split("{loadBalancer-maps}").join("    - mode: WorkerThreads\n    - clone: auto");
                content = content.split("{sectorParts}").join("");
                fs.writeFileSync(initFile, content);
            }
        });
    }
    menu() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mcli.br();
            let cmd;
            while (!cmd) {
                cmd = yield this.mcli.in("Prease Command", ">");
                if (!cmd) {
                    this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter command. retry.");
                    continue;
                }
                if (cmd == "sector-create") {
                    yield this.createSector();
                    break;
                }
                else {
                    this.mcli.out("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "\"" + cmd + "\" is not exist command. retry.");
                    cmd = null;
                    continue;
                }
            }
        });
    }
    createSector() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mcli.br().outn("[Sector Create]").br();
            let data = {};
            let name;
            while (!name) {
                name = yield this.mcli.in("Q. Create Sector Name?");
                if (!name) {
                    this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter Sector Name. retry.");
                    continue;
                }
            }
            data.name = name;
            let type;
            while (!type) {
                type = yield this.mcli.in("Q. Select Server Type. [http, https, webSocket, webSocketSSL] (http)");
                if (!type) {
                    type = "http";
                }
                if (!(type == "http" ||
                    type == "https" ||
                    type == "webSocket" ||
                    type == "webSocketSSL")) {
                    this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not select Sector Server Type. retry.");
                    continue;
                }
            }
            data.type = type;
            let host;
            while (!host) {
                host = yield this.mcli.in("Q. Server Host Name?");
                if (!name) {
                    this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter Server Host Name. retry.");
                    continue;
                }
            }
            data.host = host;
            let port;
            while (!port) {
                port = yield this.mcli.in("Q. Server Port Number?");
                if (!port) {
                    this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter Server port Number. retry.");
                    continue;
                }
            }
            data.port = parseInt(port);
            if (data.type == "http" || data.type == "webSocket") {
                data.ssl = false;
                data.sslStr = "#ssl : \n  key: ssl/server.key\n  cert: ssl/server.crt";
            }
            let module = yield this.mcli.in("Q. 使用するサーバーモジュールを指定。「,」で複数選択可 ()");
            data.modules = module.split(",");
            this.mcli.br().outn("Create a sector with the following content:").br();
            console.log(data);
        });
    }
}
exports.MinuetCommand = MinuetCommand;
