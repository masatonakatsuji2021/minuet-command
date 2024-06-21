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
import * as readLine from "readline";
import * as fs from "fs";
import { Core } from "minuet-server";


export enum McliColor {
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    BLUE = "\x1b[34m",
    RESET = "\x1b[0m",
}

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

process.stdin.setEncoding('utf-8');

export class MinuetCLI {

    public out(text : string) : MinuetCLI{
        process.stdout.write(text);
        return this;
    }

    public outn(text : string) : MinuetCLI{
        process.stdout.write(text + "\n");
        return this;
    }

    public br() : MinuetCLI {
        this.outn("");
        return this;
    }

    public async in(text? : string, tag? : string) : Promise<string> {
        if (!tag){
            tag = ":"
        }
        if (text) this.out(text + " " + tag);
        return new Promise((resolve) => {
            rl.on('line', (input) => {
                input = input.trim();
                resolve(input);
            });
        });
    }

    public exit(){
        rl.close();
        rl.on('close', () => {
            process.exit(0);
        });
    }

}

export class MinuetCommand {

    private mcli : MinuetCLI;

    public constructor() {

        this.mcli = new MinuetCLI();

        (async ()=>{
            this.mcli.outn("--- Minuet Ver 1.0.0 -------------------")
                .br()
            ;

            this.startCheck();

            await this.menu();
    
            this.mcli.exit();

        })();
    }

    private async startCheck() {
        const rootPath = Core.rootDir;
        this.mcli.outn("# root = " + rootPath);

        let existDirectory : boolean = false;
        if (fs.existsSync(rootPath)){
            if (fs.statSync(rootPath).isDirectory()){
                this.mcli.outn("# already OK.");
                existDirectory = true;
            }
        }

        if (!existDirectory){
            this.mcli.outn("# RootDirectory not found, mkdir " + rootPath);
            fs.mkdirSync(rootPath);
        }

        let existsInitDir : boolean = false;
        const initDir = Core.initDir;
        if (fs.existsSync(initDir)) {
            if (fs.statSync(initDir).isDirectory()){
                existsInitDir = true;
            }
        }

        if (!existsInitDir){
            this.mcli.outn("# Conf Directory not found, mkdir " + initDir);
            fs.mkdirSync(initDir);
        }

        
        let existsInitFile : boolean = false;
        const initFile = Core.initPath;
        if (fs.existsSync(initFile)) {
            if (fs.statSync(initFile).isFile()){
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
    }

    private async menu() {

        this.mcli.br();

        let cmd : string;
        while(!cmd) {
            cmd = await this.mcli.in("Prease Command", ">");
            if (!cmd){
                this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter command. retry.");
                continue;
            }

            if (cmd == "sector-create") {
                await this.createSector();
                break;
            }
            else {
                this.mcli.out("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "\"" + cmd + "\" is not exist command. retry.");
                cmd = null;
                continue;
            }
        }




    }

    private async createSector() {
        this.mcli.br().outn("[Sector Create]").br();

        let data : any = {};

        let name : string;
        while(!name) {
            name = await this.mcli.in("Q. Create Sector Name?");
            if (!name) {
                this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter Sector Name. retry.");
                continue;
            }
        }

        data.name = name;

        let type : string;
        while(!type) {
            type = await this.mcli.in("Q. Select Server Type. [http, https, webSocket, webSocketSSL] (http)");
            if (!type) {
                type = "http";
            }
            if (!(
                type == "http" ||
                type == "https" || 
                type == "webSocket" || 
                type == "webSocketSSL"
            )) {
                this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not select Sector Server Type. retry.");
                continue;
            }
        }

        data.type = type;

        let host : string;
        while(!host){
            host = await this.mcli.in("Q. Server Host Name?");
            if (!name) {
                this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter Server Host Name. retry.");
                continue;
            }
        }

        data.host = host;

        let port : string;
        while(!port) {
            port = await this.mcli.in("Q. Server Port Number?");
            if (!port){
                this.mcli.outn("  " + McliColor.RED + "[ERROR] " + McliColor.RESET + "not enter Server port Number. retry.");
                continue;
            }
        }

        data.port = parseInt(port);

        if (data.type == "http" || data.type == "webSocket") {
            data.ssl = false;
            data.sslStr = "#ssl : \n  key: ssl/server.key\n  cert: ssl/server.crt";
        }

        let module : string = await this.mcli.in("Q. Specify the server module to be used. Multiple selection possible with \",\" ()");

        data.modules = module.split(",");

        this.mcli.br().outn("Create a sector with the following content:").br();



        console.log(data);

    }

}