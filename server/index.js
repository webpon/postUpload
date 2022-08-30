const fs = require('fs')
let len = 0
const bufferList = fs.readdirSync('./upload').map((hash, index) => {
    const buffer = fs.readFileSync(`./upload/${index}`)
    len += buffer.length
    return buffer
});
//合并文件
const buffer = Buffer.concat(bufferList, len);
const ws = fs.createWriteStream(`./upload/xxx.jpg`)
ws.write(buffer);
ws.close();