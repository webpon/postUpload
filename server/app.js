

const http = require('http');
const fs = require('fs');
const path = require('path')
const busboy = require('busboy');

http.createServer((req, res) => {
    // 处理跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", 'X-Requested-With, Content-Type');
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    const contentType = req.headers['content-type']
    console.log('------------请求类型------------');
    console.log(req.method + '|' + contentType);
    if (req.method === "OPTIONS") {
        res.status = 200
        res.end('')
    } else if (req.method === 'GET') {
        res.writeHead(200, { Connection: 'close' });
        res.end('welcome!');
    }
    else if (req.method === 'POST') {
        console.log('POST request');
        // post请求类型
        const formDataReg = /multipart\/form-data/g
        const isFormData = formDataReg.test(contentType)
        if (isFormData) {
            const bb = busboy({ headers: req.headers });
            const filedObj = {}
            // 如果是文件类型触发
            bb.on('file', (name, file, info) => {
                const { filename, encoding, mimeType } = info;
                console.log(
                    `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                    filename,
                    encoding,
                    mimeType
                );
                let arr = [];
                if (filename) {
                    arr = filename.toString().split('.');//对传递的文件名进行拆分
                    const pathData = parseInt(Date.parse(new Date()).toString().substr(0, 10));//文件名＋十位时间戳.文件类型
                    const uploadDir = path.resolve(__dirname, './upload', pathData + '.' + arr[arr.length - 1]);
                    console.log('------------文件保存位置------------');
                    console.log(uploadDir);
                    file.pipe(fs.createWriteStream(uploadDir));//利用fs模块创建可以写入的流,并指定保存路径和名称
                }
            });
            bb.on('field', (name, val, info) => {
                console.log(`Field [${name}]: value: %j`, val);
                // 记录表单数据
                filedObj[name] = val
            });
            bb.on('close', () => {
                console.log('数据解析完毕');
                res.writeHead(303, { Connection: 'close', Location: '/' });
                console.log(filedObj);
                res.end(JSON.stringify(filedObj));
            });
            req.pipe(bb);
        } else {
            // 定义了一个post变量，用于暂存请求体的信息
            var post = '';
            // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
            req.on('data', function (chunk) {
                post += chunk;
            });
            // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
            req.on('end', function () {
                console.log('------------接收到以下信息------------');
                console.log(post);
                res.end(post);
            });
        }
    }
}).listen(8080, () => {
    console.log('Listening 8080端口');
});
