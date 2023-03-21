import express from 'express';
import fs from 'fs'
import path from 'path'
const app = express();

function getFilePath(file: string): string {
    return path.join(__dirname, file);
}

// Initialize
const config = JSON.parse(fs.readFileSync(getFilePath("./config.json"), 'utf-8'));

const port: number = config.port as number ?? 8000;

const dirMap: Map<string, string> = new Map<string, string>();
for (let dir of config.dirMap) {
    dirMap.set(dir.dirId, dir.path);
}

app.get('/browser', (req, res) => {
    let list: Array<string> = new Array<string>();
    for (let dir of dirMap) {
        list.push(dir[0]);
    }
    res.json(list);
});

app.get('/browser/:dir', (req, res) => {
    let relativePath: string;
    relativePath = req.query.relativepath as string ?? '';

    let dir = req.params.dir;
    if (!dirMap.has(dir)) {
        res.sendStatus(404);
    }
    let dirPath: string = dirMap.get(dir) as string;
    dirPath = path.join(dirPath, relativePath);

    // 获取所有文件
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.sendStatus(404);
            console.log(err.message);
            return;
        }
        else {
            let dirList = new Array<string>();
            let fileList = new Array<string>();
            files.forEach(file => {
                try {
                    let stat: fs.Stats;
                    stat = fs.statSync(path.join(dirPath, file));
                    if (stat.isDirectory()) {
                        dirList.push(file);
                    }
                    else {
                        fileList.push(file);
                    }
                }
                catch (err) {
                    let error = err as Error;
                    console.log(error.message);
                }
            });
            let data = {
                'relativePath': relativePath,
                'dirList': dirList,
                'fileList': fileList
            };
            res.json(data);
        }
    });

});

app.get('/browser/:dir/file/:filename', (req, res) => {
    let relativePath: string;
    relativePath = req.query.relativepath as string ?? '';

    let dir = req.params.dir;
    if (!dirMap.has(dir)) {
        res.sendStatus(404);
    }

    let fileName = req.params.filename;
    if (!fileName) {
        res.sendStatus(404);
    }

    let dirPath: string = dirMap.get(dir) as string;
    dirPath = path.join(dirPath, relativePath);

    let options = {
        root: dirPath
    }

    res.sendFile(fileName, options);
});



app.listen(port, () => {
    console.log(`Leaf server is running on port ${port}!`);
})
