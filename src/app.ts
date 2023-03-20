import express from 'express';
import fs from 'fs'
import path from 'path'
const app = express();
const port: number = 8000;

const folderPath = "./";

let array: string[] =  fs.readdirSync(folderPath).map(fileName => {
    return path.join(folderPath, fileName);
});

array.forEach(item => {
    console.log(item);
});
