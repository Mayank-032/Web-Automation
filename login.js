// node login.js --url="https://codeforces.com/" --config="config.json" --quesUrl="https://codeforces.com/problemset/problem/1600/F" --Cont="Yes"

let minimist = require('minimist');
let puppeteer = require('puppeteer');
let axios = require('axios');
let fs = require('fs');
let path = require('path');

let cookiesPath = "cookies.txt";

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

let FileTextString = fs.readFileSync("abc.txt", "utf-8");

SearchAndLogin(args.url, args.quesUrl);
async function SearchAndLogin(url, quesUrl) {
    try{
        let browser = await puppeteer.launch({
            defaultViewport: null,
            args: [
                "--start-maximized"
            ],
            headless: false
        });

        let pages = await browser.pages();
        let page = pages[0];

        page.goto(url);

        async function login(){
            try{
                let previousSession = fs.existsSync(cookiesPath)
                if (previousSession) {
                    let content = fs.readFileSync(cookiesPath);
                    let cookiesArr = JSON.parse(content);
                    if (cookiesArr.length !== 0) {
                        for (let cookie of cookiesArr) {
                            await page.setCookie(cookie)
                        }
                        console.log('Session has been loaded in the browser')
                    }
                }else{
                    
                    // searching 
                    await page.waitForSelector("a[href='/enter?back=%2F']");
                    await page.click("a[href='/enter?back=%2F']");

                    // to get focus on login section
                    await page.waitForSelector("input[value='Login']");
                    await page.click("input[value='Login']");

                    // Login in codeforces
                    await page.type("input[name='handleOrEmail']", configJSO.userid);
                    await page.type("input[id='password']", configJSO.password);

                    await page.click("input[id='remember']");
                    await page.click("input[value='Login']");
                        
                    await page.waitForNavigation();

                    let cookiesObject = await page.cookies()
                    fs.writeFileSync(cookiesPath, JSON.stringify(cookiesObject));
                    console.log('Session has been saved to ' + cookiesPath);
                }
            
                if(args.Cont === "Yes"){
                    page.goto(quesUrl);

                    async function submit(){
                        try{
                            await page.waitForSelector("a[href='/problemset/submit']");
                            await page.click("a[href='/problemset/submit']");

                            await page.waitForSelector("div.ace_content");
                            await page.click("div.ace_content");

                            await page.type("div.ace_content", FileTextString);

                            await page.waitForSelector("input[type='submit']");
                            await page.click("input[type='submit']");
                        } catch(e){
                            console.log("Code Error");
                        }

                        // browser.close();
                    }
                    
                    submit();
                }else{
                    await page.waitForSelector("a[href='/problemset']");
                    await page.click("a[href='/problemset']");
                }
            } catch (e) {
                console.log(e);
            }
        }

        login();
    } catch(err){
        console.log(err);
    }
}